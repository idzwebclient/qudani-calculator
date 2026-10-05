"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCopy,
  Coins,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  ShoppingBasket,
  Trash2,
  UserRound,
} from "lucide-react";

type Purchase = { id: number; amount: string; quality: string; weight: string };
type Cost = { id: number; description: string; amount: string };

const today = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
};

const money = (value: number) =>
  value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const numberValue = (value: string) => Number.parseFloat(value) || 0;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="section-title">
      <span className="icon-box">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>
    </div>
  );
}

export function ReportBuilder() {
  const [date, setDate] = useState(today);
  const [staff, setStaff] = useState("");
  const [initialCapital, setInitialCapital] = useState("");
  const [todayCapital, setTodayCapital] = useState("");
  const [returnedCapital, setReturnedCapital] = useState("");
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: 1, amount: "", quality: "", weight: "" },
  ]);
  const [costs, setCosts] = useState<Cost[]>([{ id: 1, description: "", amount: "" }]);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    const loadDraft = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("staff-closing-draft");
        if (saved) {
          const draft = JSON.parse(saved);
          setDate(draft.date || today());
          setStaff(draft.staff || "");
          setInitialCapital(draft.initialCapital || "");
          setTodayCapital(draft.todayCapital || "");
          setReturnedCapital(draft.returnedCapital || "");
          if (Array.isArray(draft.purchases) && draft.purchases.length) setPurchases(draft.purchases);
          if (Array.isArray(draft.costs) && draft.costs.length) setCosts(draft.costs);
        }
      } catch {
        window.localStorage.removeItem("staff-closing-draft");
      } finally {
        setReady(true);
      }
    }, 0);

    return () => window.clearTimeout(loadDraft);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      "staff-closing-draft",
      JSON.stringify({ date, staff, initialCapital, todayCapital, returnedCapital, purchases, costs }),
    );
  }, [ready, date, staff, initialCapital, todayCapital, returnedCapital, purchases, costs]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const totalPurchases = purchases.reduce((sum, item) => sum + numberValue(item.amount), 0);
  const totalCosts = costs.reduce((sum, item) => sum + numberValue(item.amount), 0);
  const totalCapital = numberValue(initialCapital) + numberValue(todayCapital);
  const balance = totalCapital - totalPurchases - totalCosts - numberValue(returnedCapital);

  const formattedDate = useMemo(() => {
    if (!date) return "[TARIKH]";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }, [date]);

  const reportText = useMemo(() => {
    const purchaseLines = purchases
      .map(
        (item, index) =>
          `${index + 1}. *RM${money(numberValue(item.amount))}*\n` +
          `   Mutu: ${item.quality || "-"}  |  Berat: ${numberValue(item.weight).toFixed(2)}g`,
      )
      .join("\n");
    const costLines = costs
      .map((item) => `• ${item.description || "-"}: RM${money(numberValue(item.amount))}`)
      .join("\n");

    return `*DAILY REPORT*\n${formattedDate}\nStaff: ${staff || "[Nama Staff]"}\n\n──────────────\n*BELIAN HARI INI*\n${purchaseLines}\n\n*Total Belian: RM${money(totalPurchases)}*\n\n──────────────\n*MODAL*\nModal Awal: RM${money(numberValue(initialCapital))}\nModal Hari Ini: RM${money(numberValue(todayCapital))}\n*Total Modal: RM${money(totalCapital)}*\n\n──────────────\n*KOS*\n${costLines}\n\n*Total Kos: RM${money(totalCosts)}*\n\n──────────────\n*PULANG MODAL*\nRM${money(numberValue(returnedCapital))}\n\n──────────────\n*BAKI MODAL*\n*RM${money(balance)}*`;
  }, [purchases, costs, formattedDate, staff, totalPurchases, initialCapital, todayCapital, totalCapital, totalCosts, returnedCapital, balance]);

  const updatePurchase = (id: number, field: keyof Omit<Purchase, "id">, value: string) => {
    setPurchases((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const updateCost = (id: number, field: keyof Omit<Cost, "id">, value: string) => {
    setCosts((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addPurchase = () => setPurchases((items) => [...items, { id: Date.now(), amount: "", quality: "", weight: "" }]);
  const addCost = () => setCosts((items) => [...items, { id: Date.now(), description: "", amount: "" }]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  const resetForm = () => {
    setDate(today());
    setStaff("");
    setInitialCapital("");
    setTodayCapital("");
    setReturnedCapital("");
    setPurchases([{ id: Date.now(), amount: "", quality: "", weight: "" }]);
    setCosts([{ id: Date.now() + 1, description: "", amount: "" }]);
    window.localStorage.removeItem("staff-closing-draft");
    setCopied(false);
  };

  return (
    <>
      <div className="page-shell">
        <section className="intro compact">
          <span className="eyebrow">STAFF CLOSING · LAPORAN HARIAN</span>
          <h1>Sediakan closing <em>dengan mudah.</em></h1>
          <p>Jumlah dikira automatik dan sedia untuk WhatsApp. <span className="status"><i /> Auto simpan</span></p>
        </section>

        <div className="workspace">
          <div className="form-column">
            <section className="card identity-card">
              <SectionTitle icon={<UserRound size={20} />} title="Maklumat Laporan" hint="Tarikh dan nama staff bertugas" />
              <div className="two-columns">
                <Field label="TARIKH">
                  <div className="input-with-icon"><CalendarDays size={17} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                </Field>
                <Field label="NAMA STAFF">
                  <input type="text" value={staff} onChange={(e) => setStaff(e.target.value)} placeholder="Contoh: Aisyah" />
                </Field>
              </div>
            </section>

            <section className="card">
              <SectionTitle icon={<ShoppingBasket size={20} />} title="Belian Hari Ini" hint="Masukkan semua rekod pembelian" />
              <div className="rows">
                {purchases.map((item, index) => (
                  <div className="entry purchase-entry" key={item.id}>
                    <span className="entry-number">{String(index + 1).padStart(2, "0")}</span>
                    <Field label="BELIAN (RM)"><input type="number" min="0" step="0.01" inputMode="decimal" value={item.amount} onChange={(e) => updatePurchase(item.id, "amount", e.target.value)} placeholder="0.00" /></Field>
                    <Field label="MUTU"><input type="text" value={item.quality} onChange={(e) => updatePurchase(item.id, "quality", e.target.value)} placeholder="Contoh: 916" /></Field>
                    <Field label="BERAT (G)"><input type="number" min="0" step="0.01" inputMode="decimal" value={item.weight} onChange={(e) => updatePurchase(item.id, "weight", e.target.value)} onBlur={(e) => e.target.value && updatePurchase(item.id, "weight", numberValue(e.target.value).toFixed(2))} placeholder="0.00" /></Field>
                    <button className="icon-button danger" aria-label={`Buang belian ${index + 1}`} disabled={purchases.length === 1} onClick={() => setPurchases((items) => items.filter((x) => x.id !== item.id))}><Trash2 size={17} /></button>
                  </div>
                ))}
              </div>
              <button className="add-button" onClick={addPurchase}><Plus size={17} /> Tambah Belian</button>
              <div className="subtotal"><span>Total Belian</span><strong>RM{money(totalPurchases)}</strong></div>
            </section>

            <section className="card">
              <SectionTitle icon={<Banknote size={20} />} title="Modal" hint="Rekod pergerakan modal hari ini" />
              <div className="two-columns">
                <Field label="MODAL AWAL (RM)"><input type="number" min="0" step="0.01" inputMode="decimal" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} placeholder="0.00" /></Field>
                <Field label="MODAL HARI INI (RM)"><input type="number" min="0" step="0.01" inputMode="decimal" value={todayCapital} onChange={(e) => setTodayCapital(e.target.value)} placeholder="0.00" /></Field>
              </div>
              <div className="subtotal blue"><span>Total Modal</span><strong>RM{money(totalCapital)}</strong></div>
            </section>

            <section className="card">
              <SectionTitle icon={<ReceiptText size={20} />} title="Kos" hint="Masukkan kos operasi jika ada" />
              <div className="rows">
                {costs.map((item, index) => (
                  <div className="entry cost-entry" key={item.id}>
                    <span className="entry-number">{String(index + 1).padStart(2, "0")}</span>
                    <Field label="KETERANGAN"><input type="text" value={item.description} onChange={(e) => updateCost(item.id, "description", e.target.value)} placeholder="Contoh: Minyak" /></Field>
                    <Field label="JUMLAH (RM)"><input type="number" min="0" step="0.01" inputMode="decimal" value={item.amount} onChange={(e) => updateCost(item.id, "amount", e.target.value)} placeholder="0.00" /></Field>
                    <button className="icon-button danger" aria-label={`Buang kos ${index + 1}`} disabled={costs.length === 1} onClick={() => setCosts((items) => items.filter((x) => x.id !== item.id))}><Trash2 size={17} /></button>
                  </div>
                ))}
              </div>
              <button className="add-button" onClick={addCost}><Plus size={17} /> Tambah Kos</button>
              <div className="subtotal"><span>Total Kos</span><strong>RM{money(totalCosts)}</strong></div>
            </section>

            <section className="card final-input">
              <SectionTitle icon={<RotateCcw size={20} />} title="Pulang Modal" hint="Jumlah modal yang dipulangkan" />
              <Field label="JUMLAH PULANG MODAL (RM)"><input type="number" min="0" step="0.01" inputMode="decimal" value={returnedCapital} onChange={(e) => setReturnedCapital(e.target.value)} placeholder="0.00" /></Field>
            </section>
          </div>

          <aside className="preview-column">
            <div className="preview-card">
              <div className="preview-head">
                <div><span>PRATONTON</span><h2>Laporan WhatsApp</h2></div>
                <BadgeDollarSign size={23} />
              </div>
              <pre>{reportText}</pre>
              <div className={`balance ${balance < 0 ? "negative" : ""}`}>
                <span><Coins size={18} /> Baki Modal</span>
                <strong>RM{money(balance)}</strong>
              </div>
              <button className={`copy-button ${copied ? "copied" : ""}`} onClick={copyReport}>
                {copied ? <Check size={20} /> : <ClipboardCopy size={20} />}
                {copied ? "Berjaya Disalin!" : "Salin untuk WhatsApp"}
                {!copied && <ChevronRight size={18} />}
              </button>
              <button className="reset-button" onClick={resetForm}><Minus size={15} /> Kosongkan Borang</button>
            </div>
            <p className="privacy-note">Data kekal dalam peranti anda dan tidak dihantar ke mana-mana.</p>
          </aside>
        </div>
      </div>
      <div className="mobile-action" aria-live="polite">
        <div><span>Baki modal</span><strong>RM{money(balance)}</strong></div>
        <button onClick={copyReport} className={copied ? "copied" : ""}>
          {copied ? <Check size={19} /> : <ClipboardCopy size={19} />}
          {copied ? "Disalin" : "Salin laporan"}
        </button>
      </div>
    </>
  );
}
