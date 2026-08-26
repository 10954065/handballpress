import 'server-only'
import { hash, verify } from '@node-rs/argon2'

// OWASP-recommended Argon2id parameters for interactive login (~19 MiB, t=2, p=1).
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS)
}

export function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  return verify(hashedPassword, password, ARGON2_OPTIONS)
}
