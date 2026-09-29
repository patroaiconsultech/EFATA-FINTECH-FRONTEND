import React from "react";
import { StatusBadge } from "./UI.jsx";

export default function AgentCard({ agent }) {
  return (
    <article className="agent-card">
      <div className="agent-card-top">
        <span className="agent-dot" />
        <StatusBadge value={agent.autonomy || "GOVERNED"} />
      </div>
      <h3>{agent.name || agent.key}</h3>
      <p>{agent.description || agent.specialty}</p>
      <dl>
        <div><dt>Fila</dt><dd>{agent.queue || "—"}</dd></div>
        <div><dt>Próxima ação</dt><dd>{agent.next_action || "—"}</dd></div>
      </dl>
    </article>
  );
}
