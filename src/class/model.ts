import {Client} from 'pg';
import {Crypto} from './crypto';

export class Model {
  protected conn: Client;
  protected crypto: Crypto;
  constructor(conn: Client, crypto: Crypto) {
    this.conn = conn;
    this.crypto = crypto;
  }
}
