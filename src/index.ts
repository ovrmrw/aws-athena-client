import { setAWSConfig } from './aws-config';
import { AthenaClient } from './athena-client';
import { S3Client } from './s3-client';
import { makeDir } from './helpers';

setAWSConfig();
makeDir('downloads');
const athenaClient = new AthenaClient();
const s3Client = new S3Client();

const query = `
  SELECT * FROM "arangodb_example_datasets"."random_users" LIMIT 100;
`;

athenaClient
  .execute(query)
  .then(outputLocation => s3Client.downloadResultFile(outputLocation, 'downloads'))
  .then(downloadedFilepath => console.log('Created:', downloadedFilepath))
  .catch(console.error);
