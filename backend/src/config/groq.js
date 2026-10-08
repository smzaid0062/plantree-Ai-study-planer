import OpenAI from "openai";

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return client;
};

export const generateAIResponse = async (prompt) => {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4000,
  });
  return response.choices[0].message.content;
};

export default getClient;