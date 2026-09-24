import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexto/AppState";
import Home from "./paginas/Home";
import Categorias from "./paginas/Categorias";
import Categoria from "./paginas/Categoria";
import ProdutoDetalhe from "./paginas/ProdutoDetalhe";
import Carrinho from "./paginas/Carrinho";
import Checkout from "./paginas/Checkout";
import Confirmacao from "./paginas/Confirmacao";
import Login from "./paginas/Login";
import Projetos from "./paginas/Projetos";
import PainelExpansao from "./paginas/PainelExpansao";
import Concierge from "./paginas/projetoCompleto/Concierge";
import Medida from "./paginas/projetoCompleto/Medida";
import Escolha from "./paginas/projetoCompleto/Escolha";
import Resumo from "./paginas/projetoCompleto/Resumo";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categoria/:categoriaId" element={<Categoria />} />
          <Route path="/produto/:categoriaId/:produtoId" element={<ProdutoDetalhe />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/perfil" element={<Login />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/painel-expansao" element={<PainelExpansao />} />
          <Route path="/projeto-completo" element={<Concierge />} />
          <Route path="/projeto-completo/medida" element={<Medida />} />
          <Route path="/projeto-completo/escolha" element={<Escolha />} />
          <Route path="/projeto-completo/resumo" element={<Resumo />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
