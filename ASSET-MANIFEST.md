# FlowTrade asset extraction manifest

## Source

- Original XML inspected: `outputs/flowtrade-checkout-fixed.xml`
- Original XML was **not modified**.
- This folder is a preparation copy only; it is not wired into Blogger or GitHub yet.

## Extracted files

- `css/storefront.css` — 41,541 bytes
- `css/category-bootstrap.css` — 307 bytes
- `css/blogger-static-pages.css` — 381 bytes
- `css/blogger-tooltip.css` — 1,064 bytes
- `js/core-app.js` — 458,135 bytes
- `js/category-bootstrap.js` — 450 bytes
- `js/blogger-comments-inline.js` — 615 bytes
- `css/admin.css` — 38,972 bytes
- `css/campaign.css` — 7,934 bytes
- `css/marketing.css` — 6,235 bytes
- `js/admin.js` — 301 bytes
- `js/campaign.js` — 300 bytes
- `js/marketing.js` — 307 bytes
- `js/inline-config-not-exported.txt` — 212 bytes

## Original section mapping

| Original section | Prepared file | Migration status |
| --- | --- | --- |
| `<b:skin>` | `css/storefront.css` | Can be externalized later after visual testing. |
| Inline style #1 (category render guard) | `css/category-bootstrap.css` | Keep inline initially to prevent homepage/category flicker. |
| Inline styles #2–#3 | `css/blogger-static-pages.css` | Keep inline; Blogger page/widget conditions control them. |
| Inline style #4 | `css/blogger-tooltip.css` | Keep inline until Blogger post widget migration is tested. |
| Inline script #5 | `js/category-bootstrap.js` | Keep inline and before render; it prevents category flash. |
| Inline script #11 | `js/core-app.js` | Prepared as one file. It includes storefront, Admin Panel, FT Campaign and Digital Marketing in a shared closure. |
| Inline scripts #6, #8, #10 | `js/blogger-comments-inline.js` | Documentation copy only; must remain inline because they contain Blogger `<data:.../>` expressions. |
| Inline script #4 | Not exported | Runtime configuration, Firebase web config, backend URLs and embedded logo remain in XML. |

## Dependencies and eventual load order

1. Keep the live inline runtime configuration script in Blogger first.
2. Firebase compatibility libraries (already external in the XML).
3. `js/category-bootstrap.js` stays inline in the document head before page rendering.
4. `css/storefront.css` after Blogger base/widget CSS.
5. `js/core-app.js` after the storefront DOM, Firebase libraries and inline runtime configuration.
6. Blogger comments snippets remain exactly where Blogger renders them.

## Why Admin, Campaign and Marketing are not separate JavaScript files yet

The current app is one minified IIFE. Its Admin Panel, FT Campaign and Digital Marketing functions share local variables, helpers, Firebase state and initialization order. Splitting code by text boundaries now would break the closure and can stop login, campaign pricing or marketing screens from working. The files `js/admin.js`, `js/campaign.js`, and `js/marketing.js` are intentionally non-runnable placeholders. A later controlled refactor can make them independent after tests.

## Code that must stay inline

- Firebase/runtime configuration script: it currently includes live endpoints/configuration plus the embedded brand image. It was intentionally not copied so no config is placed into this asset package.
- Category bootstrap script: prevents category loading flash before the stylesheet/app is available.
- Blogger comment scripts: contain `<data:post.../>` template data evaluated by Blogger.
- Page/widget conditional styles: should remain in Blogger until their template conditions are preserved externally.

## Potential migration risks

- GitHub raw URLs can have caching and MIME/CORS behavior that makes debugging harder. Prefer a versioned CDN release or GitHub Pages after approval.
- Moving the runtime configuration would publish endpoint/config data again in another location. It should remain inline and never include any private service-account material.
- External CSS loaded later may cause a flash of unstyled content; category bootstrap must remain inline.
- `js/core-app.js` depends on Firebase libraries, runtime configuration and the page DOM. Wrong order can break admin login, customer accounts, campaign checkout rules and marketing UI.
- Blogger cache may continue serving prior asset versions. Use versioned asset URLs when the migration phase is approved.
