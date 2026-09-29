import React, { useMemo, useState } from "react";
import { config, isInternal } from "../config.js";
import { clearAuth } from "../lib/auth.js";
import { navigate } from "../lib/navigation.js";
import { canSee } from "../lib/permissions.js";
import { Button, StatusBadge } from "./UI.jsx";

const nav = [
  ["Visão geral", "/app/dashboard", "all"],
  ["Leads", "/app/leads", "all"],
  ["Oportunidades", "/app/opportunities", "all"],
  ["Tomadores", "/app/marketplace/borrowers", "borrower"],
  ["Funders", "/app/marketplace/funders", "funder"],
  ["Produtos", "/app/marketplace/products", "funder"],
  ["Parceiros", "/app/marketplace/partners", "partner"],
  ["Demandas", "/app/marketplace/credit-requests", "borrower"],
  ["Matches", "/app/marketplace/matches", "all"],
  ["Agentes", "/app/marketplace/agents", "internal"],
  ["Simulador de risco", "/app/risk/simulator", "all"],
  ["Governança", "/app/risk/governance", "internal"],
  ["Viabilidade", "/app/viability/studies", "all"],
  ["ERP", "/app/viability/erp", "all"],
  ["Consentimento", "/app/consent", "all"],
  ["Reconciliação", "/app/reconciliation/reviews", "internal"],
  ["Sistema", "/app/system", "all"],
];

export default function Shell({ me, path, onReloadIdentity, children }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => nav.filter((item) => canSee(me.role, item[2])), [me.role]);

  function logout() {
    clearAuth();
    window.location.assign("/login");
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <button className="brand brand-sidebar" onClick={() => navigate("/app/dashboard")}>
          <span className="brand-mark">E</span>
          <span><strong>{config.brandName}</strong><small>Fintech Intelligence</small></span>
        </button>
        <nav className="sidebar-nav">
          {items.map(([label, href]) => (
            <button key={href} className={path.startsWith(href) ? "active" : ""} onClick={() => { navigate(href); setOpen(false); }}>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="role-label">Sessão</span>
          <strong>{me.role}</strong>
          <small>{me.tenant_id}</small>
        </div>
      </aside>

      <div className="app-body">
        <header className="app-topbar">
          <Button variant="ghost" className="mobile-menu" onClick={() => setOpen((v) => !v)}>Menu</Button>
          <div className="topbar-title">
            <strong>{config.brandName}</strong>
            <span>{isInternal(me.role) ? "Operação interna" : "Workspace do tenant"}</span>
          </div>
          <div className="session-chip">
            <StatusBadge value={me.role} />
            <Button variant="ghost" onClick={onReloadIdentity}>Atualizar</Button>
            <Button variant="ghost" onClick={logout}>Sair</Button>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
