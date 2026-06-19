function normalizeText(value, maxLength = 12000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function buildExplainPrompt({
  question = "",
  options = [],
  selectedAnswer = "",
  correctAnswer = "",
  category = "",
  mode = "",
  topicSlug = "",
  existingExplanation = "",
}) {
  const optionLines = Array.isArray(options)
    ? options
        .map((opt, idx) => `${idx + 1}. ${normalizeText(opt, 500)}`)
        .join("\n")
    : "";

  const fields = [
    `Mode: ${normalizeText(mode, 80) || "Study"}`,
    `Category: ${normalizeText(category, 120) || "General"}`,
    topicSlug ? `Topic: ${normalizeText(topicSlug, 120)}` : "",
    "",
    `Question:\n${normalizeText(question, 4000)}`,
    optionLines ? `\nOptions:\n${optionLines}` : "",
    `\nUser answer: ${normalizeText(selectedAnswer, 500) || "Not answered yet"}`,
    `Correct answer: ${normalizeText(correctAnswer, 500) || "Not provided"}`,
    existingExplanation
      ? `\nExisting explanation from quiz:\n${normalizeText(existingExplanation, 2500)}`
      : "",
    "",
    "Task:",
    "1) Confirm whether the user answer is correct.",
    "2) Explain why in practical pharmacy terms.",
    "3) Give a short memory tip.",
    "4) Keep it concise and readable for students.",
    "5) Do not invent clinical facts when unsure.",
  ]
    .filter(Boolean)
    .join("\n");

  return fields;
}

function extractOpenAiText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const parts = [];
  output.forEach((entry) => {
    if (!Array.isArray(entry?.content)) return;
    entry.content.forEach((chunk) => {
      const text = String(chunk?.text || "").trim();
      if (text) parts.push(text);
    });
  });
  return parts.join("\n\n").trim();
}

function extractGeminiText(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const parts = [];
  candidates.forEach((candidate) => {
    const contentParts = Array.isArray(candidate?.content?.parts)
      ? candidate.content.parts
      : [];
    contentParts.forEach((part) => {
      const text = String(part?.text || "").trim();
      if (text) parts.push(text);
    });
  });
  return parts.join("\n\n").trim();
}

function extractOpenRouterText(data) {
  const choices = Array.isArray(data?.choices) ? data.choices : [];
  const first = choices[0];
  const content = first?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const text = content
      .map((part) =>
        typeof part?.text === "string"
          ? part.text
          : typeof part?.content === "string"
            ? part.content
          : typeof part === "string"
            ? part
            : "",
      )
      .filter(Boolean)
      .join("\n\n");
    return text.trim();
  }
  if (typeof first?.text === "string") {
    return first.text.trim();
  }
  return "";
}

async function fetchWithTimeout(url, options, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini({
  apiKey,
  model,
  prompt,
  maxOutputTokens,
  timeoutMs,
}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          maxOutputTokens,
        },
      }),
    },
    timeoutMs,
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = String(data?.error?.message || "Gemini request failed");
    throw new Error(message);
  }

  const answer = extractGeminiText(data);
  if (!answer) {
    throw new Error("Gemini returned an empty response");
  }

  return {
    provider: "gemini",
    model,
    answer,
  };
}

async function callOpenAi({
  apiKey,
  model,
  prompt,
  maxOutputTokens,
  timeoutMs,
}) {
  const response = await fetchWithTimeout(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are a strict pharmacy tutor. Be accurate, concise, and practical.",
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
        max_output_tokens: maxOutputTokens,
        temperature: 0.2,
      }),
    },
    timeoutMs,
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = String(data?.error?.message || "OpenAI request failed");
    throw new Error(message);
  }

  const answer = extractOpenAiText(data);
  if (!answer) {
    throw new Error("OpenAI returned an empty response");
  }

  return {
    provider: "openai",
    model,
    answer,
  };
}

async function callOpenRouter({
  apiKey,
  model,
  prompt,
  maxOutputTokens,
  timeoutMs,
}) {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const systemMessage =
    "You are a strict pharmacy tutor. Be accurate, concise, and practical.";

  async function callModel(targetModel) {
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: maxOutputTokens,
          temperature: 0.2,
        }),
      },
      timeoutMs,
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = String(
        data?.error?.message || data?.message || "OpenRouter request failed",
      );
      throw new Error(message);
    }

    const answer = extractOpenRouterText(data);
    return {
      answer,
      data,
    };
  }

  const modelsToTry = [
    model,
    "stepfun/step-3.5-flash:free",
    "openai/gpt-oss-120b:free",
    "z-ai/glm-4.5-air:free",
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  let lastMeta = {};
  for (const candidateModel of modelsToTry) {
    const result = await callModel(candidateModel);
    if (result.answer) {
      return {
        provider: "openrouter",
        model: candidateModel,
        answer: result.answer,
      };
    }
    const firstChoice = Array.isArray(result.data?.choices)
      ? result.data.choices[0]
      : null;
    lastMeta = {
      model: candidateModel,
      finishReason: firstChoice?.finish_reason || "",
    };
  }

  throw new Error(
    `OpenRouter returned an empty response (model=${lastMeta.model || model}, finish_reason=${lastMeta.finishReason || "unknown"})`,
  );
}

export async function generateAiExplanation({
  provider,
  apiKey,
  model,
  maxOutputTokens,
  timeoutMs,
  payload,
}) {
  if (!apiKey) {
    throw new Error(`${provider} API key is missing`);
  }

  const prompt = buildExplainPrompt(payload);

  if (provider === "gemini") {
    return callGemini({
      apiKey,
      model,
      prompt,
      maxOutputTokens,
      timeoutMs,
    });
  }

  if (provider === "openai") {
    return callOpenAi({
      apiKey,
      model,
      prompt,
      maxOutputTokens,
      timeoutMs,
    });
  }

  if (provider === "openrouter") {
    return callOpenRouter({
      apiKey,
      model,
      prompt,
      maxOutputTokens,
      timeoutMs,
    });
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
