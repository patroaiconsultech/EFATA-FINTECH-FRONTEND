import React from "react";
import { formatMoney, humanize, shortId } from "../lib/format.js";

export function Button({ children, variant = "primary", className = "", ...props }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}

export function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      {(title || subtitle) ? (
        <div className="panel-heading">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatusBadge({ value }) {
  const key = String(value || "UNKNOWN").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <span className={`badge badge-${key}`}>{humanize(value || "UNKNOWN")}</span>;
}

export function EmptyState({ title = "Nenhum registro", description = "Ainda não há dados disponíveis para este contexto." }) {
  return <div className="empty-state"><strong>{title}</strong><p>{description}</p></div>;
}

export function ErrorNotice({ error }) {
  if (!error) return null;
  return (
    <div className="error-notice" role="alert">
      <strong>{error.code || "ERRO"}</strong>
      <span>{error.message || String(error)}</span>
      {(error.requestId || error.correlationId) ? (
        <details>
          <summary>Diagnóstico</summary>
          <code>request_id={error.requestId || "—"}</code>
          <code>correlation_id={error.correlationId || "—"}</code>
        </details>
      ) : null}
    </div>
  );
}

export function Loading({ label = "Carregando…" }) {
  return <div className="loading"><span className="spinner" />{label}</div>;
}

export function Metric({ label, value, note }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>;
}

export function Field({ label, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

export function TextInput(props) {
  return <input {...props} />;
}

export function TextArea(props) {
  return <textarea {...props} />;
}

export function Select({ children, ...props }) {
  return <select {...props}>{children}</select>;
}

export function TagsInput({ value, onChange, placeholder }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "item1, item2"} />;
}

export function JsonTextArea({ value, onChange, rows = 5 }) {
  return <textarea className="mono" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} spellCheck="false" />;
}

export function DataTable({ rows, columns, empty }) {
  if (!rows?.length) return <EmptyState {...empty} />;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row.lead_id || row.opportunity_id || row.credit_request_id || row.match_id || row.study_id || row.connection_id || row.review_id || row.outbox_id || index}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : String(row[column.key] ?? "—")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CopyId({ value }) {
  if (!value) return <span>—</span>;
  return <button className="copy-id" title={value} onClick={() => navigator.clipboard?.writeText(value)}>{shortId(value)}</button>;
}

export function Money({ value, currency = "BRL" }) {
  return <>{formatMoney(value, currency)}</>;
}

export function JsonPreview({ value }) {
  return <pre className="json-preview">{JSON.stringify(value, null, 2)}</pre>;
}
