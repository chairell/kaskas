// Sulit Swipe card data — compiled from bank websites and published terms, checked 2026-11-25.
// Rates change often. Every card lists its source; verify before relying on a ranking.
//
// Card types
//   cash   : cashback/rebate. rates = fraction per category; merch = merchant overrides.
//   points : bank points.  per = pesos per point (perCat/perMerch override), mult = multiplier by category.
//            redeem = list of options: {kind:"cash", val: pesos per point} or {kind:"miles", ppm: points per mile, prog}
//   miles  : earns airline miles directly (same fields as points; redeem is miles at ppm 1).
// Optional
//   minTxn : minimum single-transaction amount to earn.
//   cap    : max reward per statement cycle (pesos), applied as an upper limit for one transaction.
//   capNote: cap text shown to the user.
//   cond   : spend condition the user can tick in "My cards"; {label, rates|merch} replace base rates when ticked.
//   choose : bonus categories the cardholder picks with the bank; {n, mult, options: {bank label: [app categories]}, def}.
//   note   : shown under the result.

const CATS = ["Dining", "Groceries", "Drugstore", "Fuel", "Shopping", "Online", "Transport", "Travel", "Overseas", "Bills", "Other"];

const MERCHANTS = {
  landers: { name: "Landers", cat: "Groceries" },
  robinsons: { name: "Robinsons stores", cat: "Shopping" },
  puregold: { name: "Puregold", cat: "Groceries" },
  cebpac: { name: "Cebu Pacific", cat: "Travel" },
  pal: { name: "Philippine Airlines", cat: "Travel" },
  sia: { name: "Singapore Airlines / Scoot", cat: "Travel" },
  petron: { name: "Petron", cat: "Fuel" },
  shell: { name: "Shell", cat: "Fuel" },
  meralco: { name: "Meralco", cat: "Bills" },
  shopee: { name: "Shopee", cat: "Online" },
  zalora: { name: "ZALORA", cat: "Online" }
};

// Merchant keyword → merchant key or category
const MERCH_WORDS = {
  landers: "landers", robinsons: "robinsons", shopwise: "robinsons", marketplace: "robinsons", easymart: "robinsons",
  puregold: "puregold", cebupacific: "cebpac", cebpac: "cebpac", philippineairlines: "pal", pal: "pal",
  singaporeairlines: "sia", scoot: "sia", petron: "petron", shell: "shell", meralco: "meralco", shopee: "shopee",
  jollibee: "Dining", mcdo: "Dining", mcdonalds: "Dining", chowking: "Dining", starbucks: "Dining", grabfood: "Dining", foodpanda: "Dining",
  sm: "Shopping", ayala: "Shopping", uniqlo: "Shopping",
  sandr: "Groceries", savemore: "Groceries", rustans: "Groceries", alfamart: "Groceries", "711": "Groceries",
  mercury: "Drugstore", watsons: "Drugstore", southstar: "Drugstore",
  caltex: "Fuel", seaoil: "Fuel", cleanfuel: "Fuel",
  lazada: "Online", zalora: "zalora", tiktok: "Online",
  grab: "Transport", angkas: "Transport", joyride: "Transport", move: "Transport", autosweep: "Transport", easytrip: "Transport", lrt: "Transport", mrt: "Transport",
  agoda: "Travel", booking: "Travel", airasia: "Travel",
  globe: "Bills", smart: "Bills", pldt: "Bills", converge: "Bills", maynilad: "Bills", manilawater: "Bills"
};

const BPI_CASH = { kind: "cash", val: 0.05, label: "Shopping credits (20,000 pts = ₱1,000)" };
const RCBC_CASH = { kind: "cash", val: 1000 / 6600, label: "Cash credit (6,600 pts = ₱1,000)" };
const RCBC_MILES = { kind: "miles", ppm: 5, prog: "Mabuhay Miles / Asia Miles / airasia" };
const MB_VOUCHER ={ kind: "cash", val: 1000 / 23340, label: "eVoucher (23,340 pts = ₱1,000)" };

