# NakoPay for WhatsApp Bot

Accept Bitcoin and other crypto in WhatsApp Bot with a one-flat-fee, non-custodial
checkout. Wallet-to-wallet - NakoPay never holds your funds.

[![Status](https://img.shields.io/badge/status-beta-blue)](https://nakopay.com/integrations)
[![License](https://img.shields.io/badge/license-MIT-green)](../LICENSE)

## Install

```
Sign up at https://nakopay.com/integrations
```

## Configure

1. Get an API key from <https://nakopay.com/dashboard/api-keys>.
2. In WhatsApp Bot admin: Connect WhatsApp Business in NakoPay dashboard
3. Set the webhook URL shown in the plugin settings inside your NakoPay
   dashboard (Settings → Webhooks).

## Test mode

Use `sk_test_*` keys to run the full checkout against the NakoPay sandbox.
No real funds move. Flip to `sk_live_*` when you're ready for production.

## Supported features

- [x] Slash command / DM-driven invoice creation
- [x] Pay confirmation pings
- [x] Per-channel/per-user merchant routing
- [x] Test mode

## Local development

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the full setup. Quick
start for Node plugins:

- Node stack: see CONTRIBUTING § "Local development per host".
- Run `bash ../scripts/check-no-internal-urls.sh .` before opening a PR.

## Release

Tag-driven from the monorepo:

```
plugins/scripts/release.sh whatsapp 0.1.0
```

The matching workflow at `.github/workflows/release-whatsapp.yml` handles the
upload to the marketplace. Full runbook in [`../PUBLISHING.md`](../PUBLISHING.md).

## Issues

File on <https://github.com/NakoPayHQ/plugin-whatsapp/issues>.

## License

MIT - see [`../LICENSE`](../LICENSE).
