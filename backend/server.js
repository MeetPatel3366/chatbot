import express from "express";
import { generate } from "./chatbot.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to ChatBot");
});

app.post("/chat", async (req, res) => {
  const { userMessage } = req.body;
  console.log("user message: ", userMessage);
  if (!userMessage) {
    return res.status(400).json({
      success: false,
      message: "Enter message",
    });
  }
  const result = await generate(userMessage);
  res.json({
    success: true,
    message: result,
  });
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
