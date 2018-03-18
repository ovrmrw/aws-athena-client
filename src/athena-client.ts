import { Athena } from 'aws-sdk';
import {
  StartQueryExecutionInput,
  QueryExecutionId,
  GetQueryExecutionInput,
  GetQueryResultsInput,
  GetQueryResultsOutput,
  QueryExecution,
  ResultConfiguration
} from 'aws-sdk/clients/athena';
import * as moment from 'moment';

export class AthenaClient {
  private athena: Athena;
  private timeout: number;
  private outputLocation: string;

  constructor(options?: { timeout?: number }) {
    const o = options || {};
    this.timeout = o.timeout || 1000 * 30;
    this.athena = this.initializeAthenaSDK();
    this.outputLocation = 's3://aws-athena-query-results-by-api/' + moment().format('YYYY/MM/DD');
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

  getQueryResults(queryExecutionId: QueryExecutionId): Promise<GetQueryResultsOutput> {
    if (!queryExecutionId) {
      throw new Error('Fill the QueryExecutionId');
    }
    return new Promise((resolve, reject) => {
      const params: GetQueryResultsInput = {
        QueryExecutionId: queryExecutionId
      };
      this.athena.getQueryResults(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  async execute(query?: string): Promise<string> {
    const _query = query || `SELECT * FROM "arangodb_example_datasets"."random_users";`;
    const startTime = Date.now();
    let isSucceeded = false;
    let queryExecution: QueryExecution = {} as any;
    const queryExecutionId = await this.startQueryExecution(_query);
    while (Date.now() - startTime < this.timeout) {
      queryExecution = await this.getQueryExecution(queryExecutionId);
      const status = queryExecution.Status || {};
      if (status.State === 'SUCCEEDED') {
        isSucceeded = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (isSucceeded) {
      console.log('Result:', {
        status: queryExecution.Status,
        query: queryExecution.Query,
        resultConfiguration: queryExecution.ResultConfiguration,
        statistics: queryExecution.Statistics
      });
    } else {
      console.log('TIMEOUT');
    }
    const resultConfiguration: ResultConfiguration =
      queryExecution.ResultConfiguration || ({} as any);
    return resultConfiguration.OutputLocation;
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
