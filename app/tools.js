import fs  from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { stderr, stdout } from 'process';

function getFilePathByName(parentPath,filePath){
    let currDir = path.resolve(parentPath);
    while(true){
        if(fs.existsSync(path.join(currDir,filePath))){
            return path.join(currDir,filePath);
        }else{
            if(path.dirname(currDir)==currDir){
                return;
            }
           currDir = path.dirname(currDir);
        }
    }
}
export function Read(filePath){
    const file_path = getFilePathByName(process.cwd(),filePath)
    const fileContent = fs.readFileSync(file_path,'utf-8');
    return fileContent;
}

export function Write(filePath,content){
    const directory_path = getFilePathByName("",path.dirname(filePath));
    const file_path = path.join(directory_path,path.basename(filePath));
    fs.writeFileSync(file_path,content,{flag:'w'});
    return "created the file";
}

export function Bash(command){
    // command = getCommandWithAbsolutePath(command);
    return new Promise((resolve,reject)=>{
        exec(command, (error,stdout,stderr)=>{
        if(error){
            reject(error);
        }
        if(stderr){
            resolve(stderr)
        }
        resolve(stdout);
    });
    })
}

function getCommandWithAbsolutePath(commandString){
    const commandArray = commandString.split(" ");
    const fileName = commandArray[commandArray.length-1];
    const filePath = getFilePathByName("",fileName);
    commandArray[commandArray.length-1]=filePath;
    return commandArray.join(" ");

}

export const toolSchema = new Map();

toolSchema.set('Write',{
    type:"function",
    function:{
        name:'Write',
        description:"Write content to a file",
        parameters: {
            type: "object",
            required: ["file_path", "content"],
            properties:{
                file_path:{
                    type:"string",
                    description:"The path of the file to write to"
                },
                content:{
                    type:"string",
                    description:"The content to write to the file"
                }
            }
        }
    }
});

toolSchema.set('Read',{
    type: "function", 
    function: {
        name: "Read", 
        description: "Read and return the contents of a file.", 
        parameters: {
            type: "object", 
            properties: {
                path: {
                    type: "string", 
                    description: "The path to the file to read."
                }
            }, 
            required: ["path"]
        }
    }
})

toolSchema.set('Bash',{
    type:"function",
    function:{
        name:'Bash',
        description:"Execute a shell command",
        parameters:{
            type:"object",
            required:["command"],
            properties:{
                command:{
                    type:"string",
                    description:"command to execute"
                }
            }
        }
    }
})