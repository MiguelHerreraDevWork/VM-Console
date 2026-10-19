import { hash as argonHash, hashSync, verify as argonVerify } from '@node-rs/argon2';

const argonOptions = {
  // Algorithm.Argon2id — numeric because @node-rs/argon2 exports a const enum
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/** Used when the email does not exist, to keep login timing similar. */
export const DUMMY_PASSWORD_HASH = hashSync(
  'timing-equalization-placeholder',
  argonOptions,
);

export async function hashPassword(password: string): Promise<string> {
  return argonHash(password, argonOptions);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argonVerify(hash, password, argonOptions);
}
