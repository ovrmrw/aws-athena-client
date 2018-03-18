# aws-athena-client
An Athena client for my personal use. Send query to the Athena then download the result file from S3.

---

## Prepare

Create `{HOME_DIR}/.aws/nodejs/config.json` file for your environment. (ref: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-json-file.html )

## Setup

```
$ npm install
```

## Run

```
$ npm start 
```

### std-out example

```
$ npm start

QueryExectionId: 7d6f9bbd-92fe-4d75-996b-0d05e511edcf
State: RUNNING
State: RUNNING
State: RUNNING
State: RUNNING
State: SUCCEEDED
Result: { status: 
   { State: 'SUCCEEDED',
     SubmissionDateTime: 2018-03-18T12:41:41.438Z,
     CompletionDateTime: 2018-03-18T12:41:43.621Z },
  query: 'SELECT * FROM "arangodb_example_datasets"."random_users" LIMIT 100',
  resultConfiguration: 
   { OutputLocation: 's3://aws-athena-query-results-by-api/2018/03/18/7d6f9bbd-92fe-4d75-996b-0d05e511edcf.csv' },
  statistics: { EngineExecutionTimeInMillis: 1849, DataScannedInBytes: 40785 } }
WriteStream is closed.
Created: /Users/user/nodejs/aws-athena-client/downloads/7d6f9bbd-92fe-4d75-996b-0d05e511edcf.csv
```
