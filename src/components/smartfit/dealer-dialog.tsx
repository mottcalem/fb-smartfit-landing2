import { useState } from "react";
import { Check, Store } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STORE_TYPES, dealerSchema } from "@/lib/dealer";
import { submitDealerApplication } from "@/lib/dealer.functions";
import { cn } from "@/lib/utils";

const EMPTY = { storeName: "", contactName: "", phone: "", email: "", city: "", storeType: "", message: "" };

export function DealerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = dealerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.path[0] === "storeType" ? "Mağaza tipini seçin" : i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await submitDealerApplication({ data: parsed.data });
      setStatus("done");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  const field = (k: keyof typeof EMPTY, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`d-${k}`}>{label}</Label>
      <Input id={`d-${k}`} value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStatus("idle"); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {status === "done" ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="h-7 w-7" /></div>
            <h3 className="mt-4 text-xl font-extrabold text-navy">Başvurunuz alındı</h3>
            <p className="mt-2 text-sm text-muted-foreground">Bayilik ekibimiz bilgilerinizi inceleyip sizinle iletişime geçecek.</p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>Kapat</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Store className="h-5 w-5" /></div>
              <DialogTitle className="text-2xl font-extrabold text-navy">FootBalance Bayisi Olun</DialogTitle>
              <DialogDescription>Spor ve ayakkabı perakendecileri için. Bilgilerinizi bırakın, bayilik için size ulaşalım.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("storeName", "Mağaza adı *")}
                {field("contactName", "Yetkili adı soyadı *")}
                {field("phone", "Telefon *", { type: "tel", inputMode: "tel" })}
                {field("email", "E-posta", { type: "email" })}
                {field("city", "Şehir *")}
              </div>
              <div className="space-y-1.5">
                <Label>Mağaza tipi *</Label>
                <div className="flex flex-wrap gap-2">
                  {STORE_TYPES.map((t) => (
                    <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, storeType: t }))}
                      className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                        form.storeType === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}>
                      {t}
                    </button>
                  ))}
                </div>
                {errors["storeType"] && <p className="text-xs text-destructive">{errors["storeType"]}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-message">Notunuz</Label>
                <Textarea id="d-message" rows={3} value={form.message} onChange={set("message")} placeholder="Mağaza sayısı, konum vb." />
              </div>
              {status === "error" && <p className="text-sm text-destructive">Başvuru gönderilemedi, lütfen tekrar deneyin.</p>}
              <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? "Gönderiliyor…" : "Başvuruyu Gönder"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
