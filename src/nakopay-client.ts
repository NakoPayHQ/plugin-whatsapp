/**
 * NakoPay API client for the WhatsApp bot.
 */

import { config } from './config';
import crypto from 'crypto';

const VERSION = '0.1.0';
const SIG_TOLERANCE = 300;

// v1 paths are pass-through kebab-case on every supported base URL
// (Supabase functions base today, api.nakopay.com in the future).
function resolveEndpoint(name: string): string {
  return name;
}

async function apiRequest(method: string, endpoint: string, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url = `${config.NAKOPAY_API_BASE.replace(/\/$/, '')}/${resolveEndpoint(endpoint)}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.NAKOPAY_API_KEY}`,
    'Accept': 'application/json',
    'User-Agent': `NakoPay-WhatsApp/${VERSION}`,
    'X-NakoPay-Version': '2025-04-20',
  };

  const opts: RequestInit = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    headers['Idempotency-Key'] = `idem_${crypto.randomBytes(16).toString('hex')}`;
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(url, opts);
  const json = await resp.json() as Record<string, unknown>;
  return { ...json, _ok: resp.ok, _status: resp.status };
}

export async function createInvoice(args: {
  amount: string;
  currency: string;
  coin?: string;
  description?: string;
  customerPhone?: string;
}): Promise<Record<string, unknown>> {
  return apiRequest('POST', 'invoices-create', {
    amount: args.amount,
    currency: args.currency.toUpperCase(),
    coin: (args.coin ?? 'BTC').toUpperCase(),
    description: args.description ?? 'WhatsApp invoice',
    metadata: { source: 'whatsapp', customer_phone: args.customerPhone ?? '' },
  });
}

export async function getInvoice(id: string): Promise<Record<string, unknown>> {
  return apiRequest('GET', `invoices-get?id=${encodeURIComponent(id)}`);
}

export async function getBalance(): Promise<Record<string, unknown>> {
  return apiRequest('GET', 'wallets-balance');
}

export async function getRates(): Promise<Record<string, unknown>> {
  return apiRequest('GET', 'rates');
}

export function verifyWebhookSignature(rawBody: string, sigHeader: string): boolean {
  const secret = config.NAKOPAY_WEBHOOK_SECRET;
  if (!secret || !sigHeader) return false;

  const parts: Record<string, string> = {};
  for (const kv of sigHeader.split(',')) {
    const trimmed = kv.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    parts[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }

  if (!parts.t || !parts.v1) return false;

  const t = parseInt(parts.t, 10);
  if (Math.abs(Math.floor(Date.now() / 1000) - t) > SIG_TOLERANCE) return false;

  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}
