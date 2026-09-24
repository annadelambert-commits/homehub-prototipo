import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";

export default function Concierge() {
  const nav = useNavigate();
  const app = useApp();
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarConcierge() {
    if (!texto.trim()) return;
    setCarregando(true); app.setErroConcierge(null);
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "concierge", mensagem: texto.trim() }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.ambiente) throw new Error("resposta incompleta");
      app.setBriefing(dados);
    } catch {
      app.setErroConcierge("Não foi possível falar com o concierge agora. Verifique a configuração de ANTHROPIC_API_KEY no Netlify — ou use o exemplo pronto abaixo.");
    } finally {
      setCarregando(false);
    }
  }

  function usarExemplo() {
    app.setBriefing({
      ambiente: "cozinha", orcamento: 20000, estilo: "moderno", prazo_dias: 45, prioridade: "funcionalidade",
      resumo: "Entendi: uma cozinha nova, estilo moderno, orçamento de R$ 20.000, com prazo de 45 dias e foco em funcionalidade.",
    });
    app.setErroConcierge(null);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Conte o que você quer reformar</h2>
      {!app.briefing && (
        <>
          <p className="subtituloTela">Descreva em linguagem natural — orçamento, ambiente, estilo, o que for relevante. Uma IA de verdade organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: Tenho R$ 20 mil e quero reformar minha cozinha, algo moderno, em até 45 dias." />
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!texto.trim() || carregando} onClick={enviarConcierge}>
              {carregando ? "Consultando a IA…" : "Enviar para o concierge"}
            </button>
            <button className="btSecundario" onClick={usarExemplo}>Usar exemplo pronto</button>
          </div>
          {app.erroConcierge && <div className="cartao alerta" style={{ marginTop: 12 }}><p>{app.erroConcierge}</p></div>}
        </>
      )}
      {app.briefing && (
        <>
          <div className="cartao bom"><h4>Briefing estruturado pela IA</h4><p>{app.briefing.resumo}</p></div>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Ambiente</span><b>{app.briefing.ambiente}</b></div>
            <div className="linhaResumo"><span>Orçamento</span><b>{app.briefing.orcamento ? "R$ " + app.briefing.orcamento.toLocaleString("pt-BR") : "não informado"}</b></div>
            <div className="linhaResumo"><span>Estilo</span><b>{app.briefing.estilo || "não informado"}</b></div>
            <div className="linhaResumo"><span>Prazo desejado</span><b>{app.briefing.prazo_dias ? app.briefing.prazo_dias + " dias" : "não informado"}</b></div>
          </div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => nav("/projeto-completo/medida")}>Continuar</button>
            <button className="btSecundario" onClick={() => app.setBriefing(null)}>Recomeçar a conversa</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
