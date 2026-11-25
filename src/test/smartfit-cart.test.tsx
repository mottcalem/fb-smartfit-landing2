import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/index";

const Landing = Route.options.component!;

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("SmartFit satın alma akışı", () => {
  it("öneride seçilen modeli ve numarayı doğrudan sepete ekler", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    const clarity = vi.fn();
    vi.stubGlobal("gtag", gtag);
    vi.stubGlobal("fbq", fbq);
    vi.stubGlobal("clarity", clarity);
    window.history.replaceState(null, "", "/?gclid=test-click&utm_source=test&extra=excluded");
    render(<Landing />);
    window.history.replaceState(null, "", "/");
    fireEvent.click(screen.getByRole("button", { name: /Günlük kullanım/ }));
    fireEvent.click(screen.getByRole("button", { name: /Dengeli/ }));
    fireEvent.click(screen.getByRole("radio", { name: /^XL 44–45$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Önerimi Gör" }));
    fireEvent.click(screen.getByRole("button", { name: "SmartFit Energy" }));
    fireEvent.click(screen.getByRole("button", { name: "Sepete Ekle" }));

    expect(screen.queryByRole("dialog", { name: "SmartFit'ini seç" })).not.toBeInTheDocument();
    const cart = within(screen.getByRole("dialog", { name: "Sepetin" }));
    expect(cart.getByRole("status")).toHaveTextContent("SmartFit Energy XL sepete eklendi.");
    const checkout = cart.getByRole<HTMLAnchorElement>("link", { name: "Ödemeye geç" });
    const url = new URL(checkout.href);
    expect(url.pathname).toBe("/cart/68251415970088:1");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      storefront: "true", "attributes[lp]": "smartfit-a", utm_source: "test", gclid: "test-click",
    });
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", expect.objectContaining({
      value: 4900, currency: "TRY",
      items: [expect.objectContaining({ item_id: "68251415970088", quantity: 1 })],
    }));
    expect(fbq).toHaveBeenCalledWith("track", "AddToCart", expect.objectContaining({
      content_ids: ["68251415970088"],
    }), expect.objectContaining({ eventID: expect.any(String) }));
    expect(gtag).not.toHaveBeenCalledWith("event", "begin_checkout", expect.anything());

    checkout.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(checkout);
    expect(gtag).toHaveBeenCalledWith("event", "begin_checkout", expect.objectContaining({ lp_variant: "smartfit-a" }));
    expect(clarity).toHaveBeenCalledWith("event", "checkout_click");
    expect(gtag.mock.calls.filter(([, name]) => name === "add_to_cart")).toHaveLength(1);
  });

  it("seçimi doğrular, varyantları adetleriyle birleştirir ve Shopify bağlantısını günceller", () => {
    const page = render(<Landing />);
    const chooseModel = (name: string) => {
      const card = screen.getByRole("article", { name });
      fireEvent.click(within(card).getByRole("button", { name: "Numaranı Seç" }));
      return within(screen.getByRole("dialog", { name: "SmartFit'ini seç" }));
    };
    const add = (dialog: ReturnType<typeof within>, size: RegExp) => {
      fireEvent.click(dialog.getByRole("radio", { name: size }));
      fireEvent.click(dialog.getByRole("button", { name: "Sepete ekle · 4.900 TL" }));
      return within(screen.getByRole("dialog", { name: "Sepetin" }));
    };

    let buy = chooseModel("SmartFit Konfor");
    expect(buy.getByRole("radio", { name: "SmartFit Konfor" })).toBeChecked();
    expect(buy.getByRole("button", { name: "Önce numaranı seç" })).toBeDisabled();
    fireEvent.click(buy.getByRole("button", { name: "Önce numaranı seç" }));
    expect(screen.queryByRole("dialog", { name: "Sepetin" })).not.toBeInTheDocument();

    fireEvent.click(buy.getByRole("radio", { name: /M 40–41/ }));
    fireEvent.click(buy.getByRole("radio", { name: "SmartFit Energy" }));
    expect(buy.getByRole("radio", { name: /M 40–41/ })).toBeChecked();
    fireEvent.click(buy.getByRole("radio", { name: "SmartFit Konfor" }));

    let cart = add(buy, /M 40–41/);
    expect(cart.getByRole("status")).toHaveTextContent("SmartFit Konfor M sepete eklendi.");
    fireEvent.click(cart.getByRole("button", { name: "Alışverişe Devam Et" }));
    expect(screen.queryByRole("dialog", { name: "Sepetin" })).not.toBeInTheDocument();
    buy = chooseModel("SmartFit Konfor");
    expect(buy.getByRole("button", { name: "Önce numaranı seç" })).toBeDisabled();

    cart = add(buy, /M 40–41/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(1);
    expect(cart.getByText("M (40–41) · Adet 2")).toBeInTheDocument();
    expect(cart.getByText("Toplam (KDV dahil)").parentElement).toHaveTextContent("9.800 TL");
    expect(cart.getByText("Ücretsiz Kargo")).toBeInTheDocument();
    expect(cart.getByText("Sepette Özel İndirim")).toBeInTheDocument();
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getByText("9.800 TL")).toBeInTheDocument();
    fireEvent.click(cart.getByRole("button", { name: "Close" }));

    cart = add(chooseModel("SmartFit Energy"), /XL 44–45/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(2);
    const checkout = cart.getByRole("link", { name: "Ödemeye geç" });
    expect(checkout).toHaveAttribute("href", "https://shop.footbalance.com.tr/cart/68251290599720:2,68251415970088:1?storefront=true&attributes%5Blp%5D=smartfit-a");
    expect(checkout).toHaveAttribute("target", "_blank");
    expect(checkout).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("button", { name: "Sepet, 3 ürün", hidden: true })).toBeInTheDocument();

    fireEvent.click(cart.getByRole("button", { name: "Kaldır: SmartFit Konfor M" }));
    expect(cart.getByRole("status")).toHaveTextContent("SmartFit Konfor M sepetten kaldırıldı.");
    expect(checkout).toHaveAttribute("href", "https://shop.footbalance.com.tr/cart/68251415970088:1?storefront=true&attributes%5Blp%5D=smartfit-a");
    fireEvent.click(cart.getByRole("button", { name: "Kaldır: SmartFit Energy XL" }));
    expect(cart.getByText("Sepetin boş.")).toBeInTheDocument();
    expect(cart.queryByRole("link", { name: "Ödemeye geç" })).not.toBeInTheDocument();

    fireEvent.click(cart.getByRole("button", { name: "Close" }));
    cart = add(chooseModel("SmartFit Konfor"), /M 40–41/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(1);
    page.unmount();
    render(<Landing />);
    fireEvent.click(screen.getByRole("button", { name: "Sepet, 0 ürün" }));
    expect(screen.getByText("Sepetin boş.")).toBeInTheDocument();
  });
});
