import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiData, buildIfMatchHeader } from "../lib/api.js";
import { canSee } from "../lib/permissions.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, JsonTextArea, Loading, Money, PageHeader, Panel, Select, TextArea, TextInput } from "../components/UI.jsx";

export default function Opportunities({ me }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ representation_authorization_id: "", title: "", purpose: "" });
  const [rep, setRep] = useState({ lead_id: "", represented_tenant_id: "", allowed_actions: "CREATE_OPPORTUNITY,UPLOAD_DOCUMENTS,VIEW_STATUS" });
  const [repAction, setRepAction] = useState({ id: "", action: "accept" });
  const [qualification, setQualification] = useState({ opportunity_id: "", version: "", result: "ELIGIBLE", conclusion: "" });
  const [document, setDocument] = useState({ opportunity_id: "", filename: "", document_type: "FINANCIAL_STATEMENTS", checksum_sha256: "" });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await apiData("/api/v1/opportunities")); }
    catch (cause) { setError(cause); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(path, body, options = {}) {
    setError(null);
    try {
      await apiData(path, { method: "POST", body, headers: options.headers });
      if (options.reload !== false) await load();
      return true;
    } catch (cause) { setError(cause); return false; }
  }

  return (
    <>
      <PageHeader eyebrow="Originação" title="Representações e oportunidades" description="A representação é uma autorização explícita; a oportunidade só nasce após autorização ativa." />
      <ErrorNotice error={error} />

      <div className="split-grid">
        <Panel title="Criar representação" subtitle="Não existe endpoint de listagem geral no backend atual.">
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit("/api/v1/representations", { ...rep, allowed_actions: rep.allowed_actions.split(",").map((x) => x.trim()).filter(Boolean) }, { reload: false }); }}>
            <Field label="Lead ID"><TextInput required value={rep.lead_id} onChange={(e) => setRep({ ...rep, lead_id: e.target.value })} /></Field>
            <Field label="Tenant representado"><TextInput required value={rep.represented_tenant_id} onChange={(e) => setRep({ ...rep, represented_tenant_id: e.target.value })} /></Field>
            <Field label="Ações permitidas"><TextInput value={rep.allowed_actions} onChange={(e) => setRep({ ...rep, allowed_actions: e.target.value })} /></Field>
            <Button>Criar representação</Button>
          </form>
          <hr />
          <form className="form-inline" onSubmit={(e) => { e.preventDefault(); submit(`/api/v1/representations/${repAction.id}/${repAction.action}`, {}, { reload: false }); }}>
            <TextInput required placeholder="authorization_id" value={repAction.id} onChange={(e) => setRepAction({ ...repAction, id: e.target.value })} />
            <Select value={repAction.action} onChange={(e) => setRepAction({ ...repAction, action: e.target.value })}><option value="accept">Aceitar</option><option value="revoke">Revogar</option></Select>
            <Button variant="secondary">Executar</Button>
          </form>
        </Panel>

        <Panel title="Nova oportunidade">
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit("/api/v1/opportunities", createForm).then((ok) => ok && setCreateForm({ representation_authorization_id: "", title: "", purpose: "" })); }}>
            <Field label="Representation authorization ID"><TextInput required value={createForm.representation_authorization_id} onChange={(e) => setCreateForm({ ...createForm, representation_authorization_id: e.target.value })} /></Field>
            <Field label="Título"><TextInput required minLength={3} value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} /></Field>
            <Field label="Finalidade"><TextArea required minLength={3} rows={4} value={createForm.purpose} onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })} /></Field>
            <Button>Criar oportunidade</Button>
          </form>
        </Panel>
      </div>

      <Panel title="Oportunidades acessíveis">
        {loading ? <Loading /> : <DataTable rows={rows} columns={[
          { key: "opportunity_id", label: "ID", render: (row) => <CopyId value={row.opportunity_id} /> },
          { key: "title", label: "Título" },
          { key: "requested_amount", label: "Valor", render: (row) => <Money value={row.requested_amount} currency={row.currency} /> },
          { key: "stage", label: "Etapa" },
          { key: "version", label: "Versão" },
        ]} />}
      </Panel>

      <div className="split-grid">
        {canSee(me.role, "analyst") ? (
          <Panel title="Qualificação humana" subtitle="Usa If-Match; conflito 409 nunca é reenviado silenciosamente.">
            <form className="form-stack" onSubmit={(e) => {
              e.preventDefault();
              submit(`/api/v1/opportunities/${qualification.opportunity_id}/qualification`, { result: qualification.result, conclusion: qualification.conclusion }, { headers: buildIfMatchHeader(qualification.version) });
            }}>
              <Field label="Opportunity ID"><TextInput required value={qualification.opportunity_id} onChange={(e) => setQualification({ ...qualification, opportunity_id: e.target.value })} /></Field>
              <div className="form-grid two">
                <Field label="Versão esperada"><TextInput type="number" required value={qualification.version} onChange={(e) => setQualification({ ...qualification, version: e.target.value })} /></Field>
                <Field label="Resultado"><Select value={qualification.result} onChange={(e) => setQualification({ ...qualification, result: e.target.value })}><option>ELIGIBLE</option><option>CONDITIONALLY_ELIGIBLE</option><option>INFORMATION_REQUIRED</option><option>NOT_ELIGIBLE</option></Select></Field>
              </div>
              <Field label="Conclusão"><TextArea required minLength={3} value={qualification.conclusion} onChange={(e) => setQualification({ ...qualification, conclusion: e.target.value })} /></Field>
              <Button>Registrar qualificação</Button>
            </form>
          </Panel>
        ) : null}

        <Panel title="Registrar documento" subtitle="O backend atual persiste metadados/checksum; não presume upload binário.">
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); const { opportunity_id, ...body } = document; submit(`/api/v1/opportunities/${opportunity_id}/documents`, body); }}>
            <Field label="Opportunity ID"><TextInput required value={document.opportunity_id} onChange={(e) => setDocument({ ...document, opportunity_id: e.target.value })} /></Field>
            <div className="form-grid two">
              <Field label="Arquivo"><TextInput required value={document.filename} onChange={(e) => setDocument({ ...document, filename: e.target.value })} /></Field>
              <Field label="Tipo"><TextInput required value={document.document_type} onChange={(e) => setDocument({ ...document, document_type: e.target.value })} /></Field>
            </div>
            <Field label="SHA-256"><TextInput required minLength={64} maxLength={64} value={document.checksum_sha256} onChange={(e) => setDocument({ ...document, checksum_sha256: e.target.value })} /></Field>
            <Button>Registrar metadado</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
