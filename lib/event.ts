/** Event + bank transfer details for Youth Retreat. */

export const EVENT = {
  org: "The Apostolic Church Nigeria",
  orgLine: "Igbein Area Youth, LAWMNA Territorial",
  title: "Youth Retreat",
  theme: "Talent Alone Is Not Enough",
  scripture: "Proverbs 22:29",
  dates: "Friday 2nd – Saturday 3rd October 2026",
  datesShort: "2nd – 3rd Oct 2026",
  registrationNote: "Registration from 1:00 PM Friday",
  programNote: "Through Saturday ~4:00 PM",
  venue: "23, Ita-Agemo, Igbein, Abeokuta, Ogun State",
  venueShort: "Ita-Agemo, Igbein, Abeokuta",
} as const;

export type RegistrationStatus =
  | "pending_payment"
  | "awaiting_review"
  | "confirmed"
  | "rejected";

export function paymentDetails() {
  return {
    bank: process.env.PAYMENT_BANK || "Opay",
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || "7051865730",
    accountName: process.env.PAYMENT_ACCOUNT_NAME || "Rachel Oluwabukola",
    amountNgn: Number(process.env.PAYMENT_AMOUNT_NGN || 500),
  };
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
