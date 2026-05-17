/**
 * Handle incoming WhatsApp messages and route to commands.
 */

import { sendTextMessage, markAsRead } from './whatsapp-client';
import { createInvoice, getBalance, getRates } from './nakopay-client';

interface WhatsAppMessage {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  timestamp: string;
}

interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export async function handleIncomingMessage(message: WhatsAppMessage, metadata?: WhatsAppMetadata): Promise<void> {
  // Only handle text messages
  if (message.type !== 'text' || !message.text?.body) return;

  await markAsRead(message.id);

  const text = message.text.body.trim().toLowerCase();
  const from = message.from;

  // Parse commands
  if (text.startsWith('invoice') || text.startsWith('/invoice')) {
    await handleInvoiceCommand(from, message.text.body);
  } else if (text === 'balance' || text === '/balance') {
    await handleBalanceCommand(from);
  } else if (text === 'rates' || text === '/rates') {
    await handleRatesCommand(from);
  } else if (text === 'help' || text === '/help' || text === 'hi' || text === 'hello') {
    await handleHelpCommand(from);
  } else {
    await handleHelpCommand(from);
  }
}

async function handleInvoiceCommand(to: string, rawText: string): Promise<void> {
  // Parse: "invoice 25 USD" or "/invoice 10.50 EUR"
  const match = rawText.match(/(?:\/)?invoice\s+([\d.]+)\s*([A-Za-z]{3})?/i);
  if (!match) {
    await sendTextMessage({
      to,
      text: 'Usage: invoice <amount> <currency>\nExample: invoice 25 USD',
    });
    return;
  }

  const amount = match[1];
  const currency = (match[2] || 'USD').toUpperCase();

  try {
    const result = await createInvoice({
      amount,
      currency,
      description: `WhatsApp invoice - ${amount} ${currency}`,
      customerPhone: to,
    });

    if (result._ok && result.checkout_url) {
      await sendTextMessage({
        to,
        text: `Invoice created for ${amount} ${currency}\n\nPay here: ${result.checkout_url}\n\nInvoice ID: ${result.id}\nExpires in 15 minutes.`,
      });
    } else {
      const msg = (result.message as string) || (result._error as string) || 'Unknown error';
      await sendTextMessage({ to, text: `Could not create invoice: ${msg}` });
    }
  } catch (err) {
    console.error('Invoice creation error:', err);
    await sendTextMessage({ to, text: 'Something went wrong creating the invoice. Please try again.' });
  }
}

async function handleBalanceCommand(to: string): Promise<void> {
  try {
    const result = await getBalance();
    if (result._ok) {
      const balances = result.balances as Array<{ coin: string; available: string }> || [];
      if (balances.length === 0) {
        await sendTextMessage({ to, text: 'No balances found.' });
        return;
      }
      const lines = balances.map(b => `${b.coin}: ${b.available}`);
      await sendTextMessage({ to, text: `Wallet balances:\n${lines.join('\n')}` });
    } else {
      await sendTextMessage({ to, text: 'Could not fetch balance. Check your API key.' });
    }
  } catch (err) {
    console.error('Balance error:', err);
    await sendTextMessage({ to, text: 'Could not fetch balance.' });
  }
}

async function handleRatesCommand(to: string): Promise<void> {
  try {
    const result = await getRates();
    if (result._ok) {
      const rates = result.rates as Record<string, string> || {};
      const lines = Object.entries(rates).map(([pair, rate]) => `${pair}: ${rate}`);
      await sendTextMessage({ to, text: `Exchange rates:\n${lines.join('\n')}` });
    } else {
      await sendTextMessage({ to, text: 'Could not fetch rates.' });
    }
  } catch (err) {
    console.error('Rates error:', err);
    await sendTextMessage({ to, text: 'Could not fetch rates.' });
  }
}

async function handleHelpCommand(to: string): Promise<void> {
  await sendTextMessage({
    to,
    text: `NakoPay Bot Commands:\n\ninvoice <amount> <currency> - Create a payment invoice\n  Example: invoice 25 USD\n\nbalance - Check wallet balances\n\nrates - View exchange rates\n\nhelp - Show this message`,
  });
}
