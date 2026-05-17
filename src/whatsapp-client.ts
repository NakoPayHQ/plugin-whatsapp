/**
 * WhatsApp Business Cloud API client.
 */

import { config } from './config';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

interface SendMessageOptions {
  to: string;
  text: string;
}

interface SendTemplateOptions {
  to: string;
  templateName: string;
  parameters?: Array<{ type: string; text: string }>;
}

export async function sendTextMessage({ to, text }: SendMessageOptions): Promise<void> {
  const url = `${GRAPH_API}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: true, body: text },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`WhatsApp send failed [${resp.status}]: ${err}`);
    throw new Error(`WhatsApp API error: ${resp.status}`);
  }
}

export async function sendInteractiveButton(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<void> {
  const url = `${GRAPH_API}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`WhatsApp interactive send failed [${resp.status}]: ${err}`);
  }
}

export async function markAsRead(messageId: string): Promise<void> {
  const url = `${GRAPH_API}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}
