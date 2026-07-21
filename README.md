# eBay Listing Agent

An agentic system that takes photos of a used item and produces a ready-to-review
eBay listing: it identifies the item, researches comparable prices, finds the
correct eBay category, and (in progress) publishes the listing — with a human
always clicking the final "post" button.

Built as a hands-on learning project to pick up TypeScript/Node.js and real
agentic system design (hand-rolled agent loop, no LangChain/LangGraph — every
piece of the control flow is written and understood from scratch).

## Why no framework

The agent loop, tool-calling, and dispatch logic are all built by hand rather
than using an agent framework. This was a deliberate choice: it forces a real
understanding of how tool-calling actually works under the hood (message
arrays, stopping conditions, function-call dispatch), rather than treating it
as a black box — and it's a stronger, more specific story to tell in an
interview than "I used LangChain."

## How it works

```
photos + prompt → [agent loop] → model reasons + calls real tools → drafted listing → human clicks "post"
                        ↓
                tools available to the model:
                - search_comps    (real eBay Browse API — live pricing research)
                - check_category  (real eBay Taxonomy API — correct category ID)
                - [in progress] publish_listing (real eBay Sell/Inventory API)
```

**The agent loop**: a `while` loop that keeps calling the model and running
any tool it requests, feeding real results back each time, until the model
responds with plain text instead of a tool call. The stopping condition is
the model's own decision, not a fixed number of steps.

**Tool calling**: each tool is described to the model via a JSON-schema-like
declaration (name, description, expected arguments). The model decides *if*
and *when* a tool is relevant based on the conversation, and generates the
arguments itself (e.g., extracting a search query from a photo + user
request). The model never executes anything — it only requests a call; the
actual function runs in this codebase and the real result is fed back.

**Image input**: photos are read from disk, base64-encoded, and sent as part
of the same message array a text-only conversation would use — multimodal
input required no changes to the loop or tool-dispatch logic itself.

**eBay integration**: `search_comps` and `check_category` use eBay's
Browse and Taxonomy APIs via an app-level OAuth token (client-credentials
grant — no user login required, since these are read-only). Publishing a
real listing requires a different OAuth grant (authorization-code, i.e. a
real user login/consent flow) since it acts on a specific seller's account —
this is the current in-progress piece.

## Human-in-the-loop by design

The agent can research pricing, identify categories, and draft a full
listing entirely on its own. It **cannot** publish anything without an
explicit human action. This mirrors how real production agent products
(e.g. Jobright's application autofill) are built — AI handles the tedious
drafting work, a human makes the final, irreversible call. This isn't a
missing feature; it's a deliberate safety boundary.

## Current status

- ✅ Hand-rolled agent loop with dynamic multi-tool dispatch
- ✅ Multimodal (image) input merged into the same loop
- ✅ Real `search_comps` tool — live eBay Browse API pricing data
- ✅ Real `check_category` tool — live eBay Taxonomy API category lookup
- 🟡 User OAuth (authorization-code grant) for publishing — in progress
- 🟡 Image hosting for listing photos (eBay's publish API needs public URLs)
- 🟡 3-step publish flow: create inventory item → create offer → publish offer
- ⬜ Simple web frontend: upload photo → review agent's draft → one-click post
- ⬜ SQLite persistence for tracking listings across runs
- ⬜ Error handling / retry logic around external API calls

## Tech stack

- TypeScript / Node.js
- Google Gemini API (`@google/genai`) for the model
- eBay REST APIs: Browse, Taxonomy, (in progress) Inventory/Sell
- Plain `fetch()` for all HTTP — no API SDK wrappers beyond Gemini's own

## Setup

```bash
npm install
```

Create a `.env` file with:
```
GEMINI_API_KEY=your_key
EBAY_PROD_CLIENT_ID=your_app_id
EBAY_PROD_CLIENT_SECRET=your_cert_id
```

## Honest note on scope

An earlier version of this plan included a Chrome extension modeled on
products like Jobright. That's been deliberately deferred — it's a
genuinely separate skill domain (content scripts, extension architecture)
that wasn't a good use of limited project time. The simple web frontend
covers the same demo value without that overhead; the Chrome extension
remains a natural future extension of this same backend.