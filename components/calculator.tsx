"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ClipboardCopy, Coins, Scale, Sparkles, X } from "lucide-react";
import { CONFIG } from "@/lib/qudani-config";

type Jenis = "pajak" | "rahnu" | "buyback";

const jenisOptions: { value: Jenis; label: string }[] = [
  { value: "pajak", label: "Pajak Cina" },
  { value: "rahnu", label: "Ar-Rahnu" },
  { value: "buyback", label: "Emas Di Tangan" },
];

const numberValue = (value: string) => Number.parseFloat(value) || 0;
const formatRM = (n: number) =>
  "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Result = { text: string; pass: boolean };

function MoneyField({ id, label, value, onChange, prefix, suffix, placeholder = "0.00", step = "0.01", inputMode = "decimal", hint }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  step?: string;
  inputMode?: "decimal" | "numeric";
  hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`affix-input ${prefix ? "has-prefix" : ""} ${suffix ? "has-suffix" : ""}`}>
        {prefix && <span className="affix prefix">{prefix}</span>}
        <input id={id} type="number" min="0" step={step} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {suffix && <span className="affix suffix">{suffix}</span>}
      </div>
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
}

export function QudaniCalculator() {
  const [jenis, setJenis] = useState<Jenis>("pajak");
  const [amaun, setAmaun] = useState("");
  const [upah6bln, setUpah6bln] = useState("");
  const [bulan, setBulan] = useState("");
  const [mutu, setMutu] = useState("");
  const [berat, setBerat] = useState("");
  const [hargaGram, setHargaGram] = useState("");
  const [tolakan, setTolakan] = useState("50");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!result) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setResult(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [result]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const kira = (event: React.FormEvent) => {
    event.preventDefault();
    const amaunN = numberValue(amaun);
    const upahN = numberValue(upah6bln);
    const bulanN = numberValue(bulan);
    const beratN = numberValue(berat);
    const hargaN = numberValue(hargaGram);
    const tolakanN = numberValue(tolakan);

    let nt = 0;
    let bl = 0;
    const ns = hargaN * beratN;

    // Buffer harga (RM/g) — ubah dalam lib/qudani-config.ts
    const hargaBuffer = hargaN - CONFIG.BUFFER_HARGA;
    const nilaiBarangBuffer = hargaBuffer * beratN;

    if (jenis === "pajak") {
      nt = amaunN + amaunN * (bulanN * 0.02);
      bl = nilaiBarangBuffer - nt;
    } else if (jenis === "rahnu") {
      nt = (upahN / 6) * bulanN + amaunN;
      bl = nilaiBarangBuffer - nt;
    } else {
      nt = 0;
      bl = nilaiBarangBuffer - tolakanN;
    }

    const text =
`Nilai tebus   : ${formatRM(nt)}
Mutu          : ${mutu || "-"}
Berat         : ${beratN.toFixed(2)} g
Nilai semasa  : ${formatRM(ns)}
Baki lebihan  : ${formatRM(bl)}

*Peringatan: Tolak kos runner (RM10-100) & untung syarikat sebelum bagi harga ke pelanggan.`;

    setCopied(false);
    setResult({ text, pass: bl >= 0 });
  };

  const copyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  const status = result?.pass ? "pass" : "loss";

  return (
    <div className="page-shell narrow">
      <section className="intro compact">
        <span className="eyebrow">KALKULATOR PAJAK &amp; EMAS</span>
        <h1>Kira nilai <em>dengan pantas.</em></h1>
      </section>

      <form className="card calc-card" onSubmit={kira}>
        <div className="field">
          <span className="field-label" id="jenis-label">Jenis Kiraan</span>
          <div className="segmented" role="radiogroup" aria-labelledby="jenis-label">
            {jenisOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={jenis === option.value}
                className={jenis === option.value ? "active" : ""}
                onClick={() => setJenis(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {jenis !== "buyback" && (
          <MoneyField id="amaun_utama" label={jenis === "rahnu" ? "Amaun Pembiayaan" : "Amaun Pinjaman"} prefix="RM" value={amaun} onChange={setAmaun} />
        )}
        {jenis === "rahnu" && (
          <MoneyField id="upah6bln" label="Upah Simpan 6 Bulan" prefix="RM" value={upah6bln} onChange={setUpah6bln} />
        )}
        {jenis !== "buyback" && (
          <MoneyField id="bulan" label="Bilangan Bulan" suffix="bln" placeholder="0" step="1" inputMode="numeric" value={bulan} onChange={setBulan} />
        )}

        <div className="two-columns">
          <div className="field">
            <label htmlFor="mutu">Mutu Emas</label>
            <input id="mutu" type="text" value={mutu} onChange={(e) => setMutu(e.target.value)} placeholder="916 / 375" />
          </div>
          <MoneyField id="berat" label="Berat Emas" suffix="g" value={berat} onChange={setBerat} />
        </div>

        <MoneyField id="hargaGram" label="Harga klbuyback.com (RM/g)" prefix="RM" value={hargaGram} onChange={setHargaGram} />

        {jenis === "buyback" && (
          <MoneyField id="tolakan" label="Tolakan Kos / Untung" prefix="RM" value={tolakan} onChange={setTolakan} hint="Minimum RM50" />
        )}

        <button className="primary-button" type="submit">
          <Sparkles size={18} /> Kira Sekarang
        </button>
        <p className="privacy-note">Buffer harga semasa: RM{CONFIG.BUFFER_HARGA}/g</p>
      </form>

      {result && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setResult(null)}>
          <div className="ticket" role="dialog" aria-modal="true" aria-labelledby="resultTitle">
            <div className="ticket-head">
              <div>
                <span className="eyebrow">HASIL KIRAAN</span>
                <h2 id="resultTitle">Resit</h2>
              </div>
              <span className={`stamp ${status}`}>{result.pass ? "PASS" : "LOSS"}</span>
            </div>
            <pre className={`result-content ${status}`}>{result.text}</pre>
            <div className={`status-note ${status}`}>
              {result.pass ? <Coins size={17} /> : <Scale size={17} />}
              <span>{result.pass ? "Nilai baki adalah positif." : "Nilai baki adalah negatif. Transaksi ini mengalami kerugian."}</span>
            </div>
            <div className="btn-group">
              <button className="ghost-button" type="button" onClick={() => setResult(null)}><X size={17} /> Tutup</button>
              <button className={`primary-button ${copied ? "copied" : ""}`} type="button" onClick={copyText}>
                {copied ? <Check size={18} /> : <ClipboardCopy size={18} />}
                {copied ? "Disalin!" : "Salin Jawapan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
