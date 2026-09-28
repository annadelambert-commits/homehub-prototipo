// Netlify Function: /api/assistente
//
// Dois modos, um só endpoint, para reduzir duplicação:
//   modo "concierge" — transforma a intenção do cliente em briefing estruturado (Descoberta)
//   modo "suporte"   — responde dúvidas técnicas do catálogo (Suporte especializado, não monetizado)
//
// A chave de API fica só aqui, no servidor. Configure ANTHROPIC_API_KEY nas variáveis de
// ambiente do site no painel da Netlify.

const PROMPT_CONCIERGE = `Você é o concierge de reforma da HomeHub. O cliente descreve em linguagem natural o
que quer reformar. Extraia um briefing estruturado.

Responda SOMENTE com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois, no formato:
{"ambiente":"texto curto","orcamento":<numero em reais, ou null se não informado>,"estilo":"texto curto ou null",
"prazo_dias":<numero ou null>,"prioridade":"texto curto ou null","resumo":"uma frase natural confirmando o que entendeu, em português, para mostrar ao cliente"}

Se o cliente não mencionar orçamento, estilo ou prazo, use null nesses campos — não invente valores.
O campo "ambiente" deve ser o nome do cômodo ou espaço (ex.: "cozinha", "banheiro", "quarto").`;

const PROMPT_SUPORTE = `Você é o assistente de suporte especializado da HomeHub, uma rede de produtos para casa,
decoração e reforma. Responda dúvidas técnicas objetivas sobre produtos, instalação, compatibilidade e prazos,
em português, em no máximo 3 frases curtas.

Você NUNCA decide ou confirma: aprovação de crédito, preço final de contrato, homologação de executor
certificado, ou emissão de garantia contratual — se perguntarem sobre isso, explique que essa decisão passa
pela equipe responsável, não pela IA.

Responda apenas em texto simples, sem markdown, sem JSON.`;

const PROMPT_DESIGN = `Você é o designer de interiores da HomeHub, que trabalha com uma IA de geração de imagem.
O cliente escolheu um estilo e uma paleta de cores para reformar um ambiente. Você recebe o ambiente, o estilo e
a paleta, e descreve de forma inspiradora, curta e concreta como ficará o ambiente reformado.

Responda SOMENTE com um objeto JSON válido, sem markdown, sem crases, no formato:
{"resumo":"2-3 frases descrevendo o ambiente reformado no estilo e paleta escolhidos, mencionando materiais e clima",
"destaques":["3 a 4 elementos de destaque do projeto, frases curtas"]}`;

const PROMPT_EXPANSAO = `Você é o analista interno da HomeHub responsável por recomendar a próxima região de
expansão do programa "Reforma em Etapas", na Fase 2 do roadmap (depois do piloto no Sudeste). Você recebe uma
lista de regiões candidatas, cada uma com: clientes potenciais na base, ticket médio local, número de
executores certificados já disponíveis na região, e nota média de satisfação (NPS-like, de 0 a 10).

Analise as regiões e recomende UMA como prioridade, considerando o conjunto dos quatro fatores — não apenas o
maior número isolado. Regiões com poucos executores certificados representam risco operacional mesmo com
clientes potenciais, e ticket médio alto vale menos se a satisfação for baixa.

Responda SOMENTE com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois, no formato:
{"recomendada":"nome exato da região como veio na lista","raciocinio":"2-3 frases em português explicando por
que essa região, citando os números que pesaram a favor e algum risco a monitorar",
"alternativas":[{"regiao":"nome","motivo":"uma frase curta do motivo de ter ficado atrás"}]}
O array "alternativas" deve ter exatamente 2 itens, as duas próximas melhores opções.`;

const PROMPT_EXECUTIVO = `Você é a IA executiva interna da HomeHub, uma rede de produtos para casa, decoração e reforma.
Responde perguntas livres do time interno sobre o negócio (números, regiões, funil de Reforma em Etapas, priorização),
usando os dados de contexto fornecidos. Seja direto e objetivo, em português, em no máximo 5 frases.

Se a pergunta pedir algo que os dados de contexto não cobrem, diga isso claramente em vez de inventar números.
Você não substitui relatórios financeiros formais nem decide sozinha ações de negócio, apenas apoia a análise.

Responda apenas em texto simples, sem markdown, sem JSON.`;

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

  const { modo, mensagem, historico, regioes, contexto } = payload;
  if (!modo) {
    return { statusCode: 400, body: JSON.stringify({ erro: "Falta o campo: modo." }) };
  }
  if (modo !== "expansao" && !mensagem) {
    return { statusCode: 400, body: JSON.stringify({ erro: "Falta o campo: mensagem." }) };
  }
  if (modo === "expansao" && (!Array.isArray(regioes) || regioes.length === 0)) {
    return { statusCode: 400, body: JSON.stringify({ erro: "Falta o campo: regioes (array não vazio)." }) };
  }

  const systemPrompt = modo === "concierge" ? PROMPT_CONCIERGE
    : modo === "expansao" ? PROMPT_EXPANSAO
    : modo === "design" ? PROMPT_DESIGN
    : modo === "executivo" ? PROMPT_EXECUTIVO + (contexto ? `\n\nDados internos disponíveis:\n${contexto}` : "")
    : PROMPT_SUPORTE;
  const messages = modo === "expansao"
    ? [{ role: "user", content: JSON.stringify(regioes) }]
    : [...(Array.isArray(historico) ? historico.slice(-6) : []), { role: "user", content: mensagem }];

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
        max_tokens: 500,
        system: systemPrompt,
        messages,
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
      .trim();

    if (modo === "concierge" || modo === "expansao" || modo === "design") {
      const limpo = texto.replace(/```json/g, "").replace(/```/g, "").trim();
      const ini = limpo.indexOf("{");
      const fim = limpo.lastIndexOf("}");
      if (ini < 0 || fim < 0) {
        return { statusCode: 502, body: JSON.stringify({ erro: "A resposta do modelo não veio no formato esperado.", bruto: limpo }) };
      }
      const objeto = JSON.parse(limpo.slice(ini, fim + 1));
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(objeto) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resposta: texto }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: "Falha ao chamar o modelo.", detalhe: e.message }) };
  }
};
