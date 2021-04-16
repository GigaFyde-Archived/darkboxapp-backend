import {
  createHmac,
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
  BinaryLike,
} from 'crypto';
import {sign} from 'jsonwebtoken';
import {hash, genSalt} from 'bcrypt';

export interface Payload {
  id: bigint;
  bits: string;
}

interface Settings {
  ivLength: number;
  saltLength: number;
  tagLength: number;
  tagPosition: number;
  encryptedPosition: number;
}

export class Crypto {
  public key: string;
  private settings: Settings;
  constructor(key: string) {
    this.key = key;
    this.settings = {
      ivLength: 16,
      saltLength: 64,
      tagLength: 16,
      tagPosition: 80,
      encryptedPosition: 96,
    };
  }
  private generateKey(salt: BinaryLike) {
    return pbkdf2Sync(this.key, salt, 100000, 32, 'sha512');
  }
  hash(data: string): string {
    return createHmac('sha256', this.key).update(data).digest('hex');
  }
  encrypt(data: string): string {
    const iv = randomBytes(this.settings.ivLength);
    const salt = randomBytes(this.settings.saltLength);
    const cipher = createCipheriv('aes-256-gcm', this.generateKey(salt), iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([salt, iv, cipher.getAuthTag(), encrypted]).toString(
      'hex'
    );
  }
  decrypt(data: string): string {
    const buffer = Buffer.from(data, 'hex');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.generateKey(buffer.slice(0, this.settings.saltLength)),
      buffer.slice(this.settings.saltLength, this.settings.tagPosition)
    );
    decipher.setAuthTag(
      buffer.slice(this.settings.tagPosition, this.settings.encryptedPosition)
    );
    return (
      decipher.update(buffer.slice(this.settings.encryptedPosition)) +
      decipher.final('utf-8')
    );
  }
  async token(id: bigint): Promise<[string, string]> {
    const bits = await hash(randomBytes(128).toString('hex'), await genSalt());
    return [bits, sign({id: id.toString(), bits}, this.key)];
  }
}
