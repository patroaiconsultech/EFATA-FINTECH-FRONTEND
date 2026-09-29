import React from "react";
import { navigate } from "../lib/navigation.js";
import { Button, Panel } from "../components/UI.jsx";

export default function NotFound() {
  return <Panel title="Página não encontrada"><p className="muted">A rota solicitada não faz parte do frontend atual.</p><Button onClick={() => navigate("/app/dashboard")}>Voltar ao dashboard</Button></Panel>;
}
