/**
 * NakoPay webhook handler - receives payment confirmations
 * and sends notification messages to the customer via WhatsApp.
 */

import { verifyWebhookSignature } from './nakopay-client';
import { sendTextMessage } from './whatsapp-client';

interface WebhookResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleNakoPayWebhook(rawBody: string, sigHeader: string): Promise<WebhookResult> {
  if (!verifyWebhookSignature(rawBody, sigHeader)) {
    return { status: 401, body: { error: 'Invalid signature' } };
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.type as string;
  const invoice = payload.data as Record<string, unknown>;
  const customerPhone = (invoice.metadata as Record<string, string>)?.customer_phone;

  if (!customerPhone) {
    // No phone number in metadata - can't notify, but acknowledge
    return { status: 200, body: { ok: true, notified: false } };
  }

  switch (eventType) {
    case 'invoice.paid':
      await sendTextMessage({
        to: customerPhone,
        text: `Payment confirmed!\n\nInvoice: ${invoice.id}\nAmount: ${invoice.amount} ${invoice.currency}\nTransaction: ${invoice.txid ?? 'pending'}\n\nThank you for your payment.`,
      });
      break;

    case 'invoice.expired':
      await sendTextMessage({
        to: customerPhone,
        text: `Invoice expired.\n\nInvoice: ${invoice.id}\nAmount: ${invoice.amount} ${invoice.currency}\n\nThe invoice was not paid in time. Send "invoice ${invoice.amount} ${invoice.currency}" to create a new one.`,
      });
      break;

    default:
      // Acknowledge unknown events
      break;
  }

  return { status: 200, body: { ok: true, notified: true } };
}
