import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { AMBIENTES } from "../../dados/homehub";

function brl(v) { return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Resumo() {
  const nav = useNavigate();
  const app = useApp();
  const [adicionado, setAdicionado] = useState(false);
  const itens = app.itensProjeto;

  if (itens.length === 0) return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <p className="vazioTxt">Nenhum item escolhido ainda.</p>
      <div className="ctaFixo"><button className="btPrimario" onClick={() => nav("/projeto-completo/escolha")}>Escolher itens</button></div>
    </AppFrame>
  );

  const nomeAmbientes = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id))
    .map((a) => a.nome.toLowerCase()).join(", ") || "seu projeto";

  const clienteJaMediu = !!app.plantaCompleta || (
    app.ambientesSelecionados.length > 0 &&
    app.ambientesSelecionados.every((id) => {
      const m = app.medidasPorAmbiente[id];
      return m && (m.origem === "manual" || m.origem === "planta");
    })
  ) || app.origemMedida === "manual" || app.origemMedida === "planta";
  const medicao = clienteJaMediu ? 0 : 180;
  const subtotal = app.totalItensProjeto();
  const desconto = app.descontoPacote();
  const valorDesconto = subtotal * (desconto.pct / 100);
  const total = subtotal - valorDesconto + medicao + 240;
  const maiorPrazo = Math.max(...itens.map((i) => i.dias || 10));
  const d = new Date(); d.setDate(d.getDate() + maiorPrazo - (clienteJaMediu ? 2 : 0));

  function brl0v(it) { return (it.valor + (it.montagem || 0)) * (it.quantidade || 1); }

  function remover(it) {
    app.toggleItemProjeto(it);
  }

  function mudarQtd(it, delta) {
    app.setQuantidadeItem(it.id, it.categoriaId, (it.quantidade || 1) + delta);
  }

  function adicionar() {
    for (const it of itens) {
      app.adicionarAoCarrinho({ nome: it.nome + (it.quantidade > 1 ? ` ×${it.quantidade}` : "") + " (Projeto Completo)", valor: brl0v(it), montagem: 0, categoriaId: it.categoriaId });
    }
    if (desconto.pct > 0) {
      app.adicionarAoCarrinho({ nome: `Desconto ${desconto.label} (−${desconto.pct}%)`, valor: -valorDesconto, montagem: 0, categoriaId: "desconto" });
    }
    app.adicionarAoCarrinho({ nome: "Medição e entrega do projeto", valor: 0, montagem: medicao + 240, categoriaId: "servico" });
    setAdicionado(true);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="feito" /><i className="ativo" /></div>
      <h2 className="tituloTela">Projeto de {nomeAmbientes}</h2>

      <div className="listaItensProjeto">
        {itens.map((it) => (
          <div key={it.categoriaId + "-" + it.id} className="itemProjeto editavel">
            <div>
              <b>{it.nome}</b>
              <span className="itemProjetoCat">{it.montagem ? "com montagem" : ""}{it.unidade ? ` · por ${it.unidade}` : ""}</span>
            </div>
            <div className="itemProjetoAcoes">
              <div className="seletorQtd pequeno">
                <button onClick={() => mudarQtd(it, -1)} disabled={(it.quantidade || 1) <= 1}>−</button>
                <span>{it.quantidade || 1}</span>
                <button onClick={() => mudarQtd(it, 1)}>+</button>
              </div>
              <span className="itemProjetoValor">{brl(brl0v(it))}</span>
              <button className="btRemoverItem" title="Remover item" onClick={() => remover(it)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cartaoResumo">
        <div className="linhaResumo"><span>Itens do projeto</span><b>{brl(subtotal)}</b></div>
        {desconto.pct > 0 && (
          <div className="linhaResumo"><span>{desconto.label}</span><b style={{ color: "var(--ok)" }}>−{brl(valorDesconto)}</b></div>
        )}
        {clienteJaMediu ? (
          <div className="linhaResumo"><span>Medição profissional</span><b style={{ color: "var(--ok)" }}>Dispensada, você já mediu</b></div>
        ) : (
          <div className="linhaResumo"><span>Medição profissional</span><b>{brl(medicao)}</b></div>
        )}
        <div className="linhaResumo"><span>Entrega</span><b>{brl(240)}</b></div>
        <div className="linhaResumo total"><span>Total, fechado hoje</span><b>{brl(total)}</b></div>
      </div>

      {clienteJaMediu && (
        <div className="cartao bom"><h4>Você economizou R$ 180,00</h4>
          <p>Por já ter enviado a medida, a visita técnica de medição não entra no orçamento.</p></div>
      )}

      <div className="cartaoResumo">
        <div className="linhaResumo"><span>Data garantida</span><b>{d.toLocaleDateString("pt-BR")}</b></div>
        <div className="linhaResumo"><span>Se atrasar</span><b style={{ color: "var(--redD)" }}>5% de desconto automático</b></div>
      </div>

      <div className="ctaFixo">
        {adicionado ? (
          <button className="btPrimario" onClick={() => nav("/carrinho")}>Ver carrinho</button>
        ) : (
          <button className="btPrimario" onClick={adicionar}>Adicionar ao carrinho</button>
        )}
        {!adicionado && <button className="btSecundario" onClick={() => nav("/projeto-completo/escolha")}>Ajustar itens</button>}
      </div>
    </AppFrame>
  );
}
