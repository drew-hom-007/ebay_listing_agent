/*import "dotenv/config";
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
} */

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const rollDiceDeclaration = {
  name: "rollDice",
  description: "Rolls a die with a given number of sides and returns the result.",
  parameters: {
    type: "OBJECT",
    properties: {
      sides: { type: "NUMBER", description: "Number of sides on the die" },
    },
    required: ["sides"],
  },
};
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: "Roll a 20-sided die for me.",
  config: {
    tools: [{ functionDeclarations: [rollDiceDeclaration] }],
  },
});

function rollDice(sides: number): number {
  // do something
  return Math.floor(Math.random() * sides) + 1;
}
const diceResult = rollDice(response.functionCalls[0].args.sides);
const functionResponsePart = {
  role: "user",
  parts: [{
    functionResponse: {
      name: response.functionCalls[0].name,     // hint: comes from response.functionCalls[0]
      response: { result: diceResult },  // hint: the value from step 1
      id: response.functionCalls[0].id,       // hint: also from response.functionCalls[0]
    },
  }],
};
const conversation = [
  { role: "user", parts: [{ text: "Roll a 20-sided die for me." }] },
  response.candidates[0].content,
  functionResponsePart,
];

const secondResponse = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: conversation,
  config: {
    tools: [{ functionDeclarations: [rollDiceDeclaration] }],
  },
});

console.log(secondResponse.text);