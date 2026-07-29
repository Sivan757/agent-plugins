# Gateway And Signing

Captured from logged-in Temu Partner developer documentation on 2026-06-17. Source pages:

- Signing rules: https://agentpartner.temu.com/document?cataId=875196199516&docId=896167235113
- Auth information: https://agentpartner.temu.com/document?cataId=875196199516&docId=896168820140
- Region notes: https://agentpartner.temu.com/document?cataId=875196199516&docId=909799935182
- Self-developed-only APIs: https://agentpartner.temu.com/document?cataId=875196199516&docId=899322689413

## Credentials

Self-developed app credentials are shop/app sensitive:

- `app_key`: app-scoped identifier from Temu seller center self-developed app management.
- `app_secret`: signing secret; never expose, persist in docs, or log.
- `access_token`: shop-scoped token used as a request parameter. For self-developed apps, the developer doc states it is valid for 365 days and old tokens become invalid after regeneration.

For this workspace, use runtime environment variables when present:

- `TEMU_APPKEY`
- `TEMU_APPSECRET`
- `TEMU_TOKEN`

Do not copy these values into test fixtures, prompt output, traces, screenshots, or skill files.

## Region Selection

Temu Open Platform is partitioned. The documentation lists CN, PA, US, EU, and GLOBAL style capabilities/addresses. Always verify the current page before production changes, but the captured region map says:

| Scenario | Region |
| --- | --- |
| Full-managed goods publishing, inventory, stocking fulfillment | CN |
| Full-managed compliance qualification | GLOBAL |
| Semi-managed goods publishing | CN |
| Semi-managed inventory, price adjustment, price review | PA |
| US semi-managed fulfillment | US |
| EU semi-managed fulfillment | EU |
| Other semi-managed fulfillment/compliance outside US/EU | GLOBAL |
| Local-to-local US goods and fulfillment | US |
| Local-to-local EU goods and fulfillment | EU |
| Other local-to-local | GLOBAL |

Captured gateway/auth URLs:

| Region | API gateway | Seller token page |
| --- | --- | --- |
| CN | `https://openapi.kuajingmaihuo.com/openapi/router` | `https://agentseller.temu.com/open/system-manage/client-manage` |
| PA | `https://openapi-b-partner.temu.com/openapi/router` | `https://agentseller.temu.com/open/system-manage/client-manage` |
| US | `https://openapi-b-us.temu.com/openapi/router` | `https://agentseller-us.temu.com/open-platform/system-manage/client-manage` |
| EU | `https://openapi-b-eu.temu.com/openapi/router` | `https://agentseller-eu.temu.com/open-platform/system-manage/client-manage` |

The documentation warns that the gateway URL, `app_key`, `app_secret`, and `access_token` must come from the same region. A common auth failure is mixing a US key/token with a CN endpoint or vice versa.

For the user's US local POD scenario, do not assume a single endpoint covers every operation. Use US for local-to-local US goods/fulfillment, but re-check if a flow is actually semi-managed because publishing, inventory, pricing, and fulfillment can belong to different regions.

## Common Request Fields

Requests include public parameters and business parameters in one outer JSON object. Common public fields include:

- `type`: API method name, for example `bg.glo.goods.add`.
- `timestamp`: Unix timestamp.
- `app_key`: app key for the chosen region.
- `data_type`: usually `JSON`.
- `access_token`: shop token for the chosen region.
- `sign`: uppercase MD5 signature after signing.

## Signing Algorithm

Implement one signer and test it directly.

1. Build the complete outer request object without `sign`.
2. Sort only the outer object keys by ASCII key order.
3. Concatenate each sorted outer key with its value. Inner JSON/arrays are not recursively sorted; preserve the same serialized value representation used in the request.
4. Prefix and suffix the concatenated string with `app_secret`.
5. MD5 hash the final string and uppercase the 32-character hex digest.
6. Add the digest as `sign`.

Signing failure checklist:

- Only the outer request keys are sorted.
- Sorting is by key, not by `key + value`.
- Boolean/string/number values are represented exactly as sent. Do not convert `true` to `True`, `1`, or other spellings.
- Inner JSON value order/serialization must match the outgoing request body.
- Remove `sign` before recomputing a signature.
- If a large payload fails signing, add outer fields gradually and compare the canonical signing string with a redacted debug view.

Never log the full canonical string in production because it includes secrets and token-bearing values. For debugging, log only keys, redacted values, and a hash of the canonical string.

### Worked example (test values, verify your signer)

These are TEST placeholders, not real credentials. Compute the signature and compare with the expected digest to validate a signer implementation.

Outer request object (no `sign` yet):

```json
{
  "access_token": "TEST_TOKEN",
  "app_key": "TEST_APP_KEY",
  "data_type": "JSON",
  "page": "1",
  "pageSize": "20",
  "timestamp": "1739688901",
  "type": "bg.goods.list.get"
}
```

`app_secret` = `TEST_SECRET_DO_NOT_USE`

Step-by-step:

1. Sort outer keys ASCII: `access_token, app_key, data_type, page, pageSize, timestamp, type`.
2. Concatenate `key+value` with NO separator (no `=`, no `&`):
   `access_tokenTEST_TOKENapp_keyTEST_APP_KEYdata_typeJSONpage1pageSize20timestamp1739688901typebg.goods.list.get`
3. Wrap with `app_secret` as prefix and suffix:
   `TEST_SECRET_DO_NOT_USEaccess_tokenTEST_TOKENapp_keyTEST_APP_KEYdata_typeJSONpage1pageSize20timestamp1739688901typebg.goods.list.getTEST_SECRET_DO_NOT_USE`
4. MD5 uppercase 32-hex:
   `4A0AA0A23F2F2E03D0AE9056EEAACB42`

That final digest is the `sign` field. Notes:

- `data_type` and `version` are public fields; include in signing every field actually present in the outer object. Optional fields that are OMITTED from the request body are also omitted from the signing string - do not sign fields that are not sent.
- Inner JSON (e.g. `joinInfoList`) is preserved verbatim as serialized in the request; it is not sorted.

## Live Call Safety

Before any live Temu call that changes remote state:

- Confirm the selected region/gateway.
- Confirm whether the app has API permission for the `type`.
- Confirm the request is operating on the intended shop/site.
- Persist a local audit record with request id, idempotency/source id, redacted payload, response summary, and remote ids.
- Require explicit user confirmation for publish/update/migrate/price/inventory/logistics changes.
