import { useState } from "react";
import { useApp } from "../contexto/AppState";

export default function SuporteBotao() {
  const app = useApp();
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!texto.trim()) return;
    const minhaMsg = { role: "user", content: texto.trim() };
    const historico = app.suporteMsgs.map((m) => ({ role: m.role, content: m.content }));
    app.setSuporteMsgs((m) => [...m, { role: "user", content: texto.trim() }]);
    setTexto(""); setCarregando(true); app.setSuporteErro(null);
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "suporte", mensagem: minhaMsg.content, historico }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      app.setSuporteMsgs((m) => [...m, { role: "assistant", content: dados.resposta }]);
    } catch {
      app.setSuporteErro("Não foi possível falar com o suporte agora. Verifique a configuração de ANTHROPIC_API_KEY.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <button className="suporteFAB" onClick={() => app.setSuporteAberto(true)} type="button"
        aria-label="Abrir suporte especializado">?</button>
      {app.suporteAberto && (
        <div className="suporteModal" role="dialog" aria-label="Suporte especializado">
          <div className="suporteCartao">
            <div className="suporteTopo">
              <div><b>Suporte especializado</b><span className="suporteTag">extra · não entra na conversão</span></div>
              <button className="suporteFechar" onClick={() => app.setSuporteAberto(false)} type="button">✕</button>
            </div>
            <div className="suporteCorpo">
              {app.suporteMsgs.length === 0 && (
                <p className="suporteVazio">Pergunte sobre instalação, compatibilidade ou prazos.</p>
              )}
              {app.suporteMsgs.map((m, i) => (
                <div key={i} className={"suporteMsg " + (m.role === "user" ? "eu" : "ia")}>{m.content}</div>
              ))}
              {carregando && <div className="suporteMsg ia">Digitando…</div>}
              {app.suporteErro && <div className="suporteMsg erro">{app.suporteErro}</div>}
            </div>
            <div className="suportePe">
              <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Ex.: esse piso pode ir sobre o existente?" />
              <button onClick={enviar} type="button" disabled={carregando}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
