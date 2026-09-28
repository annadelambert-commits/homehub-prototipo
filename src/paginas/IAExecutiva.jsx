import { useState, useEffect } from "react";
import AppFrame from "../componentes/AppFrame";
import { REC_ANO, REGIOES_EXPANSAO, PROJETOS_REFORMA } from "../dados/homehub";

function contextoNegocio() {
  const regioes = REGIOES_EXPANSAO.map((r) => `${r.nome}: ${r.clientesPotenciais} clientes potenciais, ticket médio R$ ${r.ticketMedio}, ${r.executoresCertificados} executores certificados, satisfação ${r.notaSatisfacao}`).join("; ");
  const projetos = PROJETOS_REFORMA.map((p) => `${p.nome} (${p.status})`).join(", ");
  return `Faturamento anual recorrente estimado: R$ ${REC_ANO.toLocaleString("pt-BR")}. Base de 23.000 clientes. Ambientes do programa Reforma em Etapas: ${projetos}. Regiões candidatas à expansão: ${regioes}.`;
}

export default function IAExecutiva() {
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

  return (
    <AppFrame titulo="IA Executiva" comNavInferior={false}>
      <div className="painelInternoTag">USO INTERNO HOMEHUB · NÃO VISÍVEL AO CLIENTE</div>
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
    </AppFrame>
  );
}
