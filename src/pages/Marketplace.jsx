import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiData } from "../lib/api.js";
import { isInternal } from "../config.js";
import { formatMoney, parseJson, toTags } from "../lib/format.js";
import { Button, CopyId, DataTable, ErrorNotice, Field, JsonTextArea, Loading, Money, PageHeader, Panel, Select, StatusBadge, TextArea, TextInput } from "../components/UI.jsx";

const configs = {
  borrowers: {
    title: "Tomadores",
    path: "/api/v1/marketplace/borrower-profiles",
    columns: [
      ["borrower_profile_id", "ID"],
      ["segment", "Segmento"],
      ["sectors", "Setores"],
      ["regions", "Regiões"],
      ["status", "Status"],
    ],
  },
  funders: {
    title: "Provedores de funding",
    path: "/api/v1/marketplace/funding-providers",
    columns: [
      ["funding_provider_id", "ID"],
      ["provider_type", "Tipo"],
      ["legal_name", "Nome"],
      ["website", "Website"],
      ["status", "Status"],
    ],
  },
  products: {
    title: "Produtos de funding",
    path: "/api/v1/marketplace/funding-products",
    columns: [
      ["funding_product_id", "ID"],
      ["name", "Produto"],
      ["product_type", "Tipo"],
      ["min_ticket", "Ticket mínimo"],
      ["max_ticket", "Ticket máximo"],
      ["status", "Status"],
    ],
  },
  partners: {
    title: "Parceiros",
    path: "/api/v1/marketplace/partners",
    columns: [
      ["partner_profile_id", "ID"],
      ["partner_type", "Tipo"],
      ["focus_regions", "Regiões"],
      ["status", "Status"],
    ],
  },
  "credit-requests": {
    title: "Demandas de crédito",
    path: "/api/v1/marketplace/credit-requests",
    columns: [
      ["credit_request_id", "ID"],
      ["title", "Demanda"],
      ["requested_amount", "Valor"],
      ["term_months", "Prazo"],
      ["consent_status", "Consentimento"],
      ["status", "Status"],
    ],
  },
  matches: {
    title: "Matches",
    path: "/api/v1/marketplace/matches",
    columns: [
      ["match_id", "ID"],
      ["credit_request_id", "Demanda"],
      ["score", "Score"],
      ["eligible", "Elegível"],
      ["status", "Status"],
      ["assigned_agent_id", "Agente"],
    ],
  },
  agents: {
    title: "Agentes",
    path: "/api/v1/marketplace/agents",
    columns: [
      ["key", "Chave"],
      ["name", "Agente"],
      ["specialty", "Especialidade"],
      ["queue", "Fila"],
      ["autonomy", "Autonomia"],
      ["human_review_required", "Revisão humana"],
    ],
  },
};

function renderCell(row, key) {
  const value = row[key];
  if (key.endsWith("_id") || key === "key") return <CopyId value={value} />;
  if (key.includes("amount") || key.includes("ticket")) return <Money value={value} currency={row.currency || "BRL"} />;
  if (key === "status" || key === "consent_status" || key === "autonomy") return <StatusBadge value={value} />;
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object" && value) return JSON.stringify(value);
  return String(value ?? "—");
}

function BorrowerForm({ submit }) {
  const [form, setForm] = useState({ segment: "INCORPORADORA", sectors: "REAL_ESTATE", regions: "SP", group_profile: '{"stage":"STRUCTURED"}' });
  return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit({ segment: form.segment, sectors: toTags(form.sectors), regions: toTags(form.regions), group_profile: parseJson(form.group_profile) }); }}>
    <Field label="Segmento"><TextInput required value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} /></Field>
    <Field label="Setores"><TextInput value={form.sectors} onChange={(e) => setForm({ ...form, sectors: e.target.value })} /></Field>
    <Field label="Regiões"><TextInput value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} /></Field>
    <Field label="Perfil do grupo (JSON)"><JsonTextArea value={form.group_profile} onChange={(v) => setForm({ ...form, group_profile: v })} /></Field>
    <Button>Criar perfil</Button>
  </form>;
}

function FunderForm({ submit }) {
  const [form, setForm] = useState({ provider_type: "FUND", legal_name: "", website: "", mandate_summary: "" });
  return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit({ ...form, website: form.website || null }); }}>
    <Field label="Tipo"><Select value={form.provider_type} onChange={(e) => setForm({ ...form, provider_type: e.target.value })}><option>FUND</option><option>BANK</option><option>SECURITIZER</option><option>FAMILY_OFFICE</option><option>OTHER</option></Select></Field>
    <Field label="Razão/nome legal"><TextInput required value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} /></Field>
    <Field label="Website"><TextInput type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
    <Field label="Mandato"><TextArea required minLength={3} rows={4} value={form.mandate_summary} onChange={(e) => setForm({ ...form, mandate_summary: e.target.value })} /></Field>
    <Button>Criar provider</Button>
  </form>;
}

function ProductForm({ submit }) {
  const [form, setForm] = useState({
    name: "", product_type: "REAL_ESTATE", min_ticket: "1000000", max_ticket: "10000000",
    min_term_months: "12", max_term_months: "60", allowed_collateral_types: "RECEIVABLES",
    sectors: "REAL_ESTATE", regions: "SP", stage_requirements: "STRUCTURED",
    indicative_terms: '{"indexer":"IPCA","rate_note":"indicativa"}', currency: "BRL", status: "DRAFT",
  });
  return <form className="form-stack" onSubmit={(e) => {
    e.preventDefault();
    submit({
      ...form,
      min_ticket: Number(form.min_ticket), max_ticket: Number(form.max_ticket),
      min_term_months: Number(form.min_term_months), max_term_months: Number(form.max_term_months),
      allowed_collateral_types: toTags(form.allowed_collateral_types),
      sectors: toTags(form.sectors), regions: toTags(form.regions), stage_requirements: toTags(form.stage_requirements),
      indicative_terms: parseJson(form.indicative_terms),
    });
  }}>
    <div className="form-grid two">
      <Field label="Nome"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Tipo"><TextInput required value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} /></Field>
      <Field label="Ticket mínimo"><TextInput type="number" required value={form.min_ticket} onChange={(e) => setForm({ ...form, min_ticket: e.target.value })} /></Field>
      <Field label="Ticket máximo"><TextInput type="number" required value={form.max_ticket} onChange={(e) => setForm({ ...form, max_ticket: e.target.value })} /></Field>
      <Field label="Prazo mínimo"><TextInput type="number" required value={form.min_term_months} onChange={(e) => setForm({ ...form, min_term_months: e.target.value })} /></Field>
      <Field label="Prazo máximo"><TextInput type="number" required value={form.max_term_months} onChange={(e) => setForm({ ...form, max_term_months: e.target.value })} /></Field>
    </div>
    <Field label="Garantias permitidas"><TextInput value={form.allowed_collateral_types} onChange={(e) => setForm({ ...form, allowed_collateral_types: e.target.value })} /></Field>
    <div className="form-grid two">
      <Field label="Setores"><TextInput value={form.sectors} onChange={(e) => setForm({ ...form, sectors: e.target.value })} /></Field>
      <Field label="Regiões"><TextInput value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} /></Field>
    </div>
    <Field label="Estágios"><TextInput value={form.stage_requirements} onChange={(e) => setForm({ ...form, stage_requirements: e.target.value })} /></Field>
    <Field label="Termos indicativos (JSON)"><JsonTextArea value={form.indicative_terms} onChange={(v) => setForm({ ...form, indicative_terms: v })} /></Field>
    <div className="form-grid two">
      <Field label="Moeda"><TextInput maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
      <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>DRAFT</option><option>UNDER_REVIEW</option><option>ACTIVE</option><option>PAUSED</option><option>ARCHIVED</option></Select></Field>
    </div>
    <Button>Criar produto</Button>
  </form>;
}

