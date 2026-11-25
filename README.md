# Sulit Swipe

**Which card should you swipe?** A mobile web app that tells you which of *your* credit cards earns the most rewards on the purchase you're about to make.

Live: https://chairell.github.io/sulitswipe/

*Formerly Kaskas!*

## What it does
- **Three tabs**: Compare, My cards and Settings, with a bottom tab bar, dark mode and native-style touch behaviour.
- **My cards**: a searchable list with a switch for each card. Your cards are saved on your phone and stay on next time.
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

- **Covered:** BPI, Metrobank (from the structured data embedded in its page, including which cards qualify), RCBC, EastWest (all pages) and Maya (featured credit card deals).
- **Not covered:** BDO (its deals app loads promos through a login-gated API), PNB and UnionBank (their sites refuse automated requests), and MariBank (no promo page).
- If a bank returns no promos (usually because its page changed), its previous promos are kept and the job is marked failed, so GitHub emails you.
- RCBC's listing has no end dates, so its promos stay until they disappear from RCBC's page. Categories come from the bank's own tags where it has them (Metrobank, EastWest), otherwise they're guessed from the title, so some land in Shopping.

**Fixing a parser:** run the **Snapshot promo pages** workflow from the Actions tab. It saves each bank's raw page to the `snapshots` branch. Compare it with the parser in `scripts/sources/`, update the trimmed sample in `scripts/fixtures/`, and run `node scripts/test-parsers.mjs`.

## Run it
Plain HTML/JS, no build step. Served with GitHub Pages from `main` / root.
