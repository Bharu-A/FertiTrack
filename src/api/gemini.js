import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchFertilizerByName } from "./firebaseQueries"; 

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getSmartReply(userMessage) {
  try {
    // 1. Extract fertilizer name using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const extract = await model.generateContent(`
      Extract the fertilizer name or query from this message:
      "${userMessage}"
      Only respond with the keyword. Nothing else.
    `);

    const keyword = extract.response
  .text()
  .replace(/[^a-zA-Z0-9 ]/g, "")
  .trim()
  .toLowerCase();


    // 2. Search Firebase for fertilizer
    const results = await searchFertilizerByName(keyword);

    // 3. If nothing found → fallback response
    if (results.length === 0) {
      return "I couldn't find that fertilizer in our shop database. Please try another name.";
    }

    // 4. Build context for Gemini
    const context = JSON.stringify(results, null, 2);

    const response = await model.generateContent(`
      Using this fertilizer data:
      ${context}

      Answer the farmer politely.
      Include:
      - Price
      - Stock
      - Shop name
      - Suggest alternatives if available
    `);

    return response.response.text();

  } catch (error) {
    console.error(error);
    return "Error fetching details right now.";
  }
}
