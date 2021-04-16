import {Client} from 'pg';
import {Crypto} from '../class/crypto';
import {Model} from '../class/model';

export class Posts extends Model {
  constructor(conn: Client, crypto: Crypto) {
    super(conn, crypto);
    this.conn.query(
      `CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY, location TEXT, language TEXT
        )`
    );
  }
  async create(id: string, location: string, language: string) {
    await this.conn.query('INSERT INTO posts VALUES ($1, $2, $3)', [
      this.crypto.hash(id),
      this.crypto.encrypt(location),
      this.crypto.encrypt(language),
    ]);
  }
  async fetch(id: string) {
    const r = await this.conn.query(
      'SELECT location, language FROM posts WHERE id = $1',
      [this.crypto.hash(id)]
    );
    if (r.rowCount > 0) {
      return {
        location: this.crypto.decrypt(r.rows[0].location),
        language: this.crypto.decrypt(r.rows[0].language),
      };
    } else return null;
  }
}
