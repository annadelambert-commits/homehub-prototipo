import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { PRODUTOS, CATEGORIAS, CATEGORIAS_REFORMA, AMBIENTES } from "../../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Escolha() {
  const nav = useNavigate();
  const app = useApp();

  const nomeAmbientes = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id))
    .map((a) => a.nome.toLowerCase()).join(", ") || "seu ambiente";

  const focoCategoria = app.escopoFoco === "categoria" && app.categoriaFoco;
  const categoriaReformaInfo = focoCategoria ? CATEGORIAS_REFORMA.find((c) => c.id === app.categoriaFoco) : null;

  // agrupa por categoria os itens relevantes para os ambientes escolhidos. No modo "reforma por categoria"
  // (ex.: só o piso), já reúne material + mão de obra daquela frente; no modo geral, tudo que é cabível
  // pros ambientes escolhidos entra automaticamente (o cliente edita/remove depois).
  const grupos = useMemo(() => {
    const out = [];
    if (categoriaReformaInfo) {
      const categoriasAlvo = [...categoriaReformaInfo.categorias, "mao-de-obra"];
      for (const categoriaId of categoriasAlvo) {
        if (!PRODUTOS[categoriaId]) continue;
        const cat = CATEGORIAS.find((c) => c.id === categoriaId);
        const itens = PRODUTOS[categoriaId].filter((p) =>
          Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a)) &&
          (p.categoriaReforma === undefined || p.categoriaReforma === categoriaReformaInfo.id)
        );
        if (itens.length > 0) out.push({ categoriaId, categoriaNome: cat ? cat.nome : categoriaId, itens });
      }
    } else {
      for (const categoriaId of Object.keys(PRODUTOS)) {
        if (categoriaId === "mao-de-obra") continue; // mão de obra por sistema só entra no modo "categoria específica"
        const cat = CATEGORIAS.find((c) => c.id === categoriaId);
        const itens = PRODUTOS[categoriaId].filter((p) =>
          Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a))
        );
        if (itens.length > 0) out.push({ categoriaId, categoriaNome: cat ? cat.nome : categoriaId, itens });
      }
    }
    return out;
  }, [app.ambientesSelecionados, categoriaReformaInfo]);

  // o projeto já vem com tudo que é cabível pré-selecionado no carrinho; o cliente edita/remove a partir daí.
  // só preenche automaticamente quando o carrinho do projeto está vazio, pra não sobrescrever remoções manuais.
  useEffect(() => {
    if (app.itensProjeto.length === 0 && grupos.length > 0) {
      grupos.forEach((g) => g.itens.forEach((p) => app.toggleItemProjeto({ ...p, categoriaId: g.categoriaId })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupos]);

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
      <h2 className="tituloTela">{categoriaReformaInfo ? `${categoriaReformaInfo.nome} para ${nomeAmbientes}` : `Seu projeto de ${nomeAmbientes}`}</h2>
      <p className="subtituloTela">
        {categoriaReformaInfo
          ? "Já reunimos o material e a mão de obra dessa frente. Você pode remover ou ajustar qualquer item."
          : "Já reunimos tudo que é necessário pra esse projeto. Remova ou ajuste a quantidade do que não quiser."}
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
                      <button type="button" className="tagCabe sim btRemoverInline" style={{ marginLeft: "auto" }}
                        onClick={(e) => { e.stopPropagation(); toggle(p, g.categoriaId); }}>
                        ✕ remover
                      </button>
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
