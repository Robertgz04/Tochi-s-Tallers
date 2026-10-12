import bcrypt from 'bcrypt';

const ROUNDS = 10;

export async function hashPassword(contrasenaPlana: string): Promise<string> {
  return bcrypt.hash(contrasenaPlana, ROUNDS);
}

export async function verificarPassword(
  contrasenaPlana: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(contrasenaPlana, hash);
}
