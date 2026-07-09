import bcrypt from "bcryptjs";

// Pure-JS bcrypt (no native build) so it runs on any host, incl. Hostinger.
const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
