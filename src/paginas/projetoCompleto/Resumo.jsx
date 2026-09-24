import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";

function brl(v) { return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Resumo() {
  const nav = useNavigate();
  const app = useApp();
  const [adicionado, setAdicionado] = useState(false);
  const p = app.produtoAtual;

  if (!p) return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <p className="vazioTxt">Nenhum produto escolhido ainda.</p>
      <div className="ctaFixo"><button className="btPrimario" onClick={() => nav("/projeto-completo/escolha")}>Escolher produto</button></div>
    </AppFrame>
  );

  const clienteJaMediu = app.origemMedida === "manual";
  const medicao = clienteJaMediu ? 0 : 180;
  const total = p.valor + p.montagem + medicao + 240;
  const d = new Date(); d.setDate(d.getDate() + p.dias - (clienteJaMediu ? 2 : 0));

  function adicionar() {
    app.adicionarAoCarrinho({ nome: p.nome + " (Projeto Completo)", valor: p.valor, montagem: p.montagem + medicao + 240, categoriaId: "moveis-planejados" });
    setAdicionado(true);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="feito" /><i className="ativo" /></div>
      <h2 className="tituloTela">{p.nome}</h2>

      <div className="cartaoResumo">
        <div className="linhaResumo"><span>Móvel planejado</span><b>{brl(p.valor)}</b></div>
        {clienteJaMediu ? (
          <div className="linhaResumo"><span>Medição profissional</span><b style={{ color: "var(--ok)" }}>Dispensada — você já mediu</b></div>
        ) : (
          <div className="linhaResumo"><span>Medição profissional</span><b>{brl(medicao)}</b></div>
        )}
        <div className="linhaResumo"><span>Montagem certificada</span><b>{brl(p.montagem)}</b></div>
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
      </div>
    </AppFrame>
  );
}
