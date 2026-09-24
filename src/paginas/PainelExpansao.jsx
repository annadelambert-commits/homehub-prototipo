import { useState } from "react";
import { REGIOES_EXPANSAO } from "../dados/homehub";
import AppFrame from "../componentes/AppFrame";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function PainelExpansao() {
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  async function gerar() {
    setCarregando(true); setErro(null);
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "expansao", regioes: REGIOES_EXPANSAO }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.recomendada) throw new Error("resposta incompleta");
      setResultado(dados);
    } catch {
      setErro("Não foi possível gerar a recomendação agora. Verifique a configuração de ANTHROPIC_API_KEY no Netlify — ou use o exemplo pronto abaixo.");
    } finally {
      setCarregando(false);
    }
  }

  function usarExemplo() {
    setResultado({
      recomendada: "Curitiba, PR",
      raciocinio: "Curitiba combina a maior nota de satisfação entre as regiões com volume relevante (8,8) com a maior densidade de executores certificados por cliente potencial — o que reduz o risco operacional de abrir uma nova praça. O ticket médio também está entre os mais altos. O ponto de atenção é o volume absoluto de clientes, menor que Rio de Janeiro.",
      alternativas: [
        { regiao: "Rio de Janeiro, RJ", motivo: "Maior volume de clientes potenciais, mas satisfação mais baixa (8,1) pede investimento extra em suporte antes de escalar." },
        { regiao: "Belo Horizonte, MG", motivo: "Bom equilíbrio geral, mas sem um fator que se destaque claramente sobre Curitiba." },
      ],
    });
    setErro(null);
  }

  return (
    <AppFrame titulo="Painel HomeHub">
      <div className="painelInternoTag">PAINEL INTERNO HOMEHUB · NÃO VISÍVEL AO CLIENTE</div>
      <h2 className="tituloTela">Priorização de expansão — Fase 2</h2>
      <p className="subtituloTela">
        Quarta aplicação de IA do projeto: não atende o cliente, atende a decisão da própria HomeHub sobre
        onde a Fase 2 do roadmap começa. Os números abaixo são uma simulação a partir da base atual de 23.000
        clientes — na Fase 2 real, entram os números medidos no piloto do Sudeste.
      </p>

      <div className="listaRegioes">
        {REGIOES_EXPANSAO.map((r) => (
          <div key={r.id} className={"regiaoCard" + (resultado?.recomendada === r.nome ? " destaque" : "")}>
            <b>{r.nome}</b>
            {resultado?.recomendada === r.nome && <span className="regiaoBadge">Recomendada pela IA</span>}
            <div className="regiaoGrade">
              <div><span>Clientes potenciais</span><b>{r.clientesPotenciais.toLocaleString("pt-BR")}</b></div>
              <div><span>Ticket médio</span><b>{brl0(r.ticketMedio)}</b></div>
              <div><span>Executores certificados</span><b>{r.executoresCertificados}</b></div>
              <div><span>Satisfação</span><b>★ {r.notaSatisfacao.toFixed(1)}</b></div>
            </div>
          </div>
        ))}
      </div>

      {!resultado && !carregando && (
        <div className="ctaFixo">
          <button className="btPrimario" onClick={gerar}>Gerar recomendação de expansão</button>
          <button className="btSecundario" onClick={usarExemplo}>Usar exemplo pronto</button>
        </div>
      )}

      {carregando && <div className="carregando"><div className="pulso" /><p>Analisando as seis regiões</p></div>}

      {erro && !carregando && (
        <>
          <div className="cartao alerta"><p>{erro}</p></div>
          <div className="ctaFixo"><button className="btPrimario" onClick={usarExemplo}>Usar exemplo pronto</button></div>
        </>
      )}

      {resultado && !carregando && (
        <>
          <div className="cartao bom" style={{ marginTop: 4 }}>
            <h4>Por que {resultado.recomendada}</h4>
            <p>{resultado.raciocinio}</p>
          </div>
          <h3 className="secaoTitulo">Alternativas consideradas</h3>
          {resultado.alternativas.map((a, i) => (
            <div key={i} className="cartaoResumo" style={{ marginTop: i === 0 ? 0 : 8 }}>
              <div className="linhaResumo"><span>{a.regiao}</span></div>
              <p style={{ fontSize: 11, color: "var(--navy3)", marginTop: 4 }}>{a.motivo}</p>
            </div>
          ))}
          <div className="ctaFixo">
            <button className="btSecundario" onClick={() => { setResultado(null); setErro(null); }}>Gerar de novo</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
