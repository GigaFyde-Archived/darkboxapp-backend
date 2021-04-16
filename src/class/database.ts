import {Crypto} from './crypto';
import {Client, ConnectionConfig} from 'pg';
import {Posts} from '../model/post';
import {Users} from '../model/user';

export class Database {
  private conn: Client;
  private crypto: Crypto;
  public posts!: Posts;
  public users!: Users;
  constructor(config: ConnectionConfig, crypto: Crypto) {
    this.conn = new Client(config);
    this.crypto = crypto;
  }
  async connect() {
    await this.conn.connect();
    this.posts = new Posts(this.conn, this.crypto);
    this.users = new Users(this.conn, this.crypto);
  }
}
