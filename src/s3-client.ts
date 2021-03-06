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
      const rs = this.s3.getObject(params).createReadStream();
      rs.on('data', chunk => {
        if (!ws.write(chunk)) {
          rs.pause();
          ws.once('drain', () => rs.resume());
        }
      });
      rs.on('error', reject);
      rs.on('end', () => ws.end());
      ws.on('error', reject);
      ws.on('finish', () => {
        console.log('WriteStream is finished.');
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