function PartnerForm({ submit }) {
  const [form, setForm] = useState({ partner_type: "ADVISOR", focus_regions: "SP", commercial_terms: '{"commission_model":"SUCCESS_FEE_PENDING_CONTRACT"}' });
  return <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit({ partner_type: form.partner_type, focus_regions: toTags(form.focus_regions), commercial_terms: parseJson(form.commercial_terms) }); }}>
    <Field label="Tipo"><TextInput required value={form.partner_type} onChange={(e) => setForm({ ...form, partner_type: e.target.value })} /></Field>
    <Field label="Regiões"><TextInput value={form.focus_regions} onChange={(e) => setForm({ ...form, focus_regions: e.target.value })} /></Field>
    <Field label="Termos comerciais (JSON)"><JsonTextArea value={form.commercial_terms} onChange={(v) => setForm({ ...form, commercial_terms: v })} /></Field>
    <Button>Criar parceiro</Button>
  </form>;
}

function CreditRequestForm({ submit }) {
  const [form, setForm] = useState({
    borrower_profile_id: "", source_partner_tenant_id: "", title: "", credit_type: "REAL_ESTATE",
    requested_amount: "5000000", currency: "BRL", term_months: "36", grace_months: "6",
    collateral_types: "RECEIVABLES", sectors: "REAL_ESTATE", regions: "SP", project_stage: "STRUCTURED",
    purpose: "", consent_status: "PENDING", status: "DRAFT",
  });
  return <form className="form-stack" onSubmit={(e) => {
    e.preventDefault();
    submit({
      ...form,
      source_partner_tenant_id: form.source_partner_tenant_id || null,
      requested_amount: Number(form.requested_amount), term_months: Number(form.term_months), grace_months: Number(form.grace_months),
      collateral_types: toTags(form.collateral_types), sectors: toTags(form.sectors), regions: toTags(form.regions),
    });
  }}>
    <Field label="Borrower profile ID"><TextInput required value={form.borrower_profile_id} onChange={(e) => setForm({ ...form, borrower_profile_id: e.target.value })} /></Field>
    <Field label="Tenant parceiro de origem (opcional)"><TextInput value={form.source_partner_tenant_id} onChange={(e) => setForm({ ...form, source_partner_tenant_id: e.target.value })} /></Field>
    <div className="form-grid two">
      <Field label="Título"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Tipo"><TextInput required value={form.credit_type} onChange={(e) => setForm({ ...form, credit_type: e.target.value })} /></Field>
      <Field label="Valor"><TextInput type="number" required value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} /></Field>
      <Field label="Moeda"><TextInput maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
      <Field label="Prazo (meses)"><TextInput type="number" required value={form.term_months} onChange={(e) => setForm({ ...form, term_months: e.target.value })} /></Field>
      <Field label="Carência"><TextInput type="number" value={form.grace_months} onChange={(e) => setForm({ ...form, grace_months: e.target.value })} /></Field>
    </div>
    <Field label="Garantias"><TextInput value={form.collateral_types} onChange={(e) => setForm({ ...form, collateral_types: e.target.value })} /></Field>
    <div className="form-grid two">
      <Field label="Setores"><TextInput value={form.sectors} onChange={(e) => setForm({ ...form, sectors: e.target.value })} /></Field>
      <Field label="Regiões"><TextInput value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} /></Field>
    </div>
    <Field label="Estágio do projeto"><TextInput required value={form.project_stage} onChange={(e) => setForm({ ...form, project_stage: e.target.value })} /></Field>
    <Field label="Finalidade"><TextArea required rows={4} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
    <div className="form-grid two">
      <Field label="Consentimento"><Select value={form.consent_status} onChange={(e) => setForm({ ...form, consent_status: e.target.value })}><option>PENDING</option><option>GRANTED</option><option>REVOKED</option></Select></Field>
      <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>DRAFT</option><option>SUBMITTED</option><option>TRIAGE</option><option>INFORMATION_REQUIRED</option><option>QUALIFIED</option><option>MATCHING</option></Select></Field>
    </div>
    <Button>Criar demanda</Button>
  </form>;
}

