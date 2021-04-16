import {Client} from 'pg';
import {Crypto} from '../class/crypto';
import {Model} from '../class/model';

export class Users extends Model {
  constructor(conn: Client, crypto: Crypto) {
    super(conn, crypto);
    this.conn.query(
      'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, bits TEXT)'
    );
  }
  async create(id: bigint, bits: string) {
    await this.conn.query('INSERT INTO users VALUES ($1, $2)', [
      this.crypto.hash(id.toString()),
      bits,
    ]);
  }
  async fetch(id: bigint) {
    const r = await this.conn.query('SELECT bits FROM users WHERE id = $1', [
      this.crypto.hash(id.toString()),
    ]);
    if (r.rowCount > 0) {
      return {
        bits: r.rows[0].bits,
      };
    } else return null;
  }
}
