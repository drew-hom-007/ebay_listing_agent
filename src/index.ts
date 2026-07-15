import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const questions = ["What's 17 * 24?", "Now multiply that by 2", "Now add 100"];
const conversation: any[] = [];

let i = 0;
while (i < questions.length) {
  const userTurn = { role: "user", parts: [{ text: questions[i] }] };
  conversation.push(userTurn);

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: conversation,
  });

  console.log(response.text);

  const modelTurn = { role: "model", parts: [{ text: response.text }] };
  conversation.push(modelTurn);

  i++;
}