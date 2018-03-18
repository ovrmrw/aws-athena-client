import { S3 } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import * as fs from 'fs';
import * as path from 'path';

export class S3Client {
  private s3: S3;

  constructor() {
    this.s3 = this.initializeS3SDK();
  }

  downloadResultFile(s3Path: string, outputDir: string): Promise<string> {
    const _s3Path = s3Path.replace('s3://', '');
    const [bucket, ...keys] = _s3Path.split('/');
    const filename = keys[keys.length - 1];
    const writableFilepath = path.join(path.resolve(), outputDir, filename);
    const ws = fs.createWriteStream(writableFilepath);
    return new Promise((resolve, reject) => {
      const params: GetObjectRequest = {
        Bucket: bucket,
        Key: keys.join('/')
      };
      this.s3.getObject(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        ws.write(data.Body);
        ws.end();
      });
      ws.once('close', () => {
        console.log('WriteStream is closed.');
        resolve(writableFilepath);
      });
    });
  }

  private initializeS3SDK(): S3 {
    const s3 = new S3();
    if (s3) {
      return s3;
    } else {
      throw new Error('S3 instance is not created.');
    }
  }
}
