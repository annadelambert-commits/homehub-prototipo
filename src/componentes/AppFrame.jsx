import { useNavigate } from "react-router-dom";
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
            {app.usuario ? "👤" : "◯"}
          </button>
          <button className="iconeTopo carrinhoIcone" onClick={() => nav("/carrinho")} aria-label="Carrinho">
            🛒
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
