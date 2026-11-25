/** Store terms supplied by the merchant; no unconfirmed exchange promises. */
export const STORE_TERMS = {
  dispatchBusinessDays: 2,
  unconditionalReturnDays: 30,
  cleaningIntervalDays: 15,
  freeShippingLabel: "Ücretsiz Kargo",
  cartDiscountLabel: "Sepette Özel İndirim",
} as const;

export const DISPATCH_TEXT = `Tabanlıklarınız ${STORE_TERMS.dispatchBusinessDays} iş günü içerisinde kargoya verilir.`;
export const RETURN_TEXT = `Tabanlıklarınız ${STORE_TERMS.unconditionalReturnDays} gün koşulsuz iade garantisi altındadır. Memnun kalmazsanız ${STORE_TERMS.unconditionalReturnDays} gün içerisinde iade edebilirsiniz.`;
export const CLEANING_TEXT = `${STORE_TERMS.cleaningIntervalDays} günde bir nemli bez ile tabanlıklarınızı temizlemeniz yeterlidir.`;
