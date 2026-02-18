import OpenAI from "openai";
import fs from "fs";
import path from "path";
async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const response = await client.chat.completions.create({
    model: "anthropic/claude-haiku-4.5",
    messages: [{ role: "user", content: prompt }],
    tools: [{type: "function", function: {name: "READ", description: "Read and return the contents of a file.", parameters: {type: "object", properties: {path: {type: "string", description: "The path to the file to read."}}, required: ["path"]}}}],
  });

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  response.choices[0].message.tool_calls?.forEach((tool) => {
    if (tool.type === "function" && tool.function.name === "READ") {
     const filePath = path.join(process.cwd(), JSON.parse(tool.function.arguments).path);
     const fileContent = fs.readFileSync(filePath, "utf-8");
     process.stdout.write(fileContent.trim());
    }});
    
  // TODO: Uncomment the lines below to pass the first stage
  console.log(response.choices[0].message.content);

}

main();
