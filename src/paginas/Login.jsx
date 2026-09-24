import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

export default function Login() {
  const nav = useNavigate();
  const app = useApp();
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");

  if (app.usuario) {
    return (
      <AppFrame titulo="Meu perfil">
        <div className="perfilCartao">
          <div className="perfilAvatar">{app.usuario.nome.charAt(0).toUpperCase()}</div>
          <b>{app.usuario.nome}</b>
          <span>{app.usuario.email}</span>
        </div>
        <button className="linhaMenu" onClick={() => nav("/projetos")}>Minha reforma</button>
        <button className="linhaMenu" onClick={() => nav("/carrinho")}>Meu carrinho</button>
        <button className="linhaMenu painelLink" onClick={() => nav("/painel-expansao")}>⚙ Painel HomeHub (interno)</button>
        <button className="linhaMenu sair" onClick={() => app.setUsuario(null)}>Sair</button>
      </AppFrame>
    );
  }

  return (
    <AppFrame titulo="Entrar">
      <div className="formCheckout">
        <label>Nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" type="email" />
        <div className="ctaFixo">
          <button className="btPrimario" disabled={!nome || !email}
            onClick={() => app.setUsuario({ nome, email })}>Entrar</button>
        </div>
      </div>
    </AppFrame>
  );
}
