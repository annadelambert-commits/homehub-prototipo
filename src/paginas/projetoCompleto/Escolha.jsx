import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { PRODUTOS } from "../../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Escolha() {
  const nav = useNavigate();
  const app = useApp();
  const vao = app.vaoUtil();
  const catalogo = PRODUTOS["moveis-planejados"];

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="ativo" /><i /></div>
      <h2 className="tituloTela">{vao ? `O que cabe no seu vão de ${vao} cm` : "Escolha o projeto"}</h2>
      {!vao && <div className="cartao alerta"><p>Sem medida ainda — volte à etapa anterior. Mostrando o catálogo completo.</p></div>}

      {catalogo.map((p) => {
        const cabe = !vao || p.l <= vao;
        return (
          <button key={p.id} className={"produtoCard largo" + (app.produtoAtual?.id === p.id ? " sel" : "")}
            disabled={!cabe} onClick={() => app.setProdutoAtual(p)}>
            <div className="produtoImg">{p.img}</div>
            <div className="produtoInfo">
              <b>{p.nome}</b>
              <span className="produtoDesc">{p.l} × {p.p} × {p.a} cm — {p.desc}</span>
              <span className="produtoPreco">{brl0(p.valor)}</span>
              {vao && <span className={"tagCabe " + (cabe ? "sim" : "nao")}>{cabe ? `cabe, sobram ${vao - p.l} cm` : `não cabe`}</span>}
            </div>
          </button>
        );
      })}

      <div className="ctaFixo">
        <button className="btPrimario" disabled={!app.produtoAtual} onClick={() => nav("/projeto-completo/resumo")}>
          Continuar
        </button>
      </div>
    </AppFrame>
  );
}
