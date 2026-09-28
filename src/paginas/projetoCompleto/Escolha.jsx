import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { PRODUTOS, CATEGORIAS, AMBIENTES } from "../../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Escolha() {
  const nav = useNavigate();
  const app = useApp();

  const nomeAmbientes = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id))
    .map((a) => a.nome.toLowerCase()).join(", ") || "seu ambiente";

  // agrupa por categoria só os itens relevantes para os ambientes escolhidos
  const grupos = useMemo(() => {
    const out = [];
    for (const categoriaId of Object.keys(PRODUTOS)) {
      const cat = CATEGORIAS.find((c) => c.id === categoriaId);
      const itens = PRODUTOS[categoriaId].filter((p) =>
        Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a))
      );
      if (itens.length > 0) out.push({ categoriaId, categoriaNome: cat ? cat.nome : categoriaId, itens });
    }
    return out;
  }, [app.ambientesSelecionados]);

  function estaSelecionado(p, categoriaId) {
    return app.itensProjeto.some((i) => i.id === p.id && i.categoriaId === categoriaId);
  }

  function toggle(p, categoriaId) {
    app.toggleItemProjeto({ ...p, categoriaId });
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="ativo" /><i /><i /></div>
      <h2 className="tituloTela">Monte o projeto de {nomeAmbientes}</h2>
      <p className="subtituloTela">Selecione tudo que você quer incluir: móveis, revestimentos, iluminação e decoração. Dá pra adicionar mais de um item.</p>

      {grupos.map((g) => (
        <div key={g.categoriaId}>
          <h3 className="secaoTitulo">{g.categoriaNome}</h3>
          {g.itens.map((p) => {
            const sel = estaSelecionado(p, g.categoriaId);
            return (
              <button key={p.id} className={"produtoCard largo" + (sel ? " sel" : "")} onClick={() => toggle(p, g.categoriaId)}>
                {p.img ? (
                  <div className="produtoImg foto" style={{ backgroundImage: `url(${p.img})` }} />
                ) : (
                  <div className="produtoImg" style={{ background: p.cor }} />
                )}
                <div className="produtoInfo">
                  <b>{p.nome}</b>
                  <span className="produtoDesc">{p.desc}</span>
                  <span className="produtoPreco">{brl0(p.valor)}{p.unidade ? "/" + p.unidade : ""}</span>
                  <span className={"tagCabe " + (sel ? "sim" : "mov")}>{sel ? "✓ adicionado" : "toque para adicionar"}</span>
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {grupos.length === 0 && <p className="vazioTxt">Nenhum item cadastrado para esse ambiente ainda.</p>}

      {app.itensProjeto.length > 0 && (
        <div className="cartaoResumo" style={{ position: "sticky", bottom: 84 }}>
          <div className="linhaResumo total"><span>{app.itensProjeto.length} {app.itensProjeto.length === 1 ? "item selecionado" : "itens selecionados"}</span><b>{brl0(app.totalItensProjeto())}</b></div>
        </div>
      )}

      <div className="ctaFixo">
        <button className="btPrimario" disabled={app.itensProjeto.length === 0} onClick={() => nav("/projeto-completo/resumo")}>
          Continuar
        </button>
      </div>
    </AppFrame>
  );
}
