import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Carrinho() {
  const nav = useNavigate();
  const app = useApp();

  return (
    <AppFrame titulo="Meu carrinho">
      {app.carrinho.length === 0 ? (
        <div className="vazioCarrinho">
          <p>Seu carrinho está vazio.</p>
          <button className="btSecundario" onClick={() => nav("/")}>Voltar à loja</button>
        </div>
      ) : (
        <>
          {app.carrinho.map((item) => (
            <div key={item.chaveCarrinho} className="itemCarrinho">
              <div>
                <b>{item.nome}</b>
                {item.montagem > 0 && <span className="itemMontagem">+ montagem {brl(item.montagem)}</span>}
              </div>
              <div className="itemCarrinhoDireita">
                <span>{brl(item.valor + (item.montagem || 0))}</span>
                <button onClick={() => app.removerDoCarrinho(item.chaveCarrinho)} aria-label="Remover">✕</button>
              </div>
            </div>
          ))}
          <div className="totalCarrinho">
            <span>Total</span>
            <b>{brl(app.totalCarrinho())}</b>
          </div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => nav("/checkout")}>Fechar pedido</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
