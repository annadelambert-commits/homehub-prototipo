import { useNavigate } from "react-router-dom";
import { CircleUserRound, ShoppingCart } from "lucide-react";
import { useApp } from "../contexto/AppState";
import SuporteBotao from "./SuporteBotao";
import BottomNav from "./BottomNav";

export default function AppFrame({ titulo, voltar, children, comNavInferior = true }) {
  const nav = useNavigate();
  const app = useApp();

  return (
    <div className="telaApp">
      <header className="topoApp">
        {voltar !== false ? (
          <button className="iconeTopo" onClick={() => (voltar ? voltar() : nav(-1))} aria-label="Voltar">‹</button>
        ) : (
          <button className="marcaTopo" onClick={() => nav("/")}>
            <span className="wordHome">home</span><span className="wordHub">hub</span>
          </button>
        )}
        <span className="tituloTopo">{titulo}</span>
        <div className="acoesTopo">
          <button className="iconeTopo" onClick={() => nav("/perfil")} aria-label="Perfil">
            <CircleUserRound size={19} strokeWidth={1.7} />
          </button>
          <button className="iconeTopo carrinhoIcone" onClick={() => nav("/carrinho")} aria-label="Carrinho">
            <ShoppingCart size={19} strokeWidth={1.7} />
            {app.carrinho.length > 0 && <span className="badge">{app.carrinho.length}</span>}
          </button>
        </div>
      </header>
      <main className={"corpoApp" + (comNavInferior ? " comNav" : "")}>{children}</main>
      <SuporteBotao />
      {comNavInferior && <BottomNav carrinhoQtd={app.carrinho.length} />}
    </div>
  );
}
