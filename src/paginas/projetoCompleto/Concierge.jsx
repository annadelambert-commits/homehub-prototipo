import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { AMBIENTES, INCENTIVO_FASEADO } from "../../dados/homehub";

export default function Concierge() {
  const nav = useNavigate();
  const app = useApp();
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [avancou, setAvancou] = useState(app.ambientesSelecionados.length > 0);

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
      app.setEscopoFoco(dados.escopo === "categoria" ? "categoria" : "completo");
      app.setCategoriaFoco(dados.escopo === "categoria" ? dados.categoria : null);
    } catch {
      app.setErroConcierge("Não foi possível falar com o concierge agora. Confira a chave da API no Netlify, ou use o exemplo pronto abaixo.");
    } finally {
      setCarregando(false);
    }
  }

  const selecionados = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id));
  const nomeAmbientes = selecionados.map((a) => a.nome.toLowerCase()).join(", ");
  const orcTotal = selecionados.reduce((s, a) => s + a.orc, 0) || 10000;

  function toggleAmbiente(id) {
    app.setAmbientesSelecionados((sel) => sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);
  }

  function escolherTodos() {
    const todos = AMBIENTES.map((a) => a.id);
    const jaTodos = todos.every((id) => app.ambientesSelecionados.includes(id));
    app.setAmbientesSelecionados(jaTodos ? [] : todos);
    app.setReformaCompleta(!jaTodos);
  }

  function confirmarAmbientes() {
    if (app.ambientesSelecionados.length > 1) app.setReformaCompleta(true);
    app.setProjetoAtivoId(app.ambientesSelecionados[0]);
    setAvancou(true);
  }

  function usarExemplo() {
    app.setBriefing({
      ambiente: nomeAmbientes, orcamento: orcTotal, estilo: "moderno", prazo_dias: 45, prioridade: "funcionalidade",
      resumo: `Entendi: reforma de ${nomeAmbientes}, estilo moderno, orçamento de R$ ${orcTotal.toLocaleString("pt-BR")}, prazo de 45 dias e foco em funcionalidade.`,
    });
    app.setEscopoFoco("completo"); app.setCategoriaFoco(null);
    app.setErroConcierge(null);
  }

  function irParaMedida() {
    nav("/projeto-completo/medida");
  }

  function escolherOrcamentoFinal() {
    app.setOrcamentoFinal(true);
    if (selecionados.length <= 1) irParaMedida();
  }

  function escolherFaseado() {
    app.setOrcamentoFinal(false);
    if (selecionados.length <= 1) { app.setAmbienteFaseInicial(app.ambientesSelecionados[0] || null); irParaMedida(); }
  }

  function confirmarAmbienteFase(id) {
    app.setAmbienteFaseInicial(id);
    irParaMedida();
  }

  // ---- passo 0: quais ambientes, e se é reforma completa por etapas ----
  if (!avancou) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">Por onde você quer começar?</h2>
        <p className="subtituloTela">Escolha um ou mais ambientes desta etapa. Dá pra reformar a casa inteira, aos poucos.</p>

        <div className="gradeAmbientes">
          {AMBIENTES.map((a) => (
            <button key={a.id} className={"ambienteChip" + (app.ambientesSelecionados.includes(a.id) ? " sel" : "")}
              onClick={() => toggleAmbiente(a.id)}>{a.nome}</button>
          ))}
          <button className={"ambienteChip destaque" + (app.reformaCompleta ? " sel" : "")} onClick={escolherTodos}>
            🏠 Casa toda
          </button>
        </div>

        <div className="cartao bom" style={{ marginTop: 4 }}>
          <h4>Reforma completa custa menos, mesmo em etapas</h4>
          <p>{INCENTIVO_FASEADO.texto} Você decide o ritmo, de acordo com orçamento e crédito disponíveis. Nenhum ambiente fica bloqueado.</p>
        </div>

        <div className="ctaFixo">
          <button className="btPrimario" disabled={selecionados.length === 0} onClick={confirmarAmbientes}>Continuar</button>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame titulo="Projeto Completo" voltar={() => setAvancou(false)} comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Conte como quer sua reforma de {nomeAmbientes}</h2>
      {!app.briefing && (
        <>
          <p className="subtituloTela">Descreva com suas palavras: orçamento, estilo, o que for importante. A IA organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={`Ex.: Quero reformar ${nomeAmbientes}, algo moderno, com bastante espaço de armazenamento.`} />
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
            <div className="linhaResumo"><span>Ambiente(s)</span><b>{app.briefing.ambiente}</b></div>
            <div className="linhaResumo"><span>Orçamento</span><b>{app.briefing.orcamento ? "R$ " + app.briefing.orcamento.toLocaleString("pt-BR") : "não informado"}</b></div>
            <div className="linhaResumo"><span>Estilo</span><b>{app.briefing.estilo || "não informado"}</b></div>
            <div className="linhaResumo"><span>Prazo desejado</span><b>{app.briefing.prazo_dias ? app.briefing.prazo_dias + " dias" : "não informado"}</b></div>
          </div>

          {app.escopoFoco === "categoria" && app.categoriaFoco && (
            <div className="cartao bom">
              <h4>Entendi, é uma frente específica</h4>
              <p>Vou levar você direto pras opções relevantes assim que a medida estiver pronta, sem misturar com o resto do projeto.</p>
            </div>
          )}

          {app.briefing.orcamento && app.orcamentoFinal === null && selecionados.length > 0 && (
            <>
              <h3 className="secaoTitulo">Sobre o orçamento</h3>
              <p className="subtituloTela">
                R$ {app.briefing.orcamento.toLocaleString("pt-BR")} é o valor final que você quer fechar hoje, ou prefere fechar
                um preço agora com desconto e reformar em etapas, começando por um ambiente?
              </p>
              <button className="opcaoMedida" onClick={escolherOrcamentoFinal}>
                <span className="opcaoMedidaIcone">✅</span>
                <span className="opcaoMedidaTexto"><b>É o orçamento final</b><span>Fechamos {nomeAmbientes} de uma vez só</span></span>
              </button>
              <button className="opcaoMedida" onClick={escolherFaseado}>
                <span className="opcaoMedidaIcone">🧩</span>
                <span className="opcaoMedidaTexto"><b>Quero fazer em etapas</b><span>{INCENTIVO_FASEADO.texto}</span></span>
              </button>
            </>
          )}

          {app.orcamentoFinal === false && !app.ambienteFaseInicial && selecionados.length > 1 && (
            <>
              <h3 className="secaoTitulo">Qual ambiente você quer começar primeiro?</h3>
              <div className="gradeAmbientes">
                {selecionados.map((a) => (
                  <button key={a.id} className="ambienteChip" onClick={() => confirmarAmbienteFase(a.id)}>{a.nome}</button>
                ))}
              </div>
            </>
          )}

          {(app.orcamentoFinal !== null || !app.briefing.orcamento || selecionados.length === 0) &&
            (app.orcamentoFinal !== false || app.ambienteFaseInicial || selecionados.length <= 1) && (
            <div className="ctaFixo">
              <button className="btPrimario" onClick={irParaMedida}>Continuar</button>
              <button className="btSecundario" onClick={() => { app.setBriefing(null); app.setOrcamentoFinal(null); app.setAmbienteFaseInicial(null); }}>Recomeçar a conversa</button>
            </div>
          )}
        </>
      )}
    </AppFrame>
  );
}
