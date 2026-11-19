# Public upload security audit

Audit scope: all `.css` and `.js` files in this `flowtrade-assets` package.

## Result

The prepared CSS and JavaScript files are safe to upload publicly **as source assets**. No Firebase API key values, private keys, service-account JSON, access tokens, passwords, customer records, personal names, personal phone numbers or private backend endpoints were found.

## Findings

| Check | Result | Notes |
| --- | --- | --- |
| Firebase configuration values | Not found | The runtime Firebase configuration was intentionally not extracted. |
| API keys / private keys | Not found | No `AIza…`, PEM private-key block or service-account material found. |
| Tokens / passwords | No secret values found | The app includes login-form labels and password validation messages only. |
| Private endpoints | Not found | Public site, social sharing, image-hosting and placeholder URLs are present. |
| Customer / personal information | Not found | Only example emails such as `customer@example.com` and `affiliate@example.com` occur in validation/help text. |
| Admin configuration | Reference only | `FLOWTRADE_ADMIN_EMAILS` appears in a user-facing configuration error message; no actual email allow-list is present. |

## Public URLs found

The core application references public URLs used by the storefront: FlowTrade Blogger pages, Google Drive image thumbnails, Unsplash fallbacks and social sharing links (WhatsApp, Facebook, X/Twitter, Pinterest and LinkedIn). These are expected public integrations, not secrets.

## Files not intended for CDN loading

- `js/inline-config-not-exported.txt` is an explanatory note, not an asset.
- `js/admin.js`, `js/campaign.js`, and `js/marketing.js` are non-runnable placeholders.
- `js/blogger-comments-inline.js` documents code that must remain inside Blogger because it contains template expressions.

## Ongoing protection

The repository `.gitignore` prevents common private configuration and credential formats from being added by mistake. Before every future upload, review the GitHub file list and verify that no private server code, Firebase service-account JSON or environment file is included.
