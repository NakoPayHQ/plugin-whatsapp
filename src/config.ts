/**
 * Configuration from environment variables.
 */

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`${key} environment variable is required`);
  return val;
}

export const config = {
  // WhatsApp Business Cloud API
  WHATSAPP_TOKEN: requireEnv('WHATSAPP_TOKEN'),
  WHATSAPP_PHONE_NUMBER_ID: requireEnv('WHATSAPP_PHONE_NUMBER_ID'),
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'nakopay-verify',

  // NakoPay
  NAKOPAY_API_KEY: requireEnv('NAKOPAY_API_KEY'),
  NAKOPAY_WEBHOOK_SECRET: process.env.NAKOPAY_WEBHOOK_SECRET || '',
  NAKOPAY_API_BASE: process.env.NAKOPAY_API_BASE || 'https://daslrxpkbkqrbnjwouiq.supabase.co/functions/v1',

  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
};
