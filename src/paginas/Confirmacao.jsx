import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Confirmacao() {
  const nav = useNavigate();
  const app = useApp();
  const pedido = app.pedidoConfirmado;

  if (!pedido) return <AppFrame titulo="Pedido" voltar={false}><p className="vazioTxt">Nenhum pedido recente.</p></AppFrame>;

  return (
    <AppFrame titulo="Pedido confirmado" voltar={false}>
      <div className="confirmacaoIcone">✓</div>
      <h2 className="confirmacaoTitulo">Pedido {pedido.numero} confirmado</h2>
      <p className="confirmacaoTexto">Acompanhe o andamento em "Meus pedidos". Você recebe atualizações por e-mail e notificação.</p>
      <div className="cartaoResumo">
        <div className="linhaResumo"><span>Valor</span><b>{brl(pedido.total)}</b></div>
        <div className="linhaResumo"><span>Pagamento</span><b>{pedido.forma === "credito" ? "Em análise pelo parceiro" : pedido.forma === "avista" ? "Pix à vista" : "Cartão parcelado"}</b></div>
      </div>
      <div className="ctaFixo">
        <button className="btPrimario" onClick={() => nav("/projetos")}>Acompanhar pedido</button>
        <button className="btSecundario" onClick={() => nav("/")}>Voltar à loja</button>
      </div>
    </AppFrame>
  );
}
