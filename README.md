# Kaskas!

**Saan ka kakaskas?** A mobile web app that tells you which of *your* credit cards earns the most rewards for the purchase you're about to make.

## What it does
- **Cards ko**: pick the cards in your wallet once. They're saved on your phone and pre-selected next time.
- **Checkout check**: choose a category (or type the merchant), enter the amount, and get your cards ranked.
- **Earn → Conversion → Redemption**: each card shows the three layers separately, then the effective peso value and % back.
- **Kodigo**: a cheat sheet of your best card per category.
- **Smart defaults**: remembers your last category and recent amounts.
- **Share**: share the app, or flex a specific result with a link that pre-fills the category and amount.
- **Add to Home Screen** guide for iPhone and Android; works offline once installed.
- **Location hint** (optional, off until you tap it).

## Card data
All rates in `cards.js` are **sample values** for the prototype. Replace them with verified terms from each bank before relying on the rankings.

## Run it
It's plain HTML/JS with no build step. Open `index.html`, or serve it with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
