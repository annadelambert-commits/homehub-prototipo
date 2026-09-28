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

  const focoCategoria = app.escopoFoco === "categoria" && app.categoriaFoco;

  // agrupa por categoria só os itens relevantes para os ambientes escolhidos; se o concierge detectou um
  // pedido específico (ex.: "só o piso"), mostra só aquela categoria, pra todos os ambientes selecionados
  const grupos = useMemo(() => {
    const out = [];
    const categoriasAlvo = focoCategoria ? [app.categoriaFoco] : Object.keys(PRODUTOS);
    for (const categoriaId of categoriasAlvo) {
      if (!PRODUTOS[categoriaId]) continue;
      const cat = CATEGORIAS.find((c) => c.id === categoriaId);
      const itens = PRODUTOS[categoriaId].filter((p) =>
        Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a))
      );
      if (itens.length > 0) out.push({ categoriaId, categoriaNome: cat ? cat.nome : categoriaId, itens });
    }
    return out;
  }, [app.ambientesSelecionados, focoCategoria, app.categoriaFoco]);

  function estaSelecionado(p, categoriaId) {
    return app.itensProjeto.some((i) => i.id === p.id && i.categoriaId === categoriaId);
  }

  function quantidadeDe(p, categoriaId) {
    const it = app.itensProjeto.find((i) => i.id === p.id && i.categoriaId === categoriaId);
    return it ? it.quantidade || 1 : 1;
  }

  function toggle(p, categoriaId) {
    app.toggleItemProjeto({ ...p, categoriaId });
  }

  function mudarQtd(p, categoriaId, delta, e) {
    e.stopPropagation();
    app.setQuantidadeItem(p.id, categoriaId, quantidadeDe(p, categoriaId) + delta);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="ativo" /><i /><i /></div>
      <h2 className="tituloTela">{focoCategoria ? `Opções de ${CATEGORIAS.find((c) => c.id === app.categoriaFoco)?.nome.toLowerCase() || "itens"} para ${nomeAmbientes}` : `Monte o projeto de ${nomeAmbientes}`}</h2>
      <p className="subtituloTela">
        {focoCategoria
          ? "Você pediu algo específico, então trouxemos só essa frente. Se quiser, dá pra ampliar o projeto depois."
          : "Selecione tudo que você quer incluir: móveis, revestimentos, iluminação e decoração. Dá pra ajustar a quantidade de cada item."}
      </p>

      {grupos.map((g) => (
        <div key={g.categoriaId}>
          <h3 className="secaoTitulo">{g.categoriaNome}</h3>
          {g.itens.map((p) => {
            const sel = estaSelecionado(p, g.categoriaId);
            const qtd = quantidadeDe(p, g.categoriaId);
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
                  {sel ? (
                    <div className="seletorQtd" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => mudarQtd(p, g.categoriaId, -1, e)} disabled={qtd <= 1}>−</button>
                      <span>{qtd}{p.unidade ? " " + p.unidade : "×"}</span>
                      <button onClick={(e) => mudarQtd(p, g.categoriaId, 1, e)}>+</button>
                      <span className="tagCabe sim" style={{ marginLeft: "auto" }}>✓ remover</span>
                    </div>
                  ) : (
                    <span className="tagCabe mov">toque para adicionar</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {grupos.length === 0 && <p className="vazioTxt">Nenhum item cadastrado para esse ambiente ainda.</p>}

      {app.itensProjeto.length > 0 && (() => {
        const desconto = app.descontoPacote();
        return (
          <div className="cartaoResumo" style={{ position: "sticky", bottom: 84 }}>
            <div className="linhaResumo total"><span>{app.itensProjeto.length} {app.itensProjeto.length === 1 ? "item selecionado" : "itens selecionados"}</span><b>{brl0(app.totalItensProjeto())}</b></div>
            {desconto.pct > 0 && (
              <div className="linhaResumo"><span>{desconto.label}</span><b style={{ color: "var(--ok)" }}>−{desconto.pct}% no fechamento</b></div>
            )}
          </div>
        );
      })()}

      <div className="ctaFixo">
        <button className="btPrimario" disabled={app.itensProjeto.length === 0} onClick={() => nav("/projeto-completo/resumo")}>
          Continuar
        </button>
      </div>
    </AppFrame>
  );
}
