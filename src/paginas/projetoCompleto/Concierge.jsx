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

  const AMB = { cozinha: { nome: "cozinha", orc: 20000 }, banheiro: { nome: "banheiro", orc: 8000 }, sala: { nome: "sala de estar", orc: 12000 } };
  const ambiente = AMB[app.projetoAtivoId] || AMB.cozinha;

  function usarExemplo() {
    app.setBriefing({
      ambiente: ambiente.nome, orcamento: ambiente.orc, estilo: "moderno", prazo_dias: 45, prioridade: "funcionalidade",
      resumo: `Entendi: reforma de ${ambiente.nome}, estilo moderno, orçamento de R$ ${ambiente.orc.toLocaleString("pt-BR")}, prazo de 45 dias e foco em funcionalidade.`,
    });
    app.setErroConcierge(null);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Conte como quer sua {ambiente.nome}</h2>
      {!app.briefing && (
        <>
          <p className="subtituloTela">Descreva em linguagem natural — orçamento, ambiente, estilo, o que for relevante. Uma IA de verdade organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={`Ex.: Quero reformar minha ${ambiente.nome}, algo moderno, com bastante espaço de armazenamento.`} />
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
