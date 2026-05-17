# NakoPay WhatsApp Bot

Send pay-by-link invoices over WhatsApp Business. Customers text a command,
receive a payment link, and get a confirmation message when paid.

[![Status](https://img.shields.io/badge/status-stable-blue)](https://nakopay.com/integrations/whatsapp)
[![License](https://img.shields.io/badge/license-MIT-green)](../LICENSE)

## Requirements

- Node.js 18+
- A [Meta Business account](https://business.facebook.com/) with WhatsApp Business API access
- A WhatsApp Business phone number
- A NakoPay account ([sign up free](https://nakopay.com))
- A server with a public HTTPS URL (for webhooks)

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/NakoPayHQ/plugin-whatsapp.git
cd plugin-whatsapp
npm install
```

### 2. Set up WhatsApp Business API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app (type: Business)
3. Add the **WhatsApp** product
4. In WhatsApp > API Setup, note your:
   - **Phone Number ID** (under "From" phone number)
   - **Permanent token** (generate one under "System users" in Business Settings)

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `WHATSAPP_TOKEN` - Your WhatsApp Business API token
- `WHATSAPP_PHONE_NUMBER_ID` - Your phone number ID from Meta
- `WHATSAPP_VERIFY_TOKEN` - Any string you choose (must match Meta webhook config)
- `NAKOPAY_API_KEY` - Your NakoPay secret key (`sk_test_*` or `sk_live_*`)
- `NAKOPAY_WEBHOOK_SECRET` - Your webhook signing secret (`whsec_*`)

### 4. Start the bot

```bash
# Development
npm run dev

# Production
npm run build && npm start

# Docker
docker compose up -d
```

### 5. Configure webhooks

**WhatsApp webhook (Meta):**
1. In Meta Developer Console > WhatsApp > Configuration > Webhook
2. Set Callback URL: `https://your-server.com/webhook`
3. Set Verify Token: same value as `WHATSAPP_VERIFY_TOKEN` in your `.env`
4. Subscribe to: `messages`

**NakoPay webhook:**
1. Go to [nakopay.com/dashboard/webhooks](https://nakopay.com/dashboard/webhooks)
2. Add endpoint: `https://your-server.com/nakopay-webhook`
3. Subscribe to: `invoice.paid`, `invoice.expired`

## Commands

Customers send text messages to your WhatsApp Business number:

| Command | Description | Example |
|---------|-------------|---------|
| `invoice <amount> <currency>` | Create a payment invoice | `invoice 25 USD` |
| `balance` | Check wallet balances (merchant only) | `balance` |
| `rates` | View live exchange rates | `rates` |
| `help` | Show available commands | `help` |

## How it works

1. Customer sends `invoice 25 USD` to your WhatsApp number
2. Bot creates a NakoPay invoice via the API
3. Bot replies with a payment link (QR code page)
4. Customer pays with Bitcoin
5. NakoPay sends a webhook to your bot
6. Bot sends a payment confirmation message to the customer

## Docker deployment

```bash
docker compose up -d
docker compose logs -f
```

## Troubleshooting

**Bot doesn't respond to messages**
- Check the webhook URL is set correctly in Meta Developer Console
- Verify the `WHATSAPP_VERIFY_TOKEN` matches between `.env` and Meta config
- Check `docker compose logs` for errors

**"Could not create invoice" reply**
- Verify `NAKOPAY_API_KEY` in `.env` is valid
- Check the key starts with `sk_test_` or `sk_live_`

**No payment confirmation message**
- Check the NakoPay webhook URL is set at nakopay.com/dashboard/webhooks
- Verify `NAKOPAY_WEBHOOK_SECRET` matches the signing secret in the dashboard

## Support

- [Open a GitHub issue](https://github.com/NakoPayHQ/plugin-whatsapp/issues)
- [NakoPay documentation](https://nakopay.com/docs)
- [Contact support](https://nakopay.com/contact)

## About WhatsApp

[WhatsApp](https://www.whatsapp.com/) - messaging platform by Meta. Visit their website to learn more about the platform and its features.

## License

MIT
