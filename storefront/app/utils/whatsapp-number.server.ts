import fs from 'node:fs';
import path from 'node:path';

export function resolveWhatsappNumber() {
  let whatsappNumber = process.env.WHATSAPP_NUMBER ?? null;
  if (!whatsappNumber) {
    const cwdEnvPath = path.resolve(process.cwd(), '.env');
    const altEnvPath = path.resolve(process.cwd(), 'storefront', '.env');
    const envPath = fs.existsSync(cwdEnvPath) ? cwdEnvPath : altEnvPath;
    if (fs.existsSync(envPath)) {
      const contents = fs.readFileSync(envPath, 'utf8');
      const match = contents.match(/^\s*WHATSAPP_NUMBER\s*=\s*(.*)\s*$/m);
      if (match?.[1]) {
        whatsappNumber = match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return whatsappNumber?.replace(/\D/g, '') ?? null;
}
