# Kaskas!

**Which card should you swipe?** A mobile web app that tells you which of *your* credit cards earns the most rewards on the purchase you're about to make.

Live: https://chairell.github.io/kaskas/

## What it does
- **My cards**: tick the cards in your wallet, grouped by bank. They're saved on your phone and pre-selected next time.
- **Checkout check**: type the shop or pick a category, enter the amount, and your cards are ranked by value.
- **Earn → Conversion → Redemption**: each card shows how many points, miles or pesos you earn, how they convert, and what they're worth, with the % back.
- **Merchant bonuses**: Landers, Robinsons, Puregold, Cebu Pacific, PAL, Singapore Airlines, Petron, Shell, Meralco and Shopee are recognised.
- **Spend conditions**: cards like Metrobank Cashback and UnionBank Cash Back only pay their top rate after a minimum spend. Tick the condition in My cards if you usually meet it.
- **Mile value**: set what one airline mile is worth to you (default ₱0.50) to compare miles with cashback fairly.
- **Promos**: active promos from your banks for the category you picked, with an "ends in N days" flag. Refreshed daily (see below).
- **Cheat sheet**, recent amounts, sharing, an Add to Home Screen guide, and offline support.

## Card data
`cards.js` holds 48 cards from BPI, BDO, UnionBank, Metrobank, Maya, MariBank, PNB, EastWest and RCBC, compiled from each bank's website and published terms on Nov 25, 2026. Every card links to its source.

Not modelled in the rankings: limited-time promos (they're listed separately), annual caps beyond a simple per-cycle limit, and cards with no published earn rate (for example PNB Ze-Lo). Rates change often, so verify before relying on a ranking.

## Promos
`promos.json` is updated every day at 5:17 AM Manila time by the **Update promos** GitHub Action (`.github/workflows/promos.yml`). It runs `scripts/fetch-promos.mjs`, which reads each bank's promo pages, drops expired promos and commits the file if anything changed. You can also run it any time from the Actions tab with **Run workflow**.

- Banks covered so far: **BPI**. To add a bank, copy `scripts/sources/bpi.mjs`, adjust the parser, add a sample page to `scripts/fixtures/` with a test in `scripts/test-parsers.mjs`, and list it in `SOURCES`.
- If a bank returns no promos (usually because its page changed), its previous promos are kept and the job is marked failed, so GitHub emails you.
- Categories are guessed from the promo title, so some land in Shopping by default.

## Run it
Plain HTML/JS, no build step. Served with GitHub Pages from `main` / root.
