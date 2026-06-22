# E2E Tests — Virtualized Chat

Playwright suite covering scroll-to-bottom, load-more anchoring, and scroll-to-message
behavior added with the chat virtualization.

## One-time setup

```bash
bun add -d @playwright/test
bunx playwright install chromium
```

## Prepare test data

1. Create (or pick) a test user via your app's sign-up flow and note their `auth.users.id`.
2. Seed ~200 messages in `#chat-geral` for that user:

   ```bash
   psql "$DATABASE_URL" -v user_id="'<USER_UUID>'" -f e2e/seed.sql
   ```

   This idempotently inserts `[E2E] OLDEST MARKER`, `[E2E] SCROLL TARGET — find me`,
   `[E2E] NEWEST MARKER`, and 200 filler messages.

## Run

```bash
# In one terminal
bun run dev

# In another
E2E_EMAIL=test@example.com \
E2E_PASSWORD=secret \
BASE_URL=http://localhost:8080 \
bunx playwright test
```

## What's covered

| Spec | Verifies |
| --- | --- |
| `scroll-to-bottom on initial load` | Chat opens anchored to the newest message (within 200px of bottom). |
| `load-more anchors previously-first message` | Scrolling to the top loads older messages and the previously-visible message stays in place (no jump). |
| `scroll-to-message via search` | Searching for a mid-list message scrolls it into view and applies the pulse highlight. |

## Cleanup

```bash
psql "$DATABASE_URL" -c "DELETE FROM messages WHERE content LIKE '[E2E]%';"
```
