import React, { useState } from "react";
import { apiData } from "../lib/api.js";
import { parseJson, toTags } from "../lib/format.js";
import { Button, ErrorNotice, Field, JsonPreview, JsonTextArea, PageHeader, Panel, TextArea, TextInput } from "../components/UI.jsx";

export default function Consent({ me }) {
  const [grant, setGrant] = useState({
    subject_ref: "", purpose: "CREDIT_ANALYSIS", scopes: "CREDIT_ANALYSIS,MATCHING",
    recipient: "EFATA_777", source_institution: "", expires_at: "",
    granted_at: "", provider_reference: "", metadata: "{}",
  });
  const [action, setAction] = useState({ consent_id: "", reason: "", purpose: "CREDIT_ANALYSIS", scopes: "CREDIT_ANALYSIS", provider_reference: "" });
  const [integrityTenant, setIntegrityTenant] = useState(me.tenant_id);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function call(path, body, method = "POST") {
    setError(null); setResult(null);
    try { setResult(await apiData(path, { method, ...(body !== undefined ? { body } : {}) })); }
    catch (cause) { setError(cause); }
  }

  async function issue(event) {
    event.preventDefault();
    await call("/api/v1/consent/grants", {
      subject_ref: grant.subject_ref,
      purpose: grant.purpose,
      scopes: toTags(grant.scopes),
      recipient: grant.recipient,
      source_institution: grant.source_institution,
      expires_at: new Date(grant.expires_at).toISOString(),
      granted_at: grant.granted_at ? new Date(grant.granted_at).toISOString() : null,
      provider_reference: grant.provider_reference || null,
      metadata: parseJson(grant.metadata),
    });
  }

  return (
    <>
      <PageHeader eyebrow="Consent Ledger" title="Consentimento e escopo" description="O frontend não inventa uma listagem inexistente; trabalha com grants recém-criados ou IDs conhecidos." />
      <ErrorNotice error={error} />
      <div className="split-grid">
        <Panel title="Emitir grant">
          <form className="form-stack" onSubmit={issue}>
            <Field label="Subject ref pseudonimizado"><TextInput required value={grant.subject_ref} onChange={(e) => setGrant({ ...grant, subject_ref: e.target.value })} /></Field>
            <Field label="Finalidade"><TextInput required value={grant.purpose} onChange={(e) => setGrant({ ...grant, purpose: e.target.value })} /></Field>
            <Field label="Scopes"><TextInput required value={grant.scopes} onChange={(e) => setGrant({ ...grant, scopes: e.target.value })} /></Field>
            <div className="form-grid two">
              <Field label="Recipient"><TextInput required value={grant.recipient} onChange={(e) => setGrant({ ...grant, recipient: e.target.value })} /></Field>
              <Field label="Instituição fonte"><TextInput required value={grant.source_institution} onChange={(e) => setGrant({ ...grant, source_institution: e.target.value })} /></Field>
              <Field label="Expira em"><TextInput type="datetime-local" required value={grant.expires_at} onChange={(e) => setGrant({ ...grant, expires_at: e.target.value })} /></Field>
              <Field label="Concedido em (opcional)"><TextInput type="datetime-local" value={grant.granted_at} onChange={(e) => setGrant({ ...grant, granted_at: e.target.value })} /></Field>
            </div>
            <Field label="Provider reference"><TextInput value={grant.provider_reference} onChange={(e) => setGrant({ ...grant, provider_reference: e.target.value })} /></Field>
            <Field label="Metadata (JSON)"><JsonTextArea value={grant.metadata} onChange={(v) => setGrant({ ...grant, metadata: v })} /></Field>
            <Button>Emitir consentimento</Button>
          </form>
        </Panel>

        <Panel title="Operações sobre grant">
          <div className="form-stack">
            <Field label="Consent ID"><TextInput value={action.consent_id} onChange={(e) => setAction({ ...action, consent_id: e.target.value })} /></Field>
            <Field label="Motivo da revogação"><TextArea value={action.reason} onChange={(e) => setAction({ ...action, reason: e.target.value })} /></Field>
            <Button variant="danger" onClick={() => window.confirm("Revogar este consentimento?") && call(`/api/v1/consent/grants/${action.consent_id}/revoke`, { reason: action.reason || null })}>Revogar</Button>
            <hr />
            <Field label="Finalidade de acesso"><TextInput value={action.purpose} onChange={(e) => setAction({ ...action, purpose: e.target.value })} /></Field>
            <Field label="Scopes"><TextInput value={action.scopes} onChange={(e) => setAction({ ...action, scopes: e.target.value })} /></Field>
            <Field label="Provider reference"><TextInput value={action.provider_reference} onChange={(e) => setAction({ ...action, provider_reference: e.target.value })} /></Field>
            <Button variant="secondary" onClick={() => call(`/api/v1/consent/grants/${action.consent_id}/access`, { purpose: action.purpose, scopes: toTags(action.scopes), provider_reference: action.provider_reference || null })}>Autorizar acesso</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Integridade do ledger" subtitle="Endpoint restrito a roles internas.">
        <div className="form-inline">
          <TextInput value={integrityTenant} onChange={(e) => setIntegrityTenant(e.target.value)} placeholder="tenant_id" />
          <Button variant="secondary" onClick={() => call(`/api/v1/consent/integrity/${integrityTenant}`, undefined, "GET")}>Verificar cadeia</Button>
        </div>
      </Panel>

      {result ? <Panel title="Resposta"><JsonPreview value={result} /></Panel> : null}
    </>
  );
}
