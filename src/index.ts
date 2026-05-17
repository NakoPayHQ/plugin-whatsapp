/**
 * NakoPay WhatsApp Bot - main entry point.
 *
 * Two servers:
 *   1. WhatsApp webhook receiver (Meta Cloud API sends messages here)
 *   2. NakoPay webhook receiver (payment confirmations)
 */

import express from 'express';
import { config } from './config';
import { handleIncomingMessage } from './message-handler';
import { handleNakoPayWebhook } from './nakopay-webhook';

const app = express();

// WhatsApp webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// WhatsApp incoming messages (POST)
app.post('/webhook', express.json(), async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') continue;
        const messages = change.value?.messages ?? [];
        for (const message of messages) {
          await handleIncomingMessage(message, change.value?.metadata);
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return res.sendStatus(500);
  }
});

// NakoPay payment webhook (POST)
app.post('/nakopay-webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const sig = req.headers['x-nakopay-signature'] as string || '';
    const rawBody = req.body.toString();
    const result = await handleNakoPayWebhook(rawBody, sig);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('NakoPay webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', bot: 'nakopay-whatsapp', version: '0.1.0' });
});

app.listen(config.PORT, () => {
  console.log(`NakoPay WhatsApp bot listening on port ${config.PORT}`);
  console.log(`WhatsApp webhook URL: ${config.BASE_URL}/webhook`);
  console.log(`NakoPay webhook URL: ${config.BASE_URL}/nakopay-webhook`);
});
