# TickTick API Troubleshooting Reference

Detailed technical documentation of issues encountered while building the TickTick CLI and SDK integration, including root causes, debugging approaches, and permanent fixes.

---

## Issue 1: X-Device Header Version Rejection

### Symptom
V2 auth (`POST /api/v2/user/signon`) returns `500` with `errorCode: "username_password_not_match"` despite correct credentials.

### Root Cause
The dida365.com API validates the `X-Device` header format and rejects requests using the old pyticktick format. The API server uses the X-Device header to determine the client version and applies different authentication logic per version.

### Old format (BROKEN — version 6430):
```json
{"platform":"web","version":6430,"id":"<device_id>"}
```

### New format (WORKING — version 8023):
```json
{
  "platform": "web",
  "os": "macOS 10.15.7",
  "device": "Chrome 145.0.0.0",
  "name": "",
  "version": 8023,
  "id": "<device_id>",
  "channel": "website",
  "campaign": "",
  "websocket": ""
}
```

### Key insight
The error message `username_password_not_match` is misleading — the server rejects the entire request based on the X-Device header before even checking credentials. This was confirmed by testing: the same password succeeds with the new header format and fails with the old one.

### Files fixed
- CLI: `${CLAUDE_PLUGIN_ROOT}/scripts/ticktick.mjs` — `X_DEVICE` constant at module level

### How to debug if this recurs
```bash
# Test with curl — if this works but Node.js doesn't, it's a header difference
curl -s -X POST 'https://api.dida365.com/api/v2/user/signon?wc=true&remember=true' \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: Mozilla/5.0 (rv:145.0) Firefox/145.0' \
  -H 'X-Device: {"platform":"web","os":"macOS 10.15.7","device":"Chrome 145.0.0.0","name":"","version":8023,"id":"69a3e4ca8149896002665cdd","channel":"website","campaign":"","websocket":""}' \
  -d '{"password":"<password>","username":"<username>"}'
```

### Where to get a fresh X-Device header
Open the browser DevTools on dida365.com, go to Network tab, find any API request, and copy the `X-Device` request header. The `version` field increments over time as the web client is updated.

---

## Issue 2: Device ID Must Be Pre-Registered

### Symptom
V2 auth returns `username_password_not_match` even with the correct X-Device header format (v8023). Works with one specific device ID but fails with any randomly generated ID.

### Root Cause
The dida365.com API ties authentication to known device IDs. A device ID is "registered" when the user logs in through the browser — the browser's device ID gets associated with the account. Subsequent API calls from unrecognized device IDs are rejected.

### Evidence
```
Known ID  (69a3e4ca8149896002665cdd): 200 OK
Random ID (9d516ba4800e4b265df53e19): 500 username_password_not_match
Random ID (309da09206bc411149383a45): 500 username_password_not_match
```

### Fix
Store the user's browser device ID in `~/.cache/agent-plugins/ticktick.json`:
```
TICKTICK_DEVICE_ID=<your-device-id>
```

The CLI reads this value and uses it instead of generating a random one.

### Where to find the device ID
1. Open dida365.com in browser
2. DevTools → Network → find any request to `api.dida365.com`
3. Look at the `X-Device` request header
4. Extract the `id` field from the JSON

---

## Issue 3: V2 API Requires Cookie Header

### Symptom
V2 auth succeeds (signon returns 200 with a token), but subsequent V2 API calls return `401` with `errorCode: "user_not_sign_on"`.

### Root Cause
The V2 API endpoints validate authentication via both the `Authorization: Bearer <token>` header AND the `Cookie: t=<token>` header. The `Authorization` header alone is insufficient for V2 endpoints.

### Fix
Include both headers in all V2 API calls:
```javascript
{
  'Authorization': `Bearer ${session.token}`,
  'Cookie': `t=${session.token}`,
  // ... other headers
}
```

### Why V1 doesn't need this
V1 (OAuth2) endpoints only check the `Authorization` header. They use a different auth middleware on the server side.

---

## Issue 4: Account Lockout After Failed Attempts

### Symptom
V2 auth returns `500` with `errorCode: "incorrect_password_too_many_times"`.

### Root Cause
The dida365.com server has a brute-force protection mechanism. After approximately 8–10 failed login attempts, the account is temporarily locked.

### Lockout behavior
- The `data.remainderTimes` field in error responses counts down remaining attempts before lockout
- Once locked, the lockout period is approximately **15–30 minutes**
- Retrying during lockout does NOT extend it but wastes time
- The lockout is per-account, not per-IP or per-device

### Recovery
1. Stop all auth attempts immediately
2. Wait at least 15 minutes (30 to be safe)
3. Clear session cache: `rm -f /tmp/ticktick-session.json`
4. Fix the underlying auth issue BEFORE retrying
5. Test with curl first to avoid triggering additional lockouts from code

### Prevention
When debugging auth issues, use curl first and limit attempts. The error `username_password_not_match` should be investigated (X-Device? Device ID?) before retrying with different parameters.

---

## Issue 5: Host Configuration (dida365.com vs ticktick.com)

### Symptom
API calls return unexpected errors, wrong data, or auth failures because they hit the wrong server.

### Root Cause
TickTick has two separate deployments:
- `ticktick.com` — International version (default)
- `dida365.com` — Chinese version

The two share no data. API URLs differ:
- International: `https://api.ticktick.com/open/v1/...` and `https://api.ticktick.com/api/v2/...`
- Chinese: `https://api.dida365.com/open/v1/...` and `https://api.dida365.com/api/v2/...`

### CLI fix
The CLI reads `TICKTICK_HOST` from `.env` and constructs URLs accordingly:
```javascript
const HOST = ENV.TICKTICK_HOST || 'ticktick.com';
const API_V2 = `https://api.${HOST}/api/v2`;
const API_V1 = `https://api.${HOST}/open/v1`;
```

---

## Issue 6: Session Cache Issues

The CLI caches V2 sessions at `$TMPDIR/ticktick-session.json` (1-hour TTL). If auth parameters change, clear it:
```bash
rm -f "$TMPDIR/ticktick-session.json"
```

---

## Debugging Checklist

When V2 auth fails, check in this order:

1. **Clear session cache**: `rm -f "$TMPDIR/ticktick-session.json"`
2. **Check config exists and has all fields**: `~/.cache/agent-plugins/ticktick.json`
   - Required: `TICKTICK_HOST`, `TICKTICK_USERNAME`, `TICKTICK_PASSWORD`, `TICKTICK_DEVICE_ID`, `TICKTICK_ACCESS_TOKEN`
3. **Test with curl**: Use the curl command from Issue 1 to isolate CLI vs API problems
4. **Check for lockout**: If error is `incorrect_password_too_many_times`, wait 30 minutes
5. **Verify X-Device version**: Must be `8023` with full fields, not `6430`
6. **Verify device ID**: Must be your browser's device ID, not randomly generated
7. **Check host**: API URL must contain `dida365.com`, not `ticktick.com`
8. **If X-Device format changed**: Capture fresh headers from browser DevTools on dida365.com
