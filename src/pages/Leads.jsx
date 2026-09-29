import React, { useCallback, useEffect, useState } from "react";
import { apiData } from "../lib/api.js";
import { formatMoney } from "../lib/format.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, Loading, Money, PageHeader, Panel, Select, TextInput } from "../components/UI.jsx";

const initial = { prospective_client_name: "", opportunity_type: "REAL_ESTATE", estimated_amount: "", currency: "BRL" };

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ loading: true, saving: false, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setRows(await apiData("/api/v1/leads"));
      setState((s) => ({ ...s, loading: false }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault();
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      await apiData("/api/v1/leads", { method: "POST", body: { ...form, estimated_amount: Number(form.estimated_amount) } });
      setForm(initial);
      await load();
    } catch (error) {
      setState((s) => ({ ...s, saving: false, error }));
    } finally {
      setState((s) => ({ ...s, saving: false }));
    }
  }

  return (
    <>
      <PageHeader eyebrow="Originação" title="Leads" description="Entrada mínima da operação antes de representação e oportunidade." />
      <ErrorNotice error={state.error} />
      <div className="split-grid">
        <Panel title="Novo lead">
          <form className="form-stack" onSubmit={create}>
            <Field label="Cliente prospectivo"><TextInput required minLength={2} value={form.prospective_client_name} onChange={(e) => setForm({ ...form, prospective_client_name: e.target.value })} /></Field>
            <Field label="Tipo de oportunidade"><TextInput required value={form.opportunity_type} onChange={(e) => setForm({ ...form, opportunity_type: e.target.value })} /></Field>
            <div className="form-grid two">
              <Field label="Valor estimado"><TextInput type="number" min="0.01" step="0.01" required value={form.estimated_amount} onChange={(e) => setForm({ ...form, estimated_amount: e.target.value })} /></Field>
              <Field label="Moeda"><TextInput required maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
            </div>
            <Button disabled={state.saving}>{state.saving ? "Criando…" : "Criar lead"}</Button>
          </form>
        </Panel>

        <Panel title="Leads do tenant" subtitle="Listagem retornada por /api/v1/leads">
          {state.loading ? <Loading /> : (
            <DataTable rows={rows} columns={[
              { key: "lead_id", label: "ID", render: (row) => <CopyId value={row.lead_id} /> },
              { key: "prospective_client_name", label: "Cliente" },
              { key: "opportunity_type", label: "Tipo" },
              { key: "estimated_amount", label: "Valor", render: (row) => <Money value={row.estimated_amount} currency={row.currency} /> },
              { key: "status", label: "Status" },
            ]} />
          )}
        </Panel>
      </div>
    </>
  );
}
