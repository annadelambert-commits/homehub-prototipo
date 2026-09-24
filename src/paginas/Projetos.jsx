import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";
import { INCENTIVO_FASEADO } from "../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Projetos() {
  const nav = useNavigate();
  const app = useApp();
  const ativo = app.projetos.find((p) => p.status === "ativo");
  const proxima = app.projetos.find((p) => p.status === "sugerido");
  const etapas = [
    ["ok", "Projeto criado", "21/09/2026. A proposta foi transformada em projeto."],
    ["ok", "Produtos selecionados", "Itens da solução estão no seu carrinho."],
    ["ag", "Validação técnica", "Conferência de medidas, escopo e prazo."],
    ["", "Compra e agendamento", "Entrega e montagem serão programadas."],
    ["", "Execução concluída", "Depois desta etapa, a HomeHub recomenda a próxima."],
  ];

  function irParaProjeto(id) {
    app.setProjetoAtivoId(id);
    nav("/projeto-completo");
  }

  return (
    <AppFrame titulo="Minha Reforma">
      {ativo && (
        <div className="minhaReformaCard">
          <span className="mrLabel">MINHA REFORMA</span>
          <h2>Projeto {ativo.nome}</h2>
          <span className="mrSub">{ativo.nome} · Completo · prioridade Preço</span>
          <span className="mrStatus">Em validação técnica</span>
        </div>
      )}

      <div className="timelineCard">
        {etapas.map((e, i) => (
          <div className="etapaP" key={i}>
            <div className={"bolha " + e[0]}>{e[0] === "ok" ? "✓" : i + 1}</div>
            <div className="tx"><b>{e[1]}</b>{e[2]}</div>
          </div>
        ))}
      </div>

      {proxima && (
        <div className="proximaEtapaCard">
          <span className="peLabel">PRÓXIMA ETAPA SUGERIDA</span>
          <h3>{proxima.nome}</h3>
          <p>Quando quiser, sua jornada pode continuar sem começar do zero — o escopo, o estilo e as medidas já
          ficam registrados no seu perfil.</p>
          <div className="incentivoLinha">🏷️ {INCENTIVO_FASEADO.texto}</div>
          <div className="proximaEtapaBotoes">
            <button className="btPrimario" onClick={() => irParaProjeto(proxima.id)}>Começar {proxima.nome.toLowerCase()} agora</button>
            <button className="btSecundario" onClick={() => nav("/categorias")}>Planejar depois</button>
          </div>
        </div>
      )}

      <h3 className="secaoTitulo">Todos os ambientes</h3>
      <p className="subtituloTela" style={{ marginTop: -6 }}>Escolha livremente por onde continuar — não há ordem obrigatória.</p>
      {app.projetos.map((p) => (
        <button key={p.id} className={"projetoCard " + p.status} onClick={() => irParaProjeto(p.id)}>
          <div className="projetoTopo">
            <span className={"projetoBadge " + p.status}>
              {p.status === "ativo" ? "Em andamento" : p.status === "concluido" ? "Concluído" : "Disponível"}
            </span>
            <b>{brl0(p.orcamentoSugerido)}</b>
          </div>
          <h5>{p.nome}</h5>
          <p>{p.resumo}</p>
        </button>
      ))}

      <div className="ctaFixo" style={{ borderTop: "none", marginTop: 8 }}>
        <button className="btPrimario" onClick={() => nav("/carrinho")}>
          Ir para o carrinho{app.carrinho.length > 0 ? " · " + brl0(app.totalCarrinho()) : ""}
        </button>
      </div>
    </AppFrame>
  );
}
