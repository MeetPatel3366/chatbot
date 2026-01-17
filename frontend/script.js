const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chat-container");
const askBtn = document.querySelector("#ask");

input.addEventListener("keyup", handleEnter);
askBtn.addEventListener("click", handleAsk);

const PORT = 3001;

const loading = document.createElement("div");
loading.className = "my-6 animate-pulse";
loading.textContent = "Thinking...";

async function generate(text) {
  /**
   *  1.append message to ui
   *  2.send it to the LLM
   *  3.Append resppnse to the ui
   */

  const msgElem = document.createElement("div");
  msgElem.className = "my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit";
  msgElem.textContent = text;
  chatContainer.appendChild(msgElem);
  input.value = "";

  chatContainer.appendChild(loading);

  //call server
  const assistantMessage = await callServer(text);
  console.log("Assistant Message: ", assistantMessage);

  const assistantMsgElem = document.createElement("div");
  assistantMsgElem.className = "max-w-fit";
  assistantMsgElem.textContent = assistantMessage;

  loading.remove();
  chatContainer.appendChild(assistantMsgElem);

  assistantMsgElem.textContent = "";
  typeWriter(assistantMsgElem, assistantMessage);
}

async function callServer(inputText) {
  const response = await fetch(`http://localhost:${PORT}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      userMessage: inputText,
    }),
  });

  if (!response.ok) {
    throw new Error("Error generating the response");
  }

  const result = await response.json();

  return result.message;
}

async function handleAsk(e) {
  const text = input?.value.trim();
  if (!text) {
    return;
  }
  console.log(text);

  await generate(text);
}

async function handleEnter(e) {
  if (e.key == "Enter") {
    console.log(e);
    const text = input?.value.trim();
    if (!text) {
      return;
    }
    console.log(text);

    await generate(text);
  }
}

function typeWriter(element, text, speed = 20) {
  let index = 0;

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  type();
}
