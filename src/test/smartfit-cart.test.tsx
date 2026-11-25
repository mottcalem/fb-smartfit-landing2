import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/index";

const Landing = Route.options.component!;

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    disconnect() {}
  });
});

describe("SmartFit satın alma akışı", () => {
  it("seçimi doğrular, varyantları adetleriyle birleştirir ve Shopify bağlantısını günceller", () => {
    const page = render(<Landing />);
    const chooseModel = (name: RegExp) => {
      fireEvent.click(screen.getByRole("button", { name }));
      return within(screen.getByRole("dialog", { name: "SmartFit'ini seç" }));
    };
    const add = (dialog: ReturnType<typeof within>, size: RegExp) => {
      fireEvent.click(dialog.getByRole("radio", { name: size }));
      fireEvent.click(dialog.getByRole("button", { name: "Sepete ekle · 4.900 TL" }));
      return within(screen.getByRole("dialog", { name: "Sepetin" }));
    };

    let buy = chooseModel(/Konfor'u Keşfet/);
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
    fireEvent.click(cart.getByRole("button", { name: "Close" }));
    buy = chooseModel(/Konfor'u Keşfet/);
    expect(buy.getByRole("button", { name: "Önce numaranı seç" })).toBeDisabled();

    cart = add(buy, /M 40–41/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(1);
    expect(cart.getByText("M (40–41) · Adet 2")).toBeInTheDocument();
    expect(cart.getByText("Toplam (KDV dahil)").parentElement).toHaveTextContent("9.800 TL");
    expect(cart.queryByText(/indirim/i)).not.toBeInTheDocument();
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getByText("9.800 TL")).toBeInTheDocument();
    fireEvent.click(cart.getByRole("button", { name: "Close" }));

    cart = add(chooseModel(/Energy'yi Keşfet/), /XL 44–45/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(2);
    const checkout = cart.getByRole("link", { name: "Ödemeye geç" });
    expect(checkout).toHaveAttribute("href", "https://shop.footbalance.com.tr/cart/68251290599720:2,68251415970088:1?storefront=true");
    expect(checkout).toHaveAttribute("target", "_blank");
    expect(checkout).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("button", { name: "Sepet, 3 ürün", hidden: true })).toBeInTheDocument();

    fireEvent.click(cart.getByRole("button", { name: "Kaldır: SmartFit Konfor M" }));
    expect(cart.getByRole("status")).toHaveTextContent("SmartFit Konfor M sepetten kaldırıldı.");
    expect(checkout).toHaveAttribute("href", "https://shop.footbalance.com.tr/cart/68251415970088:1?storefront=true");
    fireEvent.click(cart.getByRole("button", { name: "Kaldır: SmartFit Energy XL" }));
    expect(cart.getByText("Sepetin boş.")).toBeInTheDocument();
    expect(cart.queryByRole("link", { name: "Ödemeye geç" })).not.toBeInTheDocument();

    fireEvent.click(cart.getByRole("button", { name: "Close" }));
    cart = add(chooseModel(/Konfor'u Keşfet/), /M 40–41/);
    expect(within(cart.getByRole("list", { name: "Sepetteki ürünler" })).getAllByRole("listitem")).toHaveLength(1);
    page.unmount();
    render(<Landing />);
    fireEvent.click(screen.getByRole("button", { name: "Sepet, 0 ürün" }));
    expect(screen.getByText("Sepetin boş.")).toBeInTheDocument();
  });
});
