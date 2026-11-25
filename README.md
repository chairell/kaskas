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
- **Cheat sheet**, recent amounts, sharing, an Add to Home Screen guide, and offline support.

## Card data
`cards.js` holds 41 cards from BPI, BDO, UnionBank, Metrobank, Maya, MariBank, PNB and EastWest, compiled from each bank's website and published terms on Nov 25, 2026. Every card links to its source.

Not modelled: limited-time promos, annual caps beyond a simple per-cycle limit, and cards with no published earn rate (for example PNB Ze-Lo). Rates change often, so verify before relying on a ranking.

## Run it
Plain HTML/JS, no build step. Served with GitHub Pages from `main` / root.
