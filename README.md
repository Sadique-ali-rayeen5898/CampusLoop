# CampusLoop Simulator

A React + Vite frontend prototype for a campus-exclusive marketplace. It simulates buying, selling, item-to-item barter, rentals, student messaging, and multi-turn AI-assisted price negotiation.

## Run locally

1. Install Node.js 18 or newer.
2. Open this folder in VS Code.
3. Open the terminal in this folder and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview
```

## Prototype features

- Seeded CMR University sample listings.
- Marketplace categories and subcategories for listing creation.
- Search, category filters, and sections for buying, selling, barter, and rentals.
- Create and manage listings with description, condition, asking price, and a private minimum acceptable price.
- Barter proposals can describe an item without creating a separate listing first. Each proposal includes category, subcategory, item name, condition, description, estimated value, and optional cash difference.
- Six seller negotiation personalities: Friendly & fair, Firm on price, Blunt & no-nonsense, Quick sale, Sentimental / particular, and Practical negotiator.
- Multi-turn AI bargaining chat. Buyers can make counteroffers in natural language, ask for a lower price, ask questions, explicitly revise their maximum budget, and accept a counteroffer.
- Simulated campus buyers automatically send demo offers when a student publishes a non-rental listing. Existing listings without an offer are migrated and receive a demo offer the first time this version loads.
- The demo buyer and seller AI exchange multiple messages automatically, then create a structured tentative-deal summary for seller approval. The seller can generate more sample buyer interest from the My Listings page.
- Seller minimum price and buyer maximum budget are enforced by the simulator. The buyer-facing summary does not display the seller's minimum price.
- AI conversations create a structured summary and remain pending until the seller approves or declines.
- Normal buyer offers, seller review, and transaction status tracking.
- Rental requests with duration, simulated rental cost, and refundable deposit tracking.
- Local browser storage. Changes persist in the same browser until demo data is reset.

## AI negotiation logic

The current AI is a local, rule-based conversational simulator. It does not call a hosted language model and does not require an API key. It uses the seller's selected personality to vary tone, flexibility, and counteroffer strategy. The blunt personality responds firmly to very low offers. The quick-sale personality makes larger concessions, while the firm personality makes smaller concessions.

The seller's minimum acceptable price is treated as a hard floor, and the buyer's maximum budget is treated as a hard ceiling. An AI counteroffer is not a final deal. A tentative agreement is only created after the buyer makes or confirms a price within both limits. The seller must then approve it. The seller floor is not shown in the buyer-facing negotiation transcript or summary.

This is a simulated assistant, not a real LLM. It understands a limited set of bargaining phrases and numeric offers. A production implementation should use a server-side LLM with structured tool/function calls, strict validation outside the model, and the same non-negotiable price constraints enforced on the backend.

## Important demo limitations

- There is no real student authentication, server, payment gateway, or external messaging service.
- Sample identities and listings are fictional demo data.
- Seller approval is simulated in the same browser so the full workflow can be demonstrated. Demo buyers are fictional and their offers are generated locally, they are not actual students.
- Rental bookings and deposits are tracked for demonstration only. No funds are collected or held.
- Listing photo upload and production moderation are not implemented.
- The minimum price is stored in browser state for this prototype. It must be moved to a protected backend before real users are added.

## Suggested production steps

1. Add a backend with Node.js/Express and MySQL.
2. Add university email verification and role-aware sessions.
3. Store seller minimum prices only on the server. Never send them to the buyer's browser.
4. Integrate an LLM behind a server-side negotiation policy. The model must not be allowed to change the price floor or approve transactions.
5. Add audit logs, report/dispute workflows, and a clear in-person handover process.
6. Add a payment provider only after deciding how refunds, deposits, disputes, and platform liability will be handled.
