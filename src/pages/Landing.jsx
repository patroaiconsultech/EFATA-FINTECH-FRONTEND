import React from "react";
import { config } from "../config.js";
import { navigate } from "../lib/navigation.js";
import { Button } from "../components/UI.jsx";

const pillars = [
  ["Originação", "Leads, oportunidades, demandas e contexto do tomador."],
  ["Funding", "Mandatos, produtos, aderência e matching explicável."],
  ["Risco", "Triagem versionada, evidências e governança humana."],
  ["Viabilidade", "Cenários, fluxo financeiro, sensibilidade e snapshots."],
  ["Pós-fechamento", "Comissões, settlement, review queue e outbox."],
  ["Governança", "Tenant, auditoria, request tracing e decisões humanas."],
];

export default function Landing() {
  return (
    <main className="marketing-shell">
      <header className="marketing-topbar">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">E</span>
          <span><strong>{config.brandName}</strong><small>Structured Credit Intelligence</small></span>
        </button>
        <Button onClick={() => navigate("/login")}>Acessar plataforma</Button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Crédito estruturado com governança</p>
          <h1>Inteligência para transformar originação em decisões operacionais rastreáveis.</h1>
          <p className="hero-text">
            A Efatà 777 organiza a jornada entre tomadores, parceiros, provedores de capital e time interno
            sem prometer aprovação automática. Matching, risco, viabilidade e pós-fechamento permanecem
            governados por regras explícitas e revisão humana.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate("/login")}>Entrar no workspace</Button>
            <Button variant="secondary" onClick={() => document.getElementById("capacidades")?.scrollIntoView({ behavior: "smooth" })}>
              Conhecer capacidades
            </Button>
          </div>
        </div>
        <aside className="hero-card">
          <span className="card-kicker">Plano operacional</span>
          <h2>Originação → Funding → Governança</h2>
          <ul className="check-list">
            <li>Contratos de API versionados pelo backend.</li>
            <li>Multi-tenancy e roles canônicas.</li>
            <li>Risco assistido, nunca decisão final automática.</li>
            <li>Viabilidade e reconciliação com trilha observável.</li>
          </ul>
        </aside>
      </section>

      <section id="capacidades" className="capability-grid">
        {pillars.map(([title, description]) => (
          <article className="capability-card" key={title}>
            <span className="capability-index">{String(pillars.findIndex((x) => x[0] === title) + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
