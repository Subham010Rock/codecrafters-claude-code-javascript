import OpenAI from "openai";
import {Read,Write,toolSchema,Bash} from "./tools.js";
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

  const messages =  [{ role: "user", content: prompt }]
  const tools = [toolSchema.get('Read'),toolSchema.get('Write'),toolSchema.get('Bash')];
  let  response = await client.chat.completions.create({
    model: "anthropic/claude-haiku-4.5",
    messages,
    tools,
  });
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  while (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
    messages.push(response.choices[0].message);
  response.choices[0].message.tool_calls?.forEach(async (tool) => {
    if (tool.type === "function" && tool.function.name === "Read") {
      const path = JSON.parse(tool.function.arguments).path;
      const content = Read(path);
     messages.push(
      {role: "tool", tool_call_id:tool.id,name: tool.function.name, content}
     )
    }else if(tool.type === "function" && tool.function.name === "Write"){
      const toolParams = JSON.parse(tool.function.arguments);
      const path = toolParams.file_path;
      const content = toolParams.content;
      const result = Write(path,content);
      messages.push({
        role:'tool',
        name:tool.function.name,
        tool_call_id:tool.id,
        content:result
      })
    }
    else if(tool.type === "function" && tool.function.name === "Bash"){
      const command = JSON.parse(tool.function.arguments).command;
      const message = {
        role:'tool',
        name:tool.function.name,
        tool_call_id:tool.id,
      }
      try{
        const result = execSync(command,{encoding:'utf-8',stdio:'pipe'});
        messages.push({...message,content:result});
      }catch(error){
        const stderr = error.stderr?.toString() || error.message;
        messages.push({...message,content:stderr});
      }
    }
  });
     response = await client.chat.completions.create({
    model: "anthropic/claude-haiku-4.5",
    messages,
    tools: [toolSchema.get('Read'),toolSchema.get('Write'),toolSchema.get('Bash')],
  })
}

  // TODO: Uncomment the lines below to pass the first stage
  console.log(response.choices[0].message.content);

}

main();
