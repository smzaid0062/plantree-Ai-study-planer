// import OpenAI from "openai";

// let client = null;

// const getClient = () => {
//   if (!client) {
//     client = new OpenAI({
//       baseURL: "https://openrouter.ai/api/v1",
//       apiKey: process.env.OPENROUTER_API_KEY,
//     });
//   }
//   return client;
// };

// export const generateAIResponse = async (prompt) => {
//   const openai = getClient();
//   const response = await openai.chat.completions.create({
//     model: "nvidia/nemotron-3-ultra-550b-a55b:free",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.3,
//     max_tokens: 4000,
//   });
//   return response.choices[0].message.content;
// };

// export default getClient;

import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const generateAIResponse = async (prompt) => {
  try {
    const completion = await openrouter.chat.send({
      chatRequest: {
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 2500,
        stream: false,
        // --- ADD THIS BLOCK ---
        plugins: [
          {
            id: "web",
            max_results: 6 // Fetch top 6 results to match your requirement
          }
        ]
      }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned an empty response.");
    return content;
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    throw error;
  }
};