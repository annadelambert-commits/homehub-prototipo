import { useState, useEffect } from "react";
import AppFrame from "../componentes/AppFrame";
import { REC_ANO, REGIOES_EXPANSAO, PROJETOS_REFORMA, CLIENTES_BASE } from "../dados/homehub";

function contextoNegocio() {
  const regioes = REGIOES_EXPANSAO.map((r) => `${r.nome}: ${r.clientesPotenciais} clientes potenciais, ticket médio R$ ${r.ticketMedio}, ${r.executoresCertificados} executores certificados, satisfação ${r.notaSatisfacao}`).join("; ");
  const projetos = PROJETOS_REFORMA.map((p) => `${p.nome} (${p.status})`).join(", ");
  return `Faturamento anual recorrente estimado: R$ ${REC_ANO.toLocaleString("pt-BR")}. Base de ${CLIENTES_BASE.toLocaleString("pt-BR")} clientes. Ambientes do programa Reforma em Etapas: ${projetos}. Regiões candidatas à expansão: ${regioes}.`;
}

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function IAExecutiva() {
  const [aba, setAba] = useState("painel");
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    document.body.setAttribute("data-theme", "dark");
    return () => document.body.removeAttribute("data-theme");
  }, []);

  async function enviar() {
    if (!texto.trim()) return;
    const minhaMsg = texto.trim();
    const historico = msgs.map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => [...m, { role: "user", content: minhaMsg }]);
    setTexto(""); setCarregando(true); setErro(null);
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "executivo", mensagem: minhaMsg, historico, contexto: contextoNegocio() }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      setMsgs((m) => [...m, { role: "assistant", content: dados.resposta }]);
    } catch {
      setErro("Não foi possível falar com a IA executiva agora. Confira a chave da API no Netlify.");
    } finally {
      setCarregando(false);
    }
  }

  const regiaoTop = [...REGIOES_EXPANSAO].sort((a, b) => b.clientesPotenciais - a.clientesPotenciais)[0];
  const ticketMedioGeral = Math.round(REGIOES_EXPANSAO.reduce((s, r) => s + r.ticketMedio, 0) / REGIOES_EXPANSAO.length);
  const ambientesAtivos = PROJETOS_REFORMA.filter((p) => p.status === "ativo").length;

  return (
    <AppFrame titulo="IA Executiva" comNavInferior={false}>
      <div className="painelInternoTag">USO INTERNO HOMEHUB · NÃO VISÍVEL AO CLIENTE</div>

      <div className="segmentado">
        <button className={aba === "painel" ? "sel" : ""} onClick={() => setAba("painel")}>Painel</button>
        <button className={aba === "chat" ? "sel" : ""} onClick={() => setAba("chat")}>Perguntar à IA</button>
      </div>

      {aba === "painel" && (
        <>
          <h2 className="tituloTela">Indicadores principais</h2>
          <div className="gradeStats">
            <div className="cartaoStat">
              <span className="statRotulo">Receita anual recorrente</span>
              <b className="statValor">{brl0(REC_ANO)}</b>
            </div>
            <div className="cartaoStat">
              <span className="statRotulo">Base de clientes</span>
              <b className="statValor">{CLIENTES_BASE.toLocaleString("pt-BR")}</b>
            </div>
            <div className="cartaoStat">
              <span className="statRotulo">Ticket médio (regiões candidatas)</span>
              <b className="statValor">{brl0(ticketMedioGeral)}</b>
            </div>
            <div className="cartaoStat">
              <span className="statRotulo">Ambientes ativos em Reforma por Etapas</span>
              <b className="statValor">{ambientesAtivos} de {PROJETOS_REFORMA.length}</b>
            </div>
          </div>

          <h3 className="secaoTitulo">Reforma em Etapas por ambiente</h3>
          <div className="cartaoResumo">
            {PROJETOS_REFORMA.map((p) => (
              <div key={p.id} className="linhaResumo">
                <span>{p.nome} <span className="tagCalc">{p.status}</span></span>
                <b>{brl0(p.orcamentoSugerido)}</b>
              </div>
            ))}
          </div>

          <h3 className="secaoTitulo">Prioridade de expansão sugerida</h3>
          <div className="cartao bom">
            <h4>{regiaoTop.nome}</h4>
            <p>{regiaoTop.clientesPotenciais.toLocaleString("pt-BR")} clientes potenciais, ticket médio {brl0(regiaoTop.ticketMedio)}, {regiaoTop.executoresCertificados} executores certificados, satisfação {regiaoTop.notaSatisfacao}.</p>
          </div>

          <table className="tabelaExec">
            <thead><tr><th>Região</th><th>Clientes</th><th>Ticket médio</th><th>Executores</th><th>Satisfação</th></tr></thead>
            <tbody>
              {REGIOES_EXPANSAO.map((r) => (
                <tr key={r.id}>
                  <td>{r.nome}</td>
                  <td>{r.clientesPotenciais.toLocaleString("pt-BR")}</td>
                  <td>{brl0(r.ticketMedio)}</td>
                  <td>{r.executoresCertificados}</td>
                  <td>{r.notaSatisfacao}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="subtituloTela" style={{ marginTop: 10 }}>Números simulados a partir da base atual, para uso interno na priorização da Fase 2 do roadmap.</p>
        </>
      )}

      {aba === "chat" && (
        <>
          <h2 className="tituloTela">Pergunte sobre o negócio</h2>
          <p className="subtituloTela">Faz perguntas livres sobre números, regiões, ambientes e prioridades. A IA responde com o contexto da base atual.</p>

          <div className="suporteCorpo iaExecCorpo">
            {msgs.length === 0 && <p className="suporteVazio">Ex.: "Qual região devemos priorizar?" ou "Como está o funil de Reforma em Etapas?"</p>}
            {msgs.map((m, i) => (
              <div key={i} className={"suporteMsg " + (m.role === "user" ? "eu" : "ia")}>{m.content}</div>
            ))}
            {carregando && <div className="suporteMsg ia">Analisando…</div>}
            {erro && <div className="suporteMsg erro">{erro}</div>}
          </div>

          <div className="ctaFixo iaExecPe">
            <div className="suportePe" style={{ padding: 0, border: 0 }}>
              <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Pergunte algo sobre o negócio" />
              <button onClick={enviar} type="button" disabled={carregando}>Enviar</button>
            </div>
          </div>
        </>
      )}
    </AppFrame>
  );
}
