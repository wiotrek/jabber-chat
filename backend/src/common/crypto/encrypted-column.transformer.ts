import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';
import type { ValueTransformer } from 'typeorm';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Derives (or loads) the 32-byte AES-256 key used to encrypt column values at
 * rest. In production MESSAGE_ENCRYPTION_KEY must be set to a base64-encoded
 * 32-byte secret (e.g. `openssl rand -base64 32`). Outside production, a
 * deterministic key is derived instead so local/dev setups work out of the box.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.MESSAGE_ENCRYPTION_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MESSAGE_ENCRYPTION_KEY must be set in production (base64-encoded 32-byte key).',
      );
    }
    return scryptSync('jabber-chat-dev-secret', 'jabber-chat-dev-salt', 32);
  }

  const key = Buffer.from(secret, 'base64');
  if (key.length !== 32) {
    throw new Error(
      'MESSAGE_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded AES-256 key).',
    );
  }
  return key;
}

/**
 * TypeORM column transformer that transparently encrypts string column values
 * with AES-256-GCM before they hit the database, and decrypts them on read.
 * Stored format: `<iv>:<authTag>:<ciphertext>`, each part base64-encoded.
 */
export class EncryptedColumnTransformer implements ValueTransformer {
  to(value?: string | null): string | undefined | null {
    if (value == null) return value;

    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, ciphertext]
      .map((part) => part.toString('base64'))
      .join(':');
  }

  from(value?: string | null): string | undefined | null {
    if (value == null) return value;

    const [ivB64, authTagB64, ciphertextB64] = value.split(':');
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
      // Not in the expected encrypted format; return as-is rather than throw.
      return value;
    }

    const key = getEncryptionKey();
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, 'base64')),
      decipher.final(),
    ]);
    return plaintext.toString('utf8');
  }
}
