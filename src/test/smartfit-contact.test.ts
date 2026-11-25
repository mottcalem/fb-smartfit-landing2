import { describe, expect, it } from "vitest";
import { CONTACT, hasContact, igHref, mailHref, telHref, waHref } from "@/lib/smartfit-contact";

describe("footer contact links", () => {
  it("builds a dialable tel link from formatted phone numbers", () => {
    expect(telHref("+90 (212) 345 67 89")).toBe("tel:+902123456789");
    expect(telHref("0555 111 22 33")).toBe("tel:05551112233");
  });

  it("builds a WhatsApp link from digits only", () => {
    expect(waHref("+90 555 111 22 33")).toBe("https://wa.me/905551112233");
  });

  it("accepts an Instagram handle with or without the @ prefix", () => {
    expect(igHref("@footbalance")).toBe("https://www.instagram.com/footbalance");
    expect(igHref("footbalance")).toBe("https://www.instagram.com/footbalance");
  });

  it("turns an e-mail address into a mailto link", () => {
    expect(mailHref("satis@ornek.com")).toBe("mailto:satis@ornek.com");
  });

  it("hides the contact block while no channel is filled in", () => {
    expect(hasContact()).toBe(
      Object.values(CONTACT).some((value) => value.trim().length > 0),
    );
  });
});
