import * as path from 'path';
import * as os from 'os';
import * as AWS from 'aws-sdk';

export interface AWSAuthenticationConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

const configFile = path.join(os.homedir(), '.aws', 'nodejs', 'config.json');

const [, , accountName = ''] = process.argv;

export function setAWSConfig(): void {
  let result = { accessKeyId: '', secretAccessKey: '', region: '' };
  try {
    const config = require(configFile);
    const hasMultiAccounts: boolean = !config.accessKeyId && !config.secretAccessKey;
    if (hasMultiAccounts && accountName) {
      result = { ...result, ...config[accountName] };
    } else if (hasMultiAccounts && !accountName) {
      let firstConfig;
      Object.keys(config).forEach((key, index) => {
        if (index === 0) {
          firstConfig = config[key];
        }
      });
      result = { ...result, ...firstConfig };
    } else {
      result = { ...result, ...config };
    }
  } catch (err) {
    throw err;
  }
  AWS.config.accessKeyId = result.accessKeyId;
  AWS.config.secretAccessKey = result.secretAccessKey;
  AWS.config.region = result.region;
  AWS.config.apiVersions = {
    athena: '2017-05-18',
    s3: '2006-03-01'
  };
}
