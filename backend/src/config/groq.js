import Groq from "groq-sdk";

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

export const generateAIResponse = async (prompt) => {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4000,
  });
  return response.choices[0].message.content;
};

export default getGroqClient;