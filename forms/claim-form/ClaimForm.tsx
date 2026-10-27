"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import FormTopbar from "../FormTopbar";
import { CLAIM_FORM_CONFIG } from "./config";
import { displayDate, money, moneyValue, numberValue } from "./formatters";
import type { ClaimFormState, ClaimRow } from "./types";

const newId = () => Math.random().toString(36).slice(2, 10);

const newClaim = (): ClaimRow => ({
  id: newId(),
  detail: "",
  date: "",
  amount: "",
});

const initialState: ClaimFormState = {
  name: "",
  branch: "",
  date: "",
  claims: [{ id: "claim-1", detail: "", date: "", amount: "" }],
  approvedBy: "",
  approverName: "",
};

function readSavedState(): ClaimFormState | null {
  try {
    const saved = localStorage.getItem(CLAIM_FORM_CONFIG.storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<ClaimFormState>;
    const claims = Array.isArray(parsed.claims)
      ? parsed.claims.slice(0, CLAIM_FORM_CONFIG.maxRows).map((claim) => ({
          id: claim.id || newId(),
          detail: claim.detail ?? "",
          date: claim.date ?? "",
          amount: moneyValue(claim.amount ?? ""),
        }))
      : [];

    return {
      ...initialState,
      ...parsed,
      claims: claims.length ? claims : [newClaim()],
    };
  } catch {
    return null;
  }
}

export default function ClaimForm() {
  const [form, setForm] = useState<ClaimFormState>(initialState);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readSavedState();
      if (saved) setForm(saved);
      setDraftLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (draftLoaded) {
      localStorage.setItem(CLAIM_FORM_CONFIG.storageKey, JSON.stringify(form));
    }
  }, [form, draftLoaded]);

  const total = useMemo(
    () => form.claims.reduce((sum, claim) => sum + numberValue(claim.amount), 0),
    [form.claims],
  );

  const updateClaim = (id: string, patch: Partial<ClaimRow>) => {
    setForm((current) => ({
      ...current,
      claims: current.claims.map((claim) => claim.id === id ? { ...claim, ...patch } : claim),
    }));
  };

  const addClaim = () => {
    if (form.claims.length >= CLAIM_FORM_CONFIG.maxRows) return;
    setForm((current) => ({ ...current, claims: [...current.claims, newClaim()] }));
  };

  const removeClaim = (id: string) => {
    if (form.claims.length === 1) return;
    setForm((current) => ({
      ...current,
      claims: current.claims.filter((claim) => claim.id !== id),
    }));
  };

  const clearForm = () => {
    setForm({ ...initialState, claims: [newClaim()] });
  };

  return (
    <main className="app-shell claim-app">
      <FormTopbar currentFormId={CLAIM_FORM_CONFIG.id} onClear={clearForm} />

      <section className="workspace claim-workspace no-print">
        <aside className="editor-panel claim-editor-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">Maklumat borang</span>
              <h2>Butiran tuntutan</h2>
            </div>
            <span className="page-count">1 halaman</span>
          </div>

          <div className="form-grid claim-main-fields">
            <label>
              Nama
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Nama penuntut"
              />
            </label>
            <label>
              Cawangan
              <input
                value={form.branch}
                onChange={(event) => setForm({ ...form, branch: event.target.value })}
                placeholder="Nama cawangan"
              />
            </label>
            <label>
              Tarikh
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
          </div>

          <div className="claim-section-heading">
            <div>
              <span className="step-label">Maklumat tuntutan</span>
              <h2>{form.claims.length} / {CLAIM_FORM_CONFIG.maxRows} tuntutan</h2>
            </div>
            <button
              className="button button-small"
              type="button"
              onClick={addClaim}
              disabled={form.claims.length >= CLAIM_FORM_CONFIG.maxRows}
            >
              + Tambah tuntutan
            </button>
          </div>

          <div className="claim-entry-list">
            <div className="claim-entry-head" aria-hidden="true">
              <span>Bil</span>
              <span>Butiran</span>
              <span>Tarikh</span>
              <span>Jumlah (RM)</span>
              <span />
            </div>
            {form.claims.map((claim, index) => (
              <div className="claim-entry-row" key={claim.id}>
                <strong>{index + 1}</strong>
                <input
                  aria-label={`Butiran tuntutan ${index + 1}`}
                  value={claim.detail}
                  onChange={(event) => updateClaim(claim.id, { detail: event.target.value })}
                  placeholder="Butiran tuntutan"
                />
                <input
                  aria-label={`Tarikh tuntutan ${index + 1}`}
                  type="date"
                  value={claim.date}
                  onChange={(event) => updateClaim(claim.id, { date: event.target.value })}
                />
                <input
                  aria-label={`Jumlah tuntutan ${index + 1}`}
                  inputMode="decimal"
                  value={claim.amount}
                  onChange={(event) => updateClaim(claim.id, { amount: event.target.value })}
                  onBlur={(event) => updateClaim(claim.id, { amount: moneyValue(event.target.value) })}
                  placeholder="Amaun"
                />
                <button
                  className="remove-item"
                  type="button"
                  aria-label={`Buang tuntutan ${index + 1}`}
                  disabled={form.claims.length === 1}
                  onClick={() => removeClaim(claim.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="claim-total-card">
            <span>Jumlah keseluruhan</span>
            <strong>{money(total)}</strong>
          </div>

          <section className="claim-approval-editor">
            <div>
              <span className="step-label">Kelulusan</span>
              <h2>Maklumat pegawai</h2>
            </div>
            <div className="form-grid form-grid-two">
              <label>
                Diluluskan oleh
                <input
                  value={form.approvedBy}
                  onChange={(event) => setForm({ ...form, approvedBy: event.target.value })}
                  placeholder="Jawatan / pihak meluluskan"
                />
              </label>
              <label>
                Nama
                <input
                  value={form.approverName}
                  onChange={(event) => setForm({ ...form, approverName: event.target.value })}
                  placeholder="Nama pegawai"
                />
              </label>
            </div>
            <p>Tandatangan dibiarkan kosong untuk ditandatangani selepas dicetak.</p>
          </section>
        </aside>

        <section className="preview-panel claim-preview-panel">
          <div className="preview-toolbar">
            <div>
              <span className="step-label">Pratonton langsung</span>
              <h2>Halaman 1</h2>
            </div>
            <span>A4 potret</span>
          </div>
          <div className="preview-scroll claim-preview-scroll">
            <ClaimPage form={form} total={total} preview />
          </div>
        </section>
      </section>

      <section className="print-document" aria-label="Dokumen tuntutan untuk dicetak">
        <ClaimPage form={form} total={total} />
      </section>
    </main>
  );
}

function ClaimPage({ form, total, preview = false }: {
  form: ClaimFormState;
  total: number;
  preview?: boolean;
}) {
  const rows = Array.from({ length: CLAIM_FORM_CONFIG.maxRows }, (_, index) => form.claims[index]);

  return (
    <article className={preview ? "paper claim-paper claim-paper-preview" : "paper claim-paper"}>
      <header className="claim-document-header">
        <Image
          className="claim-document-logo"
          src={CLAIM_FORM_CONFIG.assets.documentLogo}
          alt="Qudani Jewels"
          width={4500}
          height={4500}
          priority
        />
        <h2>BORANG TUNTUTAN BAYARAN BALIK</h2>
        <p>(REIMBURSEMENT CLAIM)</p>
      </header>

      <section className="claim-document-meta">
        <div className="claim-field"><span>NAMA</span><b>:</b><i>{form.name.toUpperCase()}</i></div>
        <div className="claim-field"><span>CAWANGAN</span><b>:</b><i>{form.branch.toUpperCase()}</i></div>
        <div className="claim-field"><span>TARIKH</span><b>:</b><i>{displayDate(form.date)}</i></div>
      </section>

      <section className="claim-document-section">
        <h3>MAKLUMAT TUNTUTAN</h3>
        <table className="claim-document-table">
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "50%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "23%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>BIL</th>
              <th>BUTIRAN</th>
              <th>TARIKH</th>
              <th>JUMLAH (RM)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((claim, index) => (
              <tr className="claim-document-entry" key={claim?.id ?? `empty-${index}`}>
                <td>{claim ? index + 1 : ""}</td>
                <td>{claim?.detail}</td>
                <td>{claim ? displayDate(claim.date) : ""}</td>
                <td>{claim?.amount ? money(claim.amount) : ""}</td>
              </tr>
            ))}
            <tr className="claim-document-total">
              <th colSpan={3}>JUMLAH KESELURUHAN (TOTAL)</th>
              <td>{money(total)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="claim-declaration">
        <h3>PENGAKUAN</h3>
        <p>
          Saya mengaku bahawa semua perbelanjaan yang dinyatakan di atas adalah bagi
          tujuan urusan rasmi syarikat dan semua resit/dokumen sokongan telah dilampirkan.
        </p>
      </section>

      <div className="claim-signoff">
        <section>
          <h3>PENUNTUT</h3>
          <div className="claim-signature-space" />
          <span className="claim-signature-caption">Tandatangan</span>
          <div className="claim-field"><span>Nama</span><b>:</b><i>{form.name}</i></div>
        </section>
        <section>
          <h3>KELULUSAN</h3>
          <div className="claim-signature-space" />
          <span className="claim-signature-caption">Tandatangan</span>
          <div className="claim-field"><span>Di Lulus oleh</span><b>:</b><i>{form.approvedBy}</i></div>
          <div className="claim-field"><span>Nama</span><b>:</b><i>{form.approverName}</i></div>
        </section>
      </div>
    </article>
  );
}
