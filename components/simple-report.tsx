"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeDollarSign, Banknote, CalendarDays, Check, ChevronRight, ClipboardCopy, Coins, Minus, RotateCcw, Store } from "lucide-react";

const DRAFT_KEY = "simple-closing-draft";

type CapitalReturnType = "pulang" | "pass";

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

function MoneyInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input type="number" min="0" step="0.01" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" />;
}

export function SimpleReport() {
  const [date, setDate] = useState(today);
  const [branch, setBranch] = useState("");
  const [initialCapital, setInitialCapital] = useState("");
  const [todayCapital, setTodayCapital] = useState("");
  const [totalCosts, setTotalCosts] = useState("");
  const [totalPurchases, setTotalPurchases] = useState("");
  const [returnedCapital, setReturnedCapital] = useState("");
  const [returnType, setReturnType] = useState<CapitalReturnType>("pulang");
  const [returnTo, setReturnTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    const loadDraft = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          setDate(draft.date || today());
          setBranch(draft.branch || "");
          setInitialCapital(draft.initialCapital || "");
          setTodayCapital(draft.todayCapital || "");
          setTotalCosts(draft.totalCosts || "");
          setTotalPurchases(draft.totalPurchases || "");
          setReturnedCapital(draft.returnedCapital || "");
          setReturnType(draft.returnType === "pass" ? "pass" : "pulang");
          setReturnTo(draft.returnTo || "");
        }
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      } finally {
        setReady(true);
      }
    }, 0);

    return () => window.clearTimeout(loadDraft);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ date, branch, initialCapital, todayCapital, totalCosts, totalPurchases, returnedCapital, returnType, returnTo }),
    );
  }, [ready, date, branch, initialCapital, todayCapital, totalCosts, totalPurchases, returnedCapital, returnType, returnTo]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const totalCapital = numberValue(initialCapital) + numberValue(todayCapital);
  const balance = totalCapital - numberValue(totalPurchases) - numberValue(totalCosts) - numberValue(returnedCapital);
  const returnLabel = returnType === "pass" ? "Pass Modal" : "Pulang Modal";

  const formattedDate = useMemo(() => {
    if (!date) return "[TARIKH]";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }, [date]);

  const reportText = useMemo(
    () =>
      `*DAILY REPORT*\n${formattedDate}\nCawangan: ${branch || "[Cawangan]"}\n\n──────────────\nModal Awal: RM${money(numberValue(initialCapital))}\nModal Hari Ini: RM${money(numberValue(todayCapital))}\n*Total Modal: RM${money(totalCapital)}*\n\n──────────────\n*Total Kos: RM${money(numberValue(totalCosts))}*\n*Total Belian: RM${money(numberValue(totalPurchases))}*\n\n──────────────\n*${returnLabel.toUpperCase()}*\nKepada: ${returnTo || "-"}\nRM${money(numberValue(returnedCapital))}\n\n──────────────\n*BAKI MODAL*\n*RM${money(balance)}*`,
    [formattedDate, branch, initialCapital, todayCapital, totalCapital, totalCosts, totalPurchases, returnLabel, returnTo, returnedCapital, balance],
  );

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  const resetForm = () => {
    setDate(today());
    setBranch("");
    setInitialCapital("");
    setTodayCapital("");
    setTotalCosts("");
    setTotalPurchases("");
    setReturnedCapital("");
    setReturnType("pulang");
    setReturnTo("");
    window.localStorage.removeItem(DRAFT_KEY);
    setCopied(false);
  };

  return (
    <>
      <div className="page-shell">
        <section className="intro compact">
          <span className="eyebrow">REPORT · LAPORAN HARIAN</span>
          <h1>Report <em>harian ringkas.</em></h1>
          <p>Isi jumlah sahaja dan salin ke WhatsApp. <span className="status"><i /> Auto simpan</span></p>
        </section>

        <div className="workspace">
          <div className="form-column">
            <section className="card identity-card">
              <SectionTitle icon={<Store size={20} />} title="Maklumat Laporan" hint="Tarikh dan cawangan" />
              <div className="two-columns">
                <Field label="TARIKH">
                  <div className="input-with-icon"><CalendarDays size={17} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                </Field>
                <Field label="CAWANGAN">
                  <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Contoh: Kota Bharu" />
                </Field>
              </div>
            </section>

            <section className="card">
              <SectionTitle icon={<Banknote size={20} />} title="Modal" hint="Modal awal dan modal hari ini" />
              <div className="two-columns">
                <Field label="MODAL AWAL (RM)"><MoneyInput value={initialCapital} onChange={setInitialCapital} /></Field>
                <Field label="MODAL HARI INI (RM)"><MoneyInput value={todayCapital} onChange={setTodayCapital} /></Field>
              </div>
              <div className="subtotal blue"><span>Total Modal</span><strong>RM{money(totalCapital)}</strong></div>
            </section>

            <section className="card">
              <SectionTitle icon={<BadgeDollarSign size={20} />} title="Kos & Belian" hint="Masukkan jumlah keseluruhan" />
              <div className="two-columns">
                <Field label="TOTAL KOS (RM)"><MoneyInput value={totalCosts} onChange={setTotalCosts} /></Field>
                <Field label="TOTAL BELIAN (RM)"><MoneyInput value={totalPurchases} onChange={setTotalPurchases} /></Field>
              </div>
            </section>

            <section className="card">
              <SectionTitle icon={<RotateCcw size={20} />} title="Pulang / Pass Modal" hint="Modal yang dipulangkan atau diserahkan" />
              <div className="segmented two" role="group" aria-label="Jenis">
                <button type="button" className={returnType === "pulang" ? "active" : ""} aria-pressed={returnType === "pulang"} onClick={() => setReturnType("pulang")}>Pulang Modal</button>
                <button type="button" className={returnType === "pass" ? "active" : ""} aria-pressed={returnType === "pass"} onClick={() => setReturnType("pass")}>Pass Modal</button>
              </div>
              <div className="two-columns">
                <Field label="KEPADA SIAPA"><input type="text" value={returnTo} onChange={(e) => setReturnTo(e.target.value)} placeholder="Contoh: Boss / Aisyah" /></Field>
                <Field label={`JUMLAH ${returnLabel.toUpperCase()} (RM)`}><MoneyInput value={returnedCapital} onChange={setReturnedCapital} /></Field>
              </div>
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
