# FlowTrade public assets

This repository is the prepared public-asset package for the FlowTrade Blogger theme. It contains review copies of styles and scripts only. It does **not** update Blogger by itself.

## Important status

- The original Blogger XML is unchanged.
- Nothing in this folder is connected to the live website yet.
- Do not upload private configuration, Firebase service-account files, `.env` files, passwords, or Apps Script source into this repository.
- The current runtime configuration remains inside the Blogger XML and is intentionally not included here.

## Repository structure

```text
flowtrade-assets/
├── css/
│   ├── storefront.css
│   ├── admin.css
│   ├── campaign.css
│   ├── marketing.css
│   ├── category-bootstrap.css
│   ├── blogger-static-pages.css
│   └── blogger-tooltip.css
├── js/
│   ├── core-app.js
│   ├── category-bootstrap.js
│   ├── admin.js
│   ├── campaign.js
│   ├── marketing.js
│   └── blogger-comments-inline.js
├── ASSET-MANIFEST.md
├── SECURITY-AUDIT.md
└── README.md
```

## What each asset does

| File | Purpose | Future CDN use |
| --- | --- | --- |
| `css/storefront.css` | Main storefront theme CSS from Blogger `b:skin`. | Candidate after visual testing. |
| `css/admin.css` | Admin UI rule inventory. | Reference only for now. |
| `css/campaign.css` | FT Campaign rule inventory. | Reference only; depends on admin CSS. |
| `css/marketing.css` | Digital Marketing rule inventory. | Reference only; depends on admin CSS. |
| `js/core-app.js` | One shared app closure for storefront, Admin Panel, FT Campaign and Digital Marketing. | Candidate only after controlled migration testing. |
| `js/category-bootstrap.js` | Prevents category-page render flash. | Keep inline initially. |
| `js/admin.js`, `js/campaign.js`, `js/marketing.js` | Explicit non-runnable placeholders documenting current shared-closure ownership. | Do not load. |
| `js/blogger-comments-inline.js` | Blogger-template documentation copy. | Do not load externally. |

## Required loading order for a future migration

1. Keep FlowTrade runtime configuration inline in Blogger.
2. Keep Firebase compatibility libraries in their current order.
3. Keep the category bootstrap logic inline in the page head.
4. Load `css/storefront.css` after Blogger's base/widget CSS.
5. Load `js/core-app.js` after the DOM, Firebase libraries and inline runtime configuration are ready.
6. Keep Blogger comments snippets inline where Blogger renders them.

Do not load `admin.js`, `campaign.js`, or `marketing.js`. Their code still lives in the shared `core-app.js` closure.

## jsDelivr URL templates

After you provide your GitHub username and create a release tag such as `v1.0.0`, the recommended URLs will be:

```text
https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/flowtrade-assets@v1.0.0/css/storefront.css
https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/flowtrade-assets@v1.0.0/js/core-app.js
```

Use a version tag in production. Do not use `@main` for the live store, because cached changes are harder to roll back.

## Beginner GitHub setup

1. Sign in to GitHub and open your empty `flowtrade-assets` repository.
2. Choose **Add file → Upload files**.
3. Upload the contents of this folder, keeping the `css` and `js` folders unchanged.
4. Check the upload list. Do not upload `.env`, private keys, Firebase service-account JSON, Apps Script files, or the original Blogger XML.
5. Commit with a message such as `Prepare FlowTrade public assets v1.0.0`.
6. Open **Releases → Create a new release**, create the tag `v1.0.0`, then publish it.
7. Share your GitHub username after this step. The precise jsDelivr URLs can then be prepared for approval.

## Rollback plan for the later Blogger migration

1. Save a dated backup of the working Blogger XML before adding any CDN tags.
2. Add a versioned jsDelivr URL only after testing on a duplicate/staging theme.
3. If anything fails, remove only the newly added CDN `<link>` or `<script>` tag and republish the backup XML.
4. Keep the previously working release tag available; for example, change `@v1.1.0` back to `@v1.0.0`.
5. Never delete a release that is still referenced by a live Blogger theme.

See `ASSET-MANIFEST.md` for the exact extraction mapping and `SECURITY-AUDIT.md` for the public-upload audit.
