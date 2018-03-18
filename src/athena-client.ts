import { Athena } from 'aws-sdk';
import {
  StartQueryExecutionInput,
  QueryExecutionId,
  GetQueryExecutionInput,
  QueryExecution
} from 'aws-sdk/clients/athena';
import * as moment from 'moment';

export class AthenaClient {
  private athena: Athena;
  private timeout: number;
  private outputLocation: string;

  constructor(options?: { timeout?: number }) {
    const o = options || {};
    this.timeout = o.timeout || 1000 * 60;
    this.athena = this.initializeAthenaSDK();
    this.outputLocation = 's3://aws-athena-query-results-by-api/' + moment().format('YYYY/MM/DD');
  }

  async execute(query: string): Promise<string> {
    const queryExecutionId = await this.startQueryExecution(query);
    const queryExecution = await this.waitQueryExecution(queryExecutionId);
    const status = queryExecution.Status || {};
    if (status.State === 'SUCCEEDED') {
      console.log('Result:', {
        Status: status,
        Query: queryExecution.Query,
        ResultConfiguration: queryExecution.ResultConfiguration,
        Statistics: queryExecution.Statistics
      });
    } else {
      console.log('Result:', status);
    }
    const resultConfiguration = queryExecution.ResultConfiguration;
    return resultConfiguration ? resultConfiguration.OutputLocation : '';
  }

  private async waitQueryExecution(queryExecutionId: QueryExecutionId): Promise<QueryExecution> {
    let queryExecution: QueryExecution = {};
    const startTime = Date.now();
    while (Date.now() - startTime < this.timeout) {
      queryExecution = await this.getQueryExecution(queryExecutionId);
      const status = queryExecution.Status || {};
      const state = status.State;
      if (state === 'SUCCEEDED' || state === 'FAILED' || state === 'CANCELLED') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return queryExecution;
  }

  private startQueryExecution(query: string): Promise<QueryExecutionId> {
    return new Promise((resolve, reject) => {
      const params: StartQueryExecutionInput = {
        QueryString: query,
        ResultConfiguration: {
          OutputLocation: this.outputLocation
        }
      };
      this.athena.startQueryExecution(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const queryExectionId: QueryExecutionId = data.QueryExecutionId || '';
        console.log('QueryExectionId:', queryExectionId);
        resolve(queryExectionId);
      });
    });
  }

  private getQueryExecution(queryExecutionId: QueryExecutionId): Promise<QueryExecution> {
    if (!queryExecutionId) {
      throw new Error('Fill the QueryExecutionId');
    }
    return new Promise((resolve, reject) => {
      const params: GetQueryExecutionInput = {
        QueryExecutionId: queryExecutionId
      };
      this.athena.getQueryExecution(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const queryExecution = data.QueryExecution || {};
        const status = queryExecution.Status || {};
        console.log('State:', status.State);
        resolve(queryExecution);
      });
    });
  }

  private initializeAthenaSDK(): Athena {
    const athena = new Athena();
    if (athena) {
      return athena;
    } else {
      throw new Error('Athena instance is not created.');
    }
  }
}
