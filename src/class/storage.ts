import {mkdir, writeFile, readFile} from 'fs/promises';
import {Crypto} from './crypto';
import fetch from 'node-fetch';
import {existsSync} from 'fs';
import AWS from 'aws-sdk';

export interface StorageConfig {
  path: string;
  type: 'file' | 's3';
}

export class Storage {
  private s3?: AWS.S3;
  private config: StorageConfig;
  private crypto: Crypto;
  constructor(config: StorageConfig, crypto: Crypto) {
    this.config = config;
    this.crypto = crypto;
  }
  async create(id: string, content: string): Promise<string> {
    let path = '';
    switch (this.config.type) {
      case 'file':
        path = `${this.config.path}/${this.crypto.hash(id)}`;
        await writeFile(path, this.crypto.encrypt(content), {
          encoding: 'utf-8',
        });
        return path;
      case 's3':
        return (await this.s3
          ?.upload({
            ACL: 'public-read',
            Bucket: 'darkbox',
            Key: this.crypto.hash(id),
            Body: Buffer.from(this.crypto.encrypt(content)),
          })
          .promise()
          .then(d => d.Location)) as string;
      default:
        throw new Error('Invalid storage type');
    }
  }
  async read(path: string): Promise<string> {
    switch (this.config.type) {
      case 'file':
        return this.crypto.decrypt(await readFile(path, {encoding: 'binary'}));
      case 's3':
        return fetch(path, {method: 'GET'}).then(async r =>
          this.crypto.decrypt(await r.text())
        );
      default:
        throw new Error('Invalid storage type');
    }
  }
  async initialize() {
    switch (this.config.type) {
      case 'file':
        if (!existsSync(this.config.path)) await mkdir(this.config.path);
        break;
      case 's3':
        AWS.config.loadFromPath(this.config.path);
        this.s3 = new AWS.S3({apiVersion: 'latest'});
        await this.s3?.createBucket({Bucket: 'darkbox'}).promise();
        break;
      default:
        throw new Error('Invalid storage type');
    }
  }
}