function MatchActions({ submit, internal }) {
  const [matchId, setMatchId] = useState("");
  const [creditRequestId, setCreditRequestId] = useState("");
  const [status, setStatus] = useState("INTERESTED");
  const [reason, setReason] = useState("");
  const [visibility, setVisibility] = useState("INTERNAL");
  return <div className="form-stack">
    {internal ? <form className="form-inline" onSubmit={(e) => { e.preventDefault(); submit(`/api/v1/marketplace/credit-requests/${creditRequestId}/matching`, null, "POST"); }}>
      <TextInput required placeholder="credit_request_id" value={creditRequestId} onChange={(e) => setCreditRequestId(e.target.value)} />
      <Button>Executar matching</Button>
    </form> : null}
    <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit(`/api/v1/marketplace/matches/${matchId}/status`, { status, reason, visibility }, "POST"); }}>
      <Field label="Match ID"><TextInput required value={matchId} onChange={(e) => setMatchId(e.target.value)} /></Field>
      <div className="form-grid two">
        <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {["AGENT_REVIEW","APPROVED_TO_CONTACT","SENT","INTERESTED","DILIGENCE","NEGOTIATION","CONVERTED","DECLINED","EXPIRED","BLOCKED"].map((value) => <option key={value}>{value}</option>)}
        </Select></Field>
        <Field label="Visibilidade"><Select value={visibility} onChange={(e) => setVisibility(e.target.value)}><option>INTERNAL</option><option>BORROWER</option><option>FUNDER</option><option>PARTNER</option></Select></Field>
      </div>
      <Field label="Motivo"><TextArea required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      <Button variant="secondary">Atualizar status</Button>
    </form>
  </div>;
}

export default function Marketplace({ me, section }) {
  const cfg = configs[section] || configs["credit-requests"];
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });
  const internal = isInternal(me.role);

  const load = useCallback(async () => {
    setState({ loading: true, error: null });
    try { setRows(await apiData(cfg.path)); setState({ loading: false, error: null }); }
    catch (error) { setState({ loading: false, error }); }
  }, [cfg.path]);

  useEffect(() => { load(); }, [load]);

  async function create(body) {
    setState((s) => ({ ...s, error: null }));
    try { await apiData(cfg.path, { method: "POST", body }); await load(); }
    catch (error) { setState((s) => ({ ...s, error })); }
  }

  async function action(path, body, method = "POST") {
    setState((s) => ({ ...s, error: null }));
    try { await apiData(path, { method, ...(body ? { body } : {}) }); await load(); }
    catch (error) { setState((s) => ({ ...s, error })); }
  }

  const columns = useMemo(() => cfg.columns.map(([key, label]) => ({ key, label, render: (row) => renderCell(row, key) })), [cfg]);

  let form = null;
  if (section === "borrowers") form = <BorrowerForm submit={create} />;
  if (section === "funders") form = <FunderForm submit={create} />;
  if (section === "products") form = <ProductForm submit={create} />;
  if (section === "partners") form = <PartnerForm submit={create} />;
  if (section === "credit-requests") form = <CreditRequestForm submit={create} />;
  if (section === "matches") form = <MatchActions submit={action} internal={internal} />;

  return (
    <>
      <PageHeader eyebrow="Marketplace" title={cfg.title} description="Dados e ações respeitam a role e o tenant efetivos retornados por /api/v1/me." actions={<Button variant="secondary" onClick={load}>Atualizar</Button>} />
      <ErrorNotice error={state.error} />
      {form ? <div className="split-grid"><Panel title="Ações">{form}</Panel><Panel title="Registros">{state.loading ? <Loading /> : <DataTable rows={rows} columns={columns} />}</Panel></div>
        : <Panel title="Registros">{state.loading ? <Loading /> : <DataTable rows={rows} columns={columns} />}</Panel>}
    </>
  );
}
