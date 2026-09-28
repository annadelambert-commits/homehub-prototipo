import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { REFERENCIAS, ANALISE_DEMO } from "../../dados/homehub";

const CAMINHOS = { ESCOLHA: 0, FOTO: 1, MANUAL: 2 };

export default function Medida() {
  const nav = useNavigate();
  const app = useApp();
  const [carregando, setCarregando] = useState(false);
  const [caminho, setCaminho] = useState(app.analise ? CAMINHOS.FOTO : CAMINHOS.ESCOLHA);
  const [medidas, setMedidas] = useState({ largura: "", profundidade: "", altura: "" });

  function onArquivo(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { app.setImagem(r.result); app.setMime(f.type); app.setAnalise(null); app.setErroAnalise(null); app.setModoDemo(false); };
    r.readAsDataURL(f);
  }

  function onPlanta(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => app.setPlantaImagem(r.result);
    r.readAsDataURL(f);
  }

  async function analisar() {
    setCarregando(true); app.setErroAnalise(null);
    try {
      const b64 = app.imagem.split(",")[1];
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: b64, mime: app.mime, referenciaNome: app.referencia.nome, referenciaCm: app.referencia.cm }),
      });
      if (!resp.ok) { const t = await resp.text().catch(() => ""); throw new Error(`status ${resp.status}. ${t}`.trim()); }
      const dados = await resp.json();
      if (!dados.vao || !dados.largura) throw new Error("resposta incompleta");
      if (!Array.isArray(dados.obstrucoes)) dados.obstrucoes = [String(dados.obstrucoes || "nenhuma identificada")];
      app.setAnalise(dados); app.setModoDemo(false); app.setOrigemMedida("ia");
    } catch (e) {
      app.setErroAnalise(e.message + ". O protótipo depende de conexão com o modelo de visão.");
    } finally {
      setCarregando(false);
    }
  }

  function usarDemo() { app.setAnalise(ANALISE_DEMO); app.setModoDemo(true); app.setErroAnalise(null); app.setOrigemMedida("demo"); }

  function confirmarComMedidas() {
    const v = Number(medidas.largura);
    if (!v || v < 30) return;
    app.setMedidaManual({
      largura: v,
      profundidade: Number(medidas.profundidade) || null,
      altura: Number(medidas.altura) || null,
    });
    app.setOrigemMedida("manual");
  }

  function confirmarComPlanta() {
    // planta é suficiente por si só: segue sem medidas digitadas, validação fica pra depois
    app.setMedidaManual(null);
    app.setOrigemMedida("planta");
  }

  // ---- tela de escolha entre os dois caminhos ----
  if (caminho === CAMINHOS.ESCOLHA) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Como você quer medir o espaço?</h2>
        <p className="subtituloTela">Escolha o caminho mais rápido pra você. Os dois primeiros usam IA real.</p>

        <button className="opcaoMedida" onClick={() => setCaminho(CAMINHOS.FOTO)}>
          <span className="opcaoMedidaIcone">📷</span>
          <span className="opcaoMedidaTexto"><b>Fotografar o ambiente</b><span>IA de visão estima as medidas pela foto</span></span>
        </button>
        <button className="opcaoMedida" onClick={() => setCaminho(CAMINHOS.MANUAL)}>
          <span className="opcaoMedidaIcone">📐</span>
          <span className="opcaoMedidaTexto"><b>Já tenho as medidas</b><span>Planta baixa ou medição já feita, sem visita técnica</span></span>
        </button>
      </AppFrame>
    );
  }

  // ---- caminho manual: planta e/ou medidas do ambiente completo ----
  if (caminho === CAMINHOS.MANUAL && app.origemMedida !== "manual" && app.origemMedida !== "planta") {
    const podeConfirmarComMedidas = medidas.largura && Number(medidas.largura) >= 30;
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setCaminho(CAMINHOS.ESCOLHA)} comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Já tenho as medidas</h2>
        <p className="subtituloTela">Envie a planta baixa do ambiente completo (ela já é suficiente pra continuar) e, se quiser, complemente com as medidas.</p>

        {app.plantaImagem && <img className="prevImg" src={app.plantaImagem} alt="Planta enviada" />}
        <label className="soltaArquivo">
          <b>{app.plantaImagem ? "Trocar planta" : "Enviar planta baixa"}</b>
          <span>Toque para escolher uma imagem ou PDF</span>
          <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={onPlanta} />
        </label>

        {app.plantaImagem && (
          <div className="ctaFixo" style={{ marginTop: 0, borderTop: "none" }}>
            <button className="btPrimario" onClick={confirmarComPlanta}>Continuar com a planta enviada</button>
          </div>
        )}

        <label className="rotuloSecao" style={{ marginTop: 18 }}>Medidas do ambiente completo (cm), opcional</label>
        <div className="linhaMedidas">
          <input type="number" placeholder="Largura" value={medidas.largura} onChange={(e) => setMedidas({ ...medidas, largura: e.target.value })} />
          <input type="number" placeholder="Profund." value={medidas.profundidade} onChange={(e) => setMedidas({ ...medidas, profundidade: e.target.value })} />
          <input type="number" placeholder="Pé-direito" value={medidas.altura} onChange={(e) => setMedidas({ ...medidas, altura: e.target.value })} />
        </div>

        <div className="cartao bom" style={{ marginTop: 14 }}>
          <h4>Desconto pela visita técnica evitada</h4>
          <p>Como você já tem a medida (pela planta ou digitada), a HomeHub não precisa enviar um técnico. O valor da medição profissional sai do orçamento.</p>
        </div>

        <div className="ctaFixo">
          <button className="btPrimario" disabled={!podeConfirmarComMedidas} onClick={confirmarComMedidas}>
            Confirmar medidas digitadas
          </button>
        </div>
      </AppFrame>
    );
  }

  // ---- caminho manual já confirmado: resumo, segue pro catálogo ----
  if (caminho === CAMINHOS.MANUAL && (app.origemMedida === "manual" || app.origemMedida === "planta")) {
    const m = app.medidaManual;
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="feito" /><i /><i /><i /></div>
        <h2 className="tituloTela">Medida confirmada <span className="tagCalc">{m ? "informada por você" : "pela planta enviada"}</span></h2>
        <div className="cartaoResumo">
          {m ? (
            <>
              <div className="linhaResumo total"><span>Largura</span><b>{m.largura} cm</b></div>
              {m.profundidade && <div className="linhaResumo"><span>Profundidade</span><b>{m.profundidade} cm</b></div>}
              {m.altura && <div className="linhaResumo"><span>Pé-direito</span><b>{m.altura} cm</b></div>}
            </>
          ) : (
            <div className="linhaResumo"><span>Planta baixa</span><b>Recebida</b></div>
          )}
        </div>
        <div className="cartao bom"><h4>Sem custo de visita técnica</h4>
          <p>O orçamento no próximo passo já sai sem a taxa de medição profissional. {!m && "As medidas exatas são confirmadas a partir da planta na validação técnica."}</p></div>
        <div className="ctaFixo">
          <button className="btPrimario" onClick={() => nav("/projeto-completo/escolha")}>Continuar</button>
          <button className="btSecundario" onClick={() => { app.setMedidaManual(null); app.setOrigemMedida(null); setMedidas({ largura: "", profundidade: "", altura: "" }); }}>Corrigir medida</button>
        </div>
      </AppFrame>
    );
  }

  // ---- caminho da foto com IA de visão ----
  return (
    <AppFrame titulo="Projeto Completo" voltar={() => setCaminho(CAMINHOS.ESCOLHA)} comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Fotografe o espaço</h2>

      {!app.analise && !carregando && !app.erroAnalise && (
        <>
          <p className="subtituloTela">Enquadre a parede inteira e inclua um objeto de tamanho conhecido para servir de escala.</p>
          {app.imagem && <img className="prevImg" src={app.imagem} alt="Foto enviada" />}
          <label className="soltaArquivo">
            <b>{app.imagem ? "Trocar foto" : "Enviar foto do ambiente"}</b>
            <span>Toque para escolher uma imagem</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onArquivo} />
          </label>
          <label className="rotuloSecao">Objeto de referência visível na foto</label>
          <select value={app.referencia.nome} onChange={(e) => app.setReferencia(REFERENCIAS.find((r) => r.nome === e.target.value))}>
            {REFERENCIAS.map((r) => <option key={r.nome}>{r.nome}</option>)}
          </select>
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!app.imagem} onClick={analisar}>Analisar ambiente</button>
            <button className="btSecundario" onClick={usarDemo}>Usar análise de demonstração</button>
          </div>
        </>
      )}

      {carregando && <div className="carregando"><div className="pulso" /><p>Analisando a imagem e estimando as dimensões</p></div>}

      {app.erroAnalise && !carregando && (
        <>
          <div className="cartao alerta"><h4>Não foi possível analisar</h4><p>{app.erroAnalise}</p></div>
          <div className="ctaFixo"><button className="btPrimario" onClick={usarDemo}>Usar análise de demonstração</button></div>
        </>
      )}

      {app.analise && !carregando && (
        <>
          <h3 className="secaoTitulo" style={{ marginTop: 0 }}>
            Ambiente medido {app.modoDemo ? <span className="tagCalc">demonstração</span> : <span className="tagIA">modelo de visão</span>}
          </h3>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Largura da parede</span><b>{app.analise.largura} cm</b></div>
            <div className="linhaResumo"><span>Pé-direito estimado</span><b>{app.analise.altura} cm</b></div>
            <div className="linhaResumo total"><span>Vão aproveitável</span><b>{app.analise.vao} cm</b></div>
          </div>
          <div className="cartao alerta"><h4>Precisão declarada</h4>
            <p>Confiança {app.analise.confianca}. Estimativa de ordem centimétrica, a medição profissional segue existindo na execução.</p></div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => nav("/projeto-completo/escolha")}>Continuar</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
