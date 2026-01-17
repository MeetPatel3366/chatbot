import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const messages = [
  {
    role: "system",
    content: `You are a smart personal assistant.
    If you know the answer to a question, asnwer it directly in plain English.
    If the answer requires real-time, local, or up-to-date information, or if you don't know the answer, use teh available tools to find it.
    You have access to following tools:
    webSearch(query: string) Use this to search the internet for current or unknown information.
    Decide when to use your own knowledge and when to use the tool.
    Do not mention the tool unless needed.

    Example:
    Q: What is the capital of India?
    A: The capital of India is New Delhi.

    Q: What is teh weather in Mumbai right now?
    A: (use the search tool to find the latest weather)

    Q: Tell me the latest IT news.
    A: (use the search tool to get the latest news)
    
    Current Date And Time: ${new Date().toUTCString()}`,
  },
];

async function getGroqChatCompletion() {
  console.log(
    "-------------------------------------------------------------------------",
  );
  console.log("message sent: ", messages);
  console.log("message length: ", messages.length);

  return groq.chat.completions.create({
    temperature: 0,
    model: "llama-3.3-70b-versatile",
    messages: messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });
}

export async function generate(userMessage) {
  messages.push({
    role: "user",
    content: userMessage,
  });
  while (true) {
    //for llm loop for tools calling
    const chatCompletion = await getGroqChatCompletion();

    messages.push(chatCompletion?.choices[0]?.message); //assistant message

    // console.log(chatCompletion?.choices[0]?.message);
    // console.log(JSON.stringify(chatCompletion?.choices[0]?.message,null,2));

    const toolCalls = chatCompletion.choices[0].message.tool_calls;

    if (!toolCalls) {
      return `${chatCompletion?.choices[0]?.message.content}`; // Assistant message:
    }

    for (const tool of toolCalls) {
      console.log("tool: ", tool);
      const functionName = tool.function.name;
      const functionArguments = tool.function.arguments;

      if (functionName == "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionArguments));
        console.log("Tool result: ", toolResult);

        messages.push({
          tool_call_id: tool.id,
          role: "tool", //tool role use for sent result of tool,
          name: functionName,
          content: toolResult,
        }); //tool call result push in messages because next time when llm call so tool result exists in messages history
      }
    }
  }
}

async function webSearch({ query }) {
  console.log("calling webSearch");
  const response = await tvly.search(query);
  console.log("Response : ", response);

  const finalResult = response.results.map((r) => r.content).join("\n\n");
  console.log("Final Result : ", finalResult);

  return finalResult;
}
