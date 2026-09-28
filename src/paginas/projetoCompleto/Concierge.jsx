import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { INCENTIVO_FASEADO } from "../../dados/homehub";

const AMBIENTES = [
  { id: "cozinha", nome: "Cozinha", orc: 20000 },
  { id: "banheiro", nome: "Banheiro", orc: 8000 },
  { id: "sala", nome: "Sala de estar", orc: 12000 },
  { id: "quarto", nome: "Quarto", orc: 9000 },
  { id: "outro", nome: "Outro ambiente", orc: 10000 },
];

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
      app.setErroConcierge("Não foi possível falar com o concierge agora. Confira a chave da API no Netlify, ou use o exemplo pronto abaixo.");
    } finally {
      setCarregando(false);
    }
  }

  const ambiente = AMBIENTES.find((a) => a.id === app.ambienteEscolhido);

  function escolherAmbiente(a) {
    app.setAmbienteEscolhido(a.id);
    app.setProjetoAtivoId(a.id === "outro" || a.id === "quarto" ? app.projetoAtivoId : a.id);
  }

  function usarExemplo() {
    app.setBriefing({
      ambiente: ambiente.nome, orcamento: ambiente.orc, estilo: "moderno", prazo_dias: 45, prioridade: "funcionalidade",
      resumo: `Entendi: reforma de ${ambiente.nome.toLowerCase()}, estilo moderno, orçamento de R$ ${ambiente.orc.toLocaleString("pt-BR")}, prazo de 45 dias e foco em funcionalidade.`,
    });
    app.setErroConcierge(null);
  }

  // ---- passo 0: qual ambiente, e se é reforma completa por etapas ----
  if (!ambiente) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">Por onde você quer começar?</h2>
        <p className="subtituloTela">Escolha o ambiente desta etapa. Você pode reformar a casa inteira, um ambiente por vez.</p>

        <div className="gradeAmbientes">
          {AMBIENTES.map((a) => (
            <button key={a.id} className="ambienteChip" onClick={() => escolherAmbiente(a)}>{a.nome}</button>
          ))}
        </div>

        <div className="cartao bom" style={{ marginTop: 4 }}>
          <h4>Reforma completa custa menos, mesmo em etapas</h4>
          <p>{INCENTIVO_FASEADO.texto} Você decide o ritmo, de acordo com orçamento e crédito disponíveis. Nenhum ambiente fica bloqueado.</p>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame titulo="Projeto Completo" voltar={() => app.setAmbienteEscolhido(null)} comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Conte como quer sua {ambiente.nome.toLowerCase()}</h2>
      {!app.briefing && (
        <>
          <p className="subtituloTela">Descreva com suas palavras: orçamento, estilo, o que for importante. A IA organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={`Ex.: Quero reformar minha ${ambiente.nome.toLowerCase()}, algo moderno, com bastante espaço de armazenamento.`} />
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
