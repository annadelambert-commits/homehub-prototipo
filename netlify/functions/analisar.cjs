// Netlify Function: /api/analisar (redirecionada de /.netlify/functions/analisar via netlify.toml)
//
// Recebe uma imagem em base64 e um objeto de referência, chama o modelo de visão da Anthropic
// e devolve a estimativa de medidas em JSON. A chave de API fica só aqui, no servidor —
// nunca é enviada ao navegador. Configure ANTHROPIC_API_KEY nas variáveis de ambiente do site
// no painel da Netlify (Site settings → Environment variables).

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido, use POST." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: "ANTHROPIC_API_KEY não está configurada nas variáveis de ambiente do site." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ erro: "Corpo da requisição não é um JSON válido." }) };
  }

  const { imagem, mime, referenciaNome, referenciaCm } = payload;
  if (!imagem || !referenciaNome || !referenciaCm) {
    return { statusCode: 400, body: JSON.stringify({ erro: "Faltam campos: imagem, referenciaNome ou referenciaCm." }) };
  }

  const prompt = `Você é um assistente de medição de ambientes. Analise a foto e estime as dimensões em centímetros, usando como escala o seguinte objeto de referência visível na imagem: ${referenciaNome}, cuja medida real é ${referenciaCm} cm.

Responda SOMENTE com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois, no formato:
{"largura":<numero>,"altura":<numero>,"profundidade":<numero>,"vao":<numero>,"confianca":"alta|média|baixa","obstrucoes":["texto","texto"],"observacao":"texto curto"}

Onde: largura é a extensão horizontal da parede principal; altura é o pé-direito estimado; profundidade é o espaço livre à frente da parede; vao é a largura contínua realmente aproveitável para instalar um móvel, já descontando obstruções como portas, janelas, rodapés e tomadas. Liste as obstruções que encontrar. Se a imagem não permitir estimativa confiável, use confianca baixa e explique na observacao.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mime || "image/jpeg", data: imagem } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    if (!resp.ok) {
      const texto = await resp.text().catch(() => "");
      return { statusCode: resp.status, body: JSON.stringify({ erro: `A API da Anthropic retornou ${resp.status}.`, detalhe: texto }) };
    }

    const dados = await resp.json();
    const texto = (dados.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const ini = texto.indexOf("{");
    const fim = texto.lastIndexOf("}");
    if (ini < 0 || fim < 0) {
      return { statusCode: 502, body: JSON.stringify({ erro: "A resposta do modelo não veio no formato esperado.", bruto: texto }) };
    }

    const analise = JSON.parse(texto.slice(ini, fim + 1));
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(analise) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: "Falha ao chamar o modelo de visão.", detalhe: e.message }) };
  }
};
