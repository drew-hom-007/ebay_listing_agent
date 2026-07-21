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
} 

import process from "process";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const imageData = fs.readFileSync("/Users/drewhom007/screen shots/chineseguy.jpeg", { encoding: "base64" });
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

const conversation = [{
  role: "user",
  parts: [
    { text: "How many main objects do you see in this image? Then roll a die with that many sides." },
    { inlineData: { mimeType: "image/jpeg", data: imageData } },
  ],
}];
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
}*/
import { Buffer } from "buffer";
import process from "process";
import "dotenv/config";

const credentials = `${process.env.EBAY_PROD_CLIENT_ID}:${process.env.EBAY_PROD_CLIENT_SECRET}`;
const encodedCredentials = Buffer.from(credentials).toString("base64");

const body = new URLSearchParams({
  grant_type: "client_credentials",
  scope: "https://api.ebay.com/oauth/api_scope",
});

const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${encodedCredentials}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: body,
});

const data = await response.json();

const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
url.searchParams.set("q", "Patagonia fleece jacket");

const searchResponse = await fetch(url, {
  headers: {
    Authorization: `Bearer ${data.access_token}`,
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
  },
});

const searchData = await searchResponse.json();
console.log(searchData);