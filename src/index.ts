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

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

const flipCoinDeclaration = {
  name: "flipCoin",
  description: "Flips a coin and returns the result.",
  parameters: {
    type: "OBJECT",
    properties: {},
    required: [],
  },
};

function flipCoin(): string {
  return Math.random() < 0.5 ? "heads" : "tails";
}

const conversation = [{ role: "user", parts: [{ text: "Roll a 20-sided die for me."}] }];
let done = false;

while (!done) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: conversation,
    config: {
      tools: [{ functionDeclarations: [rollDiceDeclaration, flipCoinDeclaration] }],
    },
  });

  conversation.push(response.candidates[0].content);

  if (response.functionCalls && response.functionCalls.length > 0) {
    const calledTool = response.functionCalls[0].name;
    let result;

    if (calledTool === "rollDice") {
      result = rollDice(response.functionCalls[0].args.sides);
    } else if (calledTool === "flipCoin") {
      result = flipCoin();
    }

    const functionResponsePart = {
      role: "user",
      parts: [{
        functionResponse: {
          name: calledTool,
          response: { result: result },
          id: response.functionCalls[0].id,
        },
      }],
    };

    conversation.push(functionResponsePart);
  } else {
    console.log(response.text);
    done = true;
  }
}