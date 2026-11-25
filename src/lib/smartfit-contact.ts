/** Merchant contact details shown in the footer. Empty fields are simply not rendered. */
export const CONTACT = {
  phone: "",
  whatsapp: "",
  email: "info@onbrands.com.tr",
  address: "",
  instagram: "",
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const waHref = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
export const mailHref = (email: string) => `mailto:${email}`;
export const igHref = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, "")}`;

/** True when at least one contact channel has a value. */
export const hasContact = () =>
  Object.values(CONTACT).some((value) => value.trim().length > 0);
