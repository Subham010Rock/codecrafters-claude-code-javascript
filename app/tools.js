import fs  from 'fs';
import path from 'path';

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