import { setAWSConfig } from './aws-config';
import { AthenaClient } from './athena-client';
import { S3Client } from './s3-client';
import { makeDir, getQuery } from './helpers';

setAWSConfig();
makeDir('downloads');
const athenaClient = new AthenaClient();
const s3Client = new S3Client();

const createTableQuery = getQuery('query-create-table.sql');
const selectQuery = getQuery('query-select.sql');

athenaClient
  .execute(createTableQuery)
  .then(() => athenaClient.execute(selectQuery))
  .then(outputLocation => s3Client.downloadResultFile(outputLocation, 'downloads'))
  .then(downloadedFilepath => console.log('Created:', downloadedFilepath))
  .catch(console.error);
