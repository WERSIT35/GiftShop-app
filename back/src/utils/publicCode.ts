import crypto from 'crypto';

const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateRandomCode(length = 6, alphabet: string = DEFAULT_ALPHABET): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

export async function generateUniqueCode(
  model: { exists: (query: any) => Promise<any> },
  opts?: { length?: number; field?: string }
): Promise<string> {
  const length = opts?.length ?? 6;
  const field = opts?.field ?? 'code';

  for (let attempt = 0; attempt < 25; attempt++) {
    const code = generateRandomCode(length);
    const exists = await model.exists({ [field]: code });
    if (!exists) return code;
  }

  throw new Error('Failed to generate a unique code. Please try again.');
}
