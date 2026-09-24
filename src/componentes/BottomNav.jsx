import { useNavigate, useLocation } from "react-router-dom";

const ITENS = [
  { rota: "/", label: "Início", icone: "⌂" },
  { rota: "/categorias", label: "Categorias", icone: "▦" },
  { rota: "/projetos", label: "Projetos", icone: "◈" },
  { rota: "/carrinho", label: "Carrinho", icone: "🛒" },
  { rota: "/perfil", label: "Conta", icone: "◯" },
];

export default function BottomNav({ carrinhoQtd }) {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <nav className="navInferior">
      {ITENS.map((it) => {
        const ativo = it.rota === "/" ? loc.pathname === "/" : loc.pathname.startsWith(it.rota);
        return (
          <button key={it.rota} className={"navItem" + (ativo ? " ativo" : "")} onClick={() => nav(it.rota)}>
            <span className="navIcone">
              {it.icone}
              {it.rota === "/carrinho" && carrinhoQtd > 0 && <span className="navBadge">{carrinhoQtd}</span>}
            </span>
            <span className="navLabel">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
