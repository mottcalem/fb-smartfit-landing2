/** Store terms supplied by the merchant; no unconfirmed exchange promises. */
export const STORE_TERMS = {
  dispatchBusinessDays: 1,
  unconditionalReturnDays: 30,
  cleaningIntervalDays: 15,
  /** Merchant offer: 20% off the second insole in the same cart. */
} as const;

export const DISPATCH_TEXT = `Tabanlıklarınız ${STORE_TERMS.dispatchBusinessDays} iş günü içerisinde kargoya verilir.`;
export const RETURN_TEXT = `Tabanlıklarınız ${STORE_TERMS.unconditionalReturnDays} gün koşulsuz iade garantisi altındadır. Memnun kalmazsanız ${STORE_TERMS.unconditionalReturnDays} gün içerisinde iade edebilirsiniz.`;
export const CLEANING_TEXT = `${STORE_TERMS.cleaningIntervalDays} günde bir nemli bez ile tabanlıklarınızı temizlemeniz yeterlidir.`;