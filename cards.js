// Card data. SAMPLE VALUES ONLY — replace with verified bank terms.
// Points/miles cards: earn = pesos per 1 unit; mult = category multipliers;
// conv = redeemable units per earned unit (e.g. 0.25 = 4 pts → 1 mile);
// val = peso value of 1 redeemable unit; redeem = how it's usually redeemed.
// Cashback cards: cash = rate per category ("Other" is the fallback).
const CATS = ["Kainan", "Grocery", "Gas", "Shopping", "Online", "Abroad", "Iba pa"];

const CARDS = [
  { id: "bpi_rewards", name: "BPI Rewards (sample)", unit: "pt", earn: 35, mult: {}, conv: 1, val: 0.25, redeem: "Statement credit" },
  { id: "bpi_amore", name: "BPI Amore Cashback (sample)", unit: "cashback", cash: { Kainan: 0.04, Grocery: 0.01, Gas: 0.01, "Iba pa": 0.003 } },
  { id: "metro_rewards", name: "Metrobank Rewards Plus (sample)", unit: "pt", earn: 20, mult: { Shopping: 3, Kainan: 3 }, conv: 1, val: 0.2, redeem: "Gift vouchers" },
  { id: "sb_platinum", name: "Security Bank Platinum (sample)", unit: "pt", earn: 30, mult: { Abroad: 2 }, conv: 1, val: 0.35, redeem: "Cash credit" },
  { id: "miles_card", name: "Airline Miles Card (sample)", unit: "mile", earn: 30, mult: { Abroad: 1.5 }, conv: 1, val: 0.8, redeem: "Flights (iba-iba ang value)" },
  { id: "pts_to_miles", name: "Points→Miles Card (sample)", unit: "pt", earn: 20, mult: {}, conv: 0.25, val: 0.8, redeem: "Transfer: 4 pts = 1 mile" }
];

// Merchant keyword → category
const MERCH = {
  jollibee: "Kainan", mcdo: "Kainan", mcdonalds: "Kainan", chowking: "Kainan", starbucks: "Kainan", mang: "Kainan", grabfood: "Kainan", foodpanda: "Kainan",
  sm: "Shopping", ayala: "Shopping", robinsons: "Shopping", uniqlo: "Shopping",
  puregold: "Grocery", landers: "Grocery", sandr: "Grocery", savemore: "Grocery", rustans: "Grocery",
  shell: "Gas", petron: "Gas", caltex: "Gas", seaoil: "Gas",
  lazada: "Online", shopee: "Online", zalora: "Online", tiktok: "Online"
};
