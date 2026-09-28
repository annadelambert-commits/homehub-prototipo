import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

const OPCOES = [
  { id: "render", icone: "🎨", titulo: "Ainda não sei por onde começar",
    sub: "Fotografe o ambiente e veja um render de como pode ficar" },
  { id: "projeto", icone: "🧱", titulo: "Quero um projeto completo",
    sub: "Um ambiente, ou a casa toda em etapas, com orçamento fechado" },
  { id: "movel", icone: "📦", titulo: "Quero comprar só um móvel planejado",
    sub: "Já sei o que preciso, é uma peça avulsa" },
  { id: "medida", icone: "📐", titulo: "Preciso de ajuda com as medidas",
    sub: "Fotografar, enviar planta ou digitar as medidas do ambiente" },
  { id: "duvida", icone: "💬", titulo: "Tenho dúvidas técnicas antes de decidir",
    sub: "Falar agora com o suporte especializado" },
  { id: "preco", icone: "💰", titulo: "Quero entender os preços antes de decidir",
    sub: "Ver o catálogo de móveis planejados com valores" },
];

export default function Onboarding() {
  const nav = useNavigate();
  const app = useApp();

  function escolher(id) {
    if (id === "render") nav("/design");
    else if (id === "projeto") nav("/projeto-completo");
    else if (id === "movel") nav("/moveis-planejados");
    else if (id === "medida") nav("/projeto-completo/medida");
    else if (id === "duvida") app.setSuporteAberto(true);
    else if (id === "preco") nav("/categoria/moveis-planejados");
  }

  return (
    <AppFrame titulo="Vamos começar" comNavInferior={false}>
      <h2 className="tituloTela">O que você precisa agora?</h2>
      <p className="subtituloTela">Escolha a opção mais próxima da sua situação. Dá pra mudar de caminho a qualquer momento.</p>

      {OPCOES.map((o) => (
        <button key={o.id} className="opcaoMedida" onClick={() => escolher(o.id)}>
          <span className="opcaoMedidaIcone">{o.icone}</span>
          <span className="opcaoMedidaTexto"><b>{o.titulo}</b><span>{o.sub}</span></span>
        </button>
      ))}
    </AppFrame>
  );
}
