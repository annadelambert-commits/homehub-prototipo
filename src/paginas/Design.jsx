import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";
import { ESTILOS_DESIGN, PALETAS_DESIGN, renderPorEstilo, PROJETO_DESIGN_ITENS, DESCONTO_PACOTE } from "../dados/homehub";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

const PASSO = { FOTO: 0, ESTILO: 1, GERANDO: 2, RESULTADO: 3, PROJETO: 4 };

export default function Design() {
  const nav = useNavigate();
  const app = useApp();
  const [passo, setPasso] = useState(app.designResultado ? PASSO.RESULTADO : PASSO.FOTO);

  function onFoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => app.setDesignFoto(r.result);
    r.readAsDataURL(f);
  }

  async function gerar() {
    if (!app.designEstilo || !app.designPaleta) return;
    setPasso(PASSO.GERANDO);
    app.setDesignErro(null);
    const est = ESTILOS_DESIGN.find((e) => e.id === app.designEstilo);
    const pal = PALETAS_DESIGN.find((p) => p.id === app.designPaleta);
    const mensagem = `Ambiente: sala de estar. Estilo escolhido: ${est.nome} (${est.desc}). Paleta: ${pal.nome}.`;
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "design", mensagem }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.resumo) throw new Error("resposta incompleta");
      app.setDesignResultado({ render: renderPorEstilo(app.designEstilo), resumo: dados.resumo, destaques: dados.destaques || [] });
      setPasso(PASSO.RESULTADO);
    } catch {
      app.setDesignErro("Não foi possível gerar o texto do projeto agora. Confira a chave da API no Netlify, ou use o exemplo pronto.");
      setPasso(PASSO.ESTILO);
    }
  }

  function usarExemplo() {
    const est = ESTILOS_DESIGN.find((e) => e.id === (app.designEstilo || "moderno"));
    app.setDesignEstilo(est.id);
    if (!app.designPaleta) app.setDesignPaleta("neutra");
    app.setDesignResultado({
      render: renderPorEstilo(est.id),
      resumo: `Sua sala ganha um ar ${est.nome.toLowerCase()}: ${est.desc.toLowerCase()}, com uma paleta de tons harmônicos que traz aconchego e sofisticação. Os materiais naturais e a iluminação pensada valorizam cada canto do ambiente.`,
      destaques: ["Sofá amplo como ponto central", "Painel ripado para a TV", "Iluminação em camadas", "Têxteis e plantas para aquecer o ambiente"],
    });
    app.setDesignErro(null);
    setPasso(PASSO.RESULTADO);
  }

  const itens = PROJETO_DESIGN_ITENS;
  const totalCheio = itens.reduce((s, i) => s + i.valor, 0);
  const totalComDesconto = Math.round(totalCheio * (1 - DESCONTO_PACOTE));
  const economia = totalCheio - totalComDesconto;

  function adicionarProjetoAoCarrinho() {
    app.adicionarAoCarrinho({
      nome: "Projeto de Ambientação (IA de Design), pacote completo",
      valor: totalComDesconto, montagem: 0, categoriaId: "design",
    });
    nav("/carrinho");
  }
  function fazerPorEtapas() {
    app.setProjetoAtivoId("sala");
    nav("/projetos");
  }

  return (
    <AppFrame titulo="Projetar com IA" comNavInferior={false}>
      {/* PASSO 1: FOTO */}
      {passo === PASSO.FOTO && (
        <>
          <div className="passoIndicador"><i className="ativo" /><i /><i /></div>
          <h2 className="tituloTela">Fotografe o ambiente que quer transformar</h2>
          <p className="subtituloTela">A IA usa sua foto como base para propor a reforma no estilo que você escolher. Você pode pular e usar um ambiente de exemplo.</p>
          {app.designFoto && <img className="prevImg" src={app.designFoto} alt="Ambiente enviado" />}
          <label className="soltaArquivo">
            <b>{app.designFoto ? "Trocar foto" : "Enviar foto do ambiente"}</b>
            <span>Toque para escolher uma imagem</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFoto} />
          </label>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => setPasso(PASSO.ESTILO)}>Continuar</button>
          </div>
        </>
      )}

      {/* PASSO 2: ESTILO + PALETA */}
      {passo === PASSO.ESTILO && (
        <>
          <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /></div>
          <h2 className="tituloTela">Escolha o estilo e a paleta</h2>
          <label className="rotuloSecao">Estilo</label>
          <div className="gradeEstilos">
            {ESTILOS_DESIGN.map((e) => (
              <button key={e.id} className={"estiloCard" + (app.designEstilo === e.id ? " sel" : "")}
                onClick={() => app.setDesignEstilo(e.id)}>
                <b>{e.nome}</b><span>{e.desc}</span>
              </button>
            ))}
          </div>
          <label className="rotuloSecao">Paleta de cores</label>
          <div className="listaPaletas">
            {PALETAS_DESIGN.map((p) => (
              <button key={p.id} className={"paletaRow" + (app.designPaleta === p.id ? " sel" : "")}
                onClick={() => app.setDesignPaleta(p.id)}>
                <span className="paletaNome">{p.nome}</span>
                <span className="paletaCores">
                  {p.cores.map((c, i) => <i key={i} style={{ background: c }} />)}
                </span>
              </button>
            ))}
          </div>
          {app.designErro && <div className="cartao alerta" style={{ marginTop: 12 }}><p>{app.designErro}</p></div>}
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!app.designEstilo || !app.designPaleta} onClick={gerar}>Gerar meu projeto com IA</button>
            <button className="btSecundario" onClick={usarExemplo}>Usar exemplo pronto</button>
          </div>
        </>
      )}

      {/* PASSO 3: GERANDO */}
      {passo === PASSO.GERANDO && (
        <div className="carregando"><div className="pulso" /><p>A IA está compondo seu ambiente…</p></div>
      )}

      {/* PASSO 4: RESULTADO (render) */}
      {passo === PASSO.RESULTADO && app.designResultado && (
        <>
          <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="ativo" /></div>
          <h2 className="tituloTela">Seu novo ambiente</h2>
          <div className="renderBox">
            <img src={app.designResultado.render} alt="Ambiente reformado" />
            <span className="renderTag">demonstração, geração ao vivo depende de integração com modelo de imagem</span>
          </div>
          <div className="cartao bom" style={{ marginTop: 12 }}>
            <p>{app.designResultado.resumo}</p>
          </div>
          {app.designResultado.destaques.length > 0 && (
            <div className="cartao">
              <h4>Destaques do projeto</h4>
              {app.designResultado.destaques.map((d, i) => (
                <div key={i} className="destaqueItem">✓ {d}</div>
              ))}
            </div>
          )}
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => setPasso(PASSO.PROJETO)}>Gostei, abrir o projeto e ver o que preciso</button>
            <button className="btSecundario" onClick={() => setPasso(PASSO.ESTILO)}>Tentar outro estilo</button>
          </div>
        </>
      )}

      {/* PASSO 5: PROJETO com itens e preços */}
      {passo === PASSO.PROJETO && (
        <>
          <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="feito" /></div>
          <h2 className="tituloTela">Tudo o que seu projeto precisa</h2>
          <p className="subtituloTela">Cada item do render vira um item do pacote. Feche tudo junto e a HomeHub entrega, instala e garante.</p>
          <div className="listaItensProjeto">
            {itens.map((it) => (
              <div key={it.id} className="itemProjeto">
                <div>
                  <b>{it.nome}</b>
                  <span className="itemProjetoCat">{it.cat}</span>
                </div>
                <span className="itemProjetoValor">{brl(it.valor)}</span>
              </div>
            ))}
          </div>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Somando item a item</span><b style={{ textDecoration: "line-through", color: "var(--navy4)" }}>{brl(totalCheio)}</b></div>
            <div className="linhaResumo"><span>Desconto de pacote (12%)</span><b style={{ color: "var(--ok)" }}>− {brl(economia)}</b></div>
            <div className="linhaResumo total"><span>Preço do pacote completo</span><b>{brl(totalComDesconto)}</b></div>
          </div>
          <div className="cartao bom"><h4>Preço fechado, protegido contra surpresa</h4>
            <p>Você trava esse valor agora: produto, material, móveis e mão de obra. Sem custo que aparece no meio da obra.</p></div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={adicionarProjetoAoCarrinho}>Adicionar pacote ao carrinho · {brl(totalComDesconto)}</button>
            <button className="btSecundario" onClick={fazerPorEtapas}>Prefiro fazer por etapas</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