const CARDS = [
  // ───── BPI ─────
  { id: "bpi_rewards", bank: "BPI", name: "BPI Rewards Card", type: "points", per: 35,
    redeem: [BPI_CASH, { kind: "miles", ppm: 16, prog: "PAL Mabuhay Miles" }],
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_gold", bank: "BPI", name: "BPI Gold Rewards Card", type: "points", per: 35,
    redeem: [BPI_CASH, { kind: "miles", ppm: 16, prog: "PAL Mabuhay Miles" }],
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_ecredit", bank: "BPI", name: "BPI eCredit Card", type: "points", per: 35,
    redeem: [BPI_CASH, { kind: "miles", ppm: 16, prog: "PAL Mabuhay Miles" }],
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_edge", bank: "BPI", name: "BPI Edge Card", type: "points", per: 50,
    redeem: [BPI_CASH, { kind: "miles", ppm: 16, prog: "PAL Mabuhay Miles" }],
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_plat", bank: "BPI", name: "BPI Platinum Rewards Card", type: "points", per: 15, perCat: { Overseas: 10 },
    redeem: [BPI_CASH, { kind: "miles", ppm: 16000 / 2200, prog: "PAL Mabuhay Miles (with bonus)" }],
    note: "2 points per ₱30 local, 2 per ₱20 foreign. PAL bonus miles cut to 1,200 per 1,000 from Nov 16, 2026.",
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_sig", bank: "BPI", name: "BPI Signature Card", type: "points", per: 10,
    redeem: [BPI_CASH, { kind: "miles", ppm: 16000 / 2200, prog: "PAL Mabuhay Miles (with bonus)" }],
    note: "2 points per ₱20.",
    src: "https://www.bpi.com.ph/rewards/earn/purchase-with-your-bpi-credit-card" },
  { id: "bpi_amore", bank: "BPI", name: "BPI Amore Cashback Card", type: "cash",
    rates: { Groceries: 0.04, Drugstore: 0.01, Bills: 0.01, Other: 0.003 }, capNote: "₱15,000 cashback a year",
    src: "https://www.bpi.com.ph/personal/cards/credit-cards/amore-visa-platinum/terms-and-conditions" },
  { id: "bpi_robinsons", bank: "BPI", name: "Robinsons Cashback Card (ex-Amore Platinum)", type: "cash", minTxn: 1000,
    rates: { Dining: 0.04, Groceries: 0.01, Shopping: 0.01, Other: 0.003 },
    merchTiers: { robinsons: [[3500, 0.03], [1000, 0.01]] }, capNote: "₱20,000 cashback a year",
    note: "Earns only on single receipts of ₱1,000 or more. Robinsons brands: 1% from ₱1,000, 3% from ₱3,500.",
    src: "https://www.bpi.com.ph/personal/cards/credit-cards/robinsons-cashback-card-visa/terms-and-conditions" },

  // ───── BDO ─────
  { id: "bdo_std", bank: "BDO", name: "BDO Classic / Standard / Gold", type: "points", per: 1000,
    redeem: [{ kind: "cash", val: 1, label: "Cash credit (1 Peso Point = ₱1)" }],
    note: "1 Peso Point per ₱1,000.",
    src: "https://www.aem.bdo.com.ph/content/dam/cbg/marketing-services/channels/cards/pdf-files/CC-Peso-Rewards-FAQ-2025.pdf" },
  { id: "bdo_plat", bank: "BDO", name: "BDO Platinum / Diamond / World Elite", type: "points", per: 1000,
    redeem: [{ kind: "cash", val: 1, label: "Cash credit (1 Peso Point = ₱1)" }],
    note: "1 Peso Point per ₱1,000. World Elite earns 1.5 points per US$20 on dollar billing.",
    src: "https://www.aem.bdo.com.ph/content/dam/cbg/marketing-services/channels/cards/pdf-files/CC-Peso-Rewards-FAQ-2025.pdf" },
  { id: "bdo_shopmore", bank: "BDO", name: "BDO ShopMore Mastercard", type: "points", per: 500,
    redeem: [{ kind: "cash", val: 1, label: "Cash credit or SMAC (1 point = ₱1)" }],
    note: "Permanent 2x: 2 Peso Points per ₱1,000.",
    src: "https://www.aem.bdo.com.ph/content/dam/cbg/marketing-services/channels/cards/pdf-files/CC-Peso-Rewards-FAQ-2025.pdf" },

  // ───── UnionBank ─────
  { id: "ub_rewards", bank: "UnionBank", name: "UnionBank Rewards (Visa / Mastercard)", type: "points", per: 30,
    mult: { Dining: 3, Shopping: 3 },
    redeem: [{ kind: "miles", ppm: 8, prog: "Asia Miles" }],
    note: "3x points on shopping and dining, local and abroad. Cash-credit rate isn't published.",
    src: "https://www.cathaypacific.com/cx/en_TW/our-partners/union-bank.html" },
  { id: "ub_platinum", bank: "UnionBank", name: "UnionBank Platinum (legacy)", type: "points", per: 30,
    mult: { Dining: 5, Shopping: 5, Overseas: 5 },
    redeem: [{ kind: "miles", ppm: 8, prog: "Asia Miles" }],
    note: "5x points on dining, shopping and foreign currency spend.",
    src: "https://unionbankph.com/cards/credit-card?id=160" },
  { id: "ub_miles", bank: "UnionBank", name: "UnionBank Miles+ (Visa Signature / World)", type: "points", per: 30,
    redeem: [{ kind: "miles", ppm: 1.6, prog: "Asia Miles" }, { kind: "miles", ppm: 3, prog: "PAL Mabuhay Miles" }],
    note: "1 UnionBank mile per ₱30.",
    src: "https://www.cathaypacific.com/cx/en_TW/our-partners/union-bank.html" },
  { id: "ub_cashback", bank: "UnionBank", name: "UnionBank Cash Back (Visa Platinum / Titanium)", type: "cash",
    rates: { Other: 0.002 }, cap: 1250, capNote: "₱1,250 per statement cycle",
    cond: { label: "I spend ₱10,000+ outside supermarkets each cycle", rates: { Groceries: 0.06, Other: 0.002 }, merch: { meralco: 0.02 } },
    note: "6% at supermarkets and 2% on Meralco (via UnionBank Online) only after ₱10,000 other spend.",
    src: "https://unionbankph.com/sites/default/files/2023-12/UBLegal_Rewards-Program-Aug23.pdf" },
  { id: "ub_cebpac", bank: "UnionBank", name: "UnionBank Cebu Pacific (Gold / Platinum)", type: "points", per: 200, perMerch: { cebpac: 100 },
    redeem: [{ kind: "cash", val: 1, label: "Go Rewards (1 point = ₱1)" }],
    src: "https://gorewards.unionbankph.com/cebupacific" },
  { id: "ub_gorewards", bank: "UnionBank", name: "UnionBank Go Rewards (Gold / Platinum)", type: "points", per: 200,
    redeem: [{ kind: "cash", val: 1, label: "Go Rewards (1 point = ₱1)" }],
    src: "https://unionbankph.com/cards/credit-card?id=160" },
  { id: "ub_shell", bank: "UnionBank", name: "UnionBank Shell Power Visa Platinum", type: "cash",
    rates: { Other: 0 }, merch: { shell: 0.05 },
    note: "Rebate is for Shell only; other spend isn't listed as earning.",
    src: "https://www.moneymax.ph/page/cards/partners/unionbank" },

  // ───── Metrobank ─────
  { id: "mb_rewardsplus", bank: "Metrobank", name: "Metrobank Rewards Plus Visa", type: "points", per: 20, mult: { Online: 2 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 25, prog: "PAL Mabuhay Miles" }],
    note: "2x on gadgets, internet and online spend. Points never expire.",
    src: "https://www.metrobank.com.ph/cards/credit-cards/rewards" },
  { id: "mb_travel", bank: "Metrobank", name: "Metrobank Travel Platinum Visa", type: "points", per: 20, mult: { Travel: 3, Overseas: 3 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 2.5, prog: "PAL Mabuhay Miles" }],
    note: "1 mile per ₱17 on airlines, hotels and foreign currency; 1 per ₱50 elsewhere.",
    src: "https://metrobank.com.ph/creditcard/travel" },
  { id: "mb_world", bank: "Metrobank", name: "Metrobank World Mastercard", type: "points", per: 20, mult: { Overseas: 3 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 2.5, prog: "PAL Mabuhay Miles" }],
    note: "Online and hotel 3x promo ends Dec 29, 2026.",
    src: "https://www.metrobank.com.ph/articles/earn-air-miles-with-your-metrobank-world-mastercard" },
  { id: "mb_platinum", bank: "Metrobank", name: "Metrobank Platinum Mastercard", type: "points", per: 20, mult: { Dining: 3, Online: 3 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 5, prog: "PAL Mabuhay Miles" }],
    src: "https://lifestyle.inquirer.net/?p=365442" },
  { id: "mb_femme_sig", bank: "Metrobank", name: "Metrobank Femme Signature Visa", type: "points", per: 20, mult: { Drugstore: 3, Online: 3 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 5, prog: "PAL Mabuhay Miles" }],
    src: "https://lifestyle.inquirer.net/?p=365442" },
  { id: "mb_titanium", bank: "Metrobank", name: "Metrobank Titanium Mastercard", type: "points", per: 20,
    mult: { Dining: 4, Online: 4, Shopping: 4, Overseas: 4 },
    redeem: [MB_VOUCHER, { kind: "miles", ppm: 25, prog: "PAL Mabuhay Miles" }],
    note: "Up to 4x on dining, online, shopping and overseas.",
    src: "https://www.moneymax.ph/credit-card/articles/redeem-credit-card-points-philippines" },
  { id: "mb_cashback", bank: "Metrobank", name: "Metrobank Cashback Visa", type: "cash",
    rates: { Other: 0.002 }, cap: 1000, capNote: "₱1,000 per statement cycle",
    cond: { label: "I spend ₱12,000+ on other categories each cycle", rates: { Groceries: 0.05, Bills: 0.05, Other: 0.002 } },
    note: "5% on groceries, telecom, school and bookstores only after ₱12,000 other spend.",
    src: "https://metrobankcard.com/cards/cashback-visa-termsandconditions" },

  // ───── Maya ─────
  { id: "maya_landers", bank: "Maya", name: "Landers Cashback Everywhere", type: "cash",
    rates: { Dining: 0.02, Other: 0.01 }, merch: { landers: 0.03 },
    cond: { label: "I spend ₱20,000+ a month on this card", merch: { landers: 0.04 } },
    note: "Landers: 3%, 4% from ₱20k monthly spend, 5% from ₱50k. Points are ₱1 each, used at Landers.",
    src: "https://www.mayabank.ph/creditcard/landers" },
  { id: "maya_black", bank: "Maya", name: "Maya Black Credit Card", type: "points", per: 40,
    redeem: [{ kind: "miles", ppm: 1, prog: "Maya Miles (valued like airline miles)" }],
    note: "Up to 10x at Maya Black Preferred merchants on a Maya terminal. Airline conversion rate not published yet.",
    src: "https://www.moneymax.ph/credit-card/products/maya-black" },

  // ───── MariBank ─────
  { id: "mari", bank: "MariBank", name: "MariBank Credit Card", type: "cash",
    rates: { Overseas: 0.01, Online: 0.01, Other: 0.01 },
    capNote: "Groceries, drugstores and fuel share a ₱3,000 monthly cap",
    note: "Overseas in-store 1% is a promo until Jan 31, 2027. Overseas online earns nothing and has a 2% fee.",
    src: "https://banking-aka-storage.maribank.ph/maribank/ph/cmps-website/report/1-MariBank-Credit-Card-Cashback-Terms-and-Conditions.pdf" },

  // ───── PNB ─────
  { id: "pnb_essentials", bank: "PNB", name: "PNB Essentials Mastercard", type: "points", per: 70,
    redeem: [{ kind: "cash", val: 0.25, label: "Cash credit (4 pts = ₱1)" }, { kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    src: "https://www.pnb.com.ph/storage/asset-libraries/pJHyPgmdIdtQHEaGrXZzHacYB3XiClbXrAVhMSQq.pdf" },
  { id: "pnb_platinum", bank: "PNB", name: "PNB Platinum Mastercard / Diamond UnionPay", type: "points", per: 70,
    redeem: [{ kind: "cash", val: 0.25, label: "Cash credit (4 pts = ₱1)" }, { kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    src: "https://pnb.com.ph/index.php/pnb-platinum-mastercard-flexible-rewards?tpl=revamp" },
  { id: "pnb_pal_now", bank: "PNB", name: "PNB-PAL Mabuhay Miles NOW", type: "miles", per: 58,
    redeem: [{ kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    src: "https://www.pnb.com.ph/storage/asset-libraries/fbVoFf24V787TicBTcxksm31ZWaq2k6M4lg5ibkr.pdf" },
  { id: "pnb_pal_plat", bank: "PNB", name: "PNB-PAL Mabuhay Miles Platinum", type: "miles", per: 48,
    redeem: [{ kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    src: "https://www.pnb.com.ph/storage/asset-libraries/fbVoFf24V787TicBTcxksm31ZWaq2k6M4lg5ibkr.pdf" },
  { id: "pnb_pal_world", bank: "PNB", name: "PNB-PAL Mabuhay Miles World", type: "miles", per: 38, perMerch: { pal: 30 },
    redeem: [{ kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    note: "₱30 per mile on everything if you keep ₱100M+ at PNB.",
    src: "https://www.pnb.com.ph/index.php/pnb-mabuhay-miles-world-mastercard-premium-rewards?tpl=revamp" },
  { id: "pnb_pal_elite", bank: "PNB", name: "PNB-PAL Mabuhay Miles World Elite", type: "miles", per: 28,
    redeem: [{ kind: "miles", ppm: 1, prog: "PAL Mabuhay Miles" }],
    src: "https://www.pnb.com.ph/storage/asset-libraries/fbVoFf24V787TicBTcxksm31ZWaq2k6M4lg5ibkr.pdf" },

  // ───── EastWest ─────
  { id: "ew_kf_plat", bank: "EastWest", name: "EastWest Singapore Airlines KrisFlyer Platinum", type: "miles", per: 88,
    perCat: { Travel: 15, Overseas: 15, Dining: 45, Online: 45 }, perMerch: { sia: 15 },
    redeem: [{ kind: "miles", ppm: 1, prog: "KrisFlyer" }],
    note: "₱45 per mile on other airlines too. No cap.",
    src: "https://www.eastwestbanker.com/pages/terms-and-conditions-governing-eastwest-singapore-airlines-krisflyer-mastercard" },
  { id: "ew_kf_world", bank: "EastWest", name: "EastWest Singapore Airlines KrisFlyer World", type: "miles", per: 78,
    perCat: { Travel: 12, Overseas: 12, Dining: 38, Online: 38 }, perMerch: { sia: 12 },
    redeem: [{ kind: "miles", ppm: 1, prog: "KrisFlyer" }],
    note: "₱38 per mile on other airlines too. No cap.",
    src: "https://www.eastwestbanker.com/pages/terms-and-conditions-governing-eastwest-singapore-airlines-krisflyer-mastercard" },
  { id: "ew_platinum", bank: "EastWest", name: "EastWest Platinum Mastercard", type: "points", per: 40,
    redeem: [{ kind: "cash", val: 500 / 3335, label: "Cash rebate (3,335 pts = ₱500)" }],
    src: "https://www.eastwestbanker.com/sites/default/files/2026-01/platinum-rewards-aug2021.pdf" },
  { id: "ew_visa_plat", bank: "EastWest", name: "EastWest Visa Platinum", type: "cash",
    rates: { Other: 0.003 }, cap: 1250, capNote: "₱1,250 per cycle",
    note: "0.3% base. Bonus 8.58% on promoted categories, which change — check the bank's current list.",
    src: "https://cms.eastwestbanker.com/node/3369" },
  { id: "ew_puregold", bank: "EastWest", name: "EastWest Puregold Always Panalo Visa", type: "points", per: 100, perMerch: { puregold: 30 },
    redeem: [{ kind: "cash", val: 1, label: "Puregold P-Wallet (1 pt = ₱1)" }], cap: 3000, capNote: "₱3,000 P-Wallet credits a month",
    src: "https://www.philstar.com/business/2025/04/04/2433278/eastwest-puregold-launch-visa-credit-card" },
  { id: "ew_jcb", bank: "EastWest", name: "EastWest JCB Platinum / Gold", type: "points", per: 100,
    redeem: [{ kind: "miles", ppm: 5, prog: "PAL Mabuhay Miles" }],
    src: "https://www.eastwestbanker.com/cards/creditcards/eastwest-jcb-reward" },
  { id: "ew_infinite", bank: "EastWest", name: "EastWest Priority Visa Infinite", type: "points", per: 10,
    redeem: [{ kind: "cash", val: 0.05, label: "Cash rebate (20,000 pts = ₱1,000)" }],
    src: "https://www.eastwestbanker.com/sites/default/files/2026-03/infinite-rewards-catalog-2026.pdf" },

  // ───── RCBC ─────
  // Standard RCBC Rewards: ₱36 per point at "discretionary" merchants, ₱125 at supermarkets/drugstores/gas, ₱250 on bills via Fast BillsPay.
  { id: "rcbc_std", bank: "RCBC", name: "RCBC Classic / Gold / Platinum / World Mastercard", type: "points", per: 36,
    perCat: { Groceries: 125, Drugstore: 125, Fuel: 125, Bills: 250 },
    redeem: [RCBC_CASH, RCBC_MILES],
    src: "https://rcbccredit.com/features-and-benefits/rewards/rewards-points" },
  { id: "rcbc_jcb", bank: "RCBC", name: "RCBC JCB Classic / Gold / Platinum", type: "points", per: 36,
    perCat: { Groceries: 125, Drugstore: 125, Fuel: 125, Bills: 250 },
    redeem: [RCBC_CASH, RCBC_MILES],
    note: "Bonus points on spend in Japan aren't modelled.",
    src: "https://rcbccredit.com/features-and-benefits/rewards/rewards-points" },
  { id: "rcbc_flex", bank: "RCBC", name: "RCBC Flex Visa", type: "points", per: 36,
    perCat: { Groceries: 125, Drugstore: 125, Fuel: 125, Bills: 250 },
    choose: { n: 2, mult: 2, options: { Dining: ["Dining"], Clothing: ["Shopping"], Travel: ["Travel"], Transportation: ["Transport"] }, def: ["Dining", "Travel"] },
    redeem: [RCBC_CASH, RCBC_MILES],
    note: "2x on the 2 categories you picked with RCBC. Set them in My cards. Clothing counts as Shopping here.",
    src: "https://rcbccredit.com/credit-cards" },
  { id: "rcbc_flexgold", bank: "RCBC", name: "RCBC Flex Gold Visa", type: "points", per: 36,
    perCat: { Groceries: 125, Drugstore: 125, Fuel: 125, Bills: 250 },
    choose: { n: 3, mult: 2, options: { Grocery: ["Groceries"], Gas: ["Fuel"], "Department store": ["Shopping"], "Household appliances": ["Shopping"], Travel: ["Travel"] }, def: ["Grocery", "Gas", "Travel"] },
    redeem: [RCBC_CASH, RCBC_MILES],
    note: "2x on the 3 categories you picked with RCBC. Set them in My cards. Department store and appliances count as Shopping here.",
    src: "https://rcbccredit.com/credit-cards" },
  { id: "rcbc_visaplat", bank: "RCBC", name: "RCBC Visa Platinum (Preferred AIRMILES)", type: "miles", per: 48,
    perCat: { Overseas: 25 },
    redeem: [{ kind: "miles", ppm: 1, prog: "Mabuhay Miles / Asia Miles / airasia" }],
    note: "Preferred AIRMILES convert 1:1. Local and overseas rates are from Wise's review, not RCBC's page.",
    src: "https://wise.com/ph/blog/mabuhay-miles-credit-card" },
  { id: "rcbc_infinite", bank: "RCBC", name: "RCBC Visa Infinite", type: "points", per: 30, mult: { Online: 3, Overseas: 5 },
    redeem: [RCBC_CASH, RCBC_MILES],
    note: "3x local online, 5x overseas. RCBC doesn't publish this card's redemption rate, so standard RCBC rates are assumed.",
    src: "https://rcbccredit.com/credit-cards/premium-cards/visa-infinite-card" },
  { id: "rcbc_zalora", bank: "RCBC", name: "RCBC ZALORA Credit Card", type: "cash",
    rates: { Other: 0 }, merch: { zalora: 0.06 },
    note: "Up to 6% ZALORA cashback online. Other spend earns RCBC points, but the rate isn't published, so it's counted as zero.",
    src: "https://rcbccredit.com/credit-cards/co-branded-cards" }
];

const BANKS = ["BPI", "BDO", "UnionBank", "Metrobank", "Maya", "MariBank", "PNB", "EastWest", "RCBC"];
