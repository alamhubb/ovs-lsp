import * as fs from 'fs'
import * as path from 'path'
import {fileURLToPath} from "url";
import OvsToAstHandler from "../ovs/factory/OvsToAstUtil.ts";
import {ClassDeclaration} from "subhuti/src/struct/SubhutiEs6Ast.ts";
import {LogUtil} from "../logutil.ts";

export class FileUtil {
    // 读取文件内容
    static readFileContent(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return '';
        }
    }


    static getAllFiles(dirPathUrl: string, extensions: string[] = ['.js', '.ts', '.ovs']): string[] {
        let results: string[] = []
        try {
            const dirPath = dirPathUrl.startsWith('file://')
                ? fileURLToPath(dirPathUrl)
                : dirPathUrl
            const files = fs.readdirSync(dirPath)

            for (const file of files) {
                const filePath = path.join(dirPath, file)
                const stat = fs.statSync(filePath)

                if (stat.isDirectory()) {
                    // 递归获取子目录的文件
                    results = results.concat(this.getAllFiles(filePath, extensions))
                } else {
                    // 检查文件扩展名
                    const ext = path.extname(file)
                    if (extensions.includes(ext)) {
                        results.push(filePath)
                    }
                }
            }
        } catch (error) {
            console.error('Error reading directory:', error)
            LogUtil.log(error)
        }

        return results
    }
}

const a = FileUtil.getAllFiles('file:///c%3A/Users/qinkaiyuan/IdeaProjects/testovsplg1')

for (const file of a) {
    console.log(file)
    const fileCode = FileUtil.readFileContent(file)
    console.log(fileCode)
    const ast = OvsToAstHandler.toAst(fileCode)
    if (ast.sourceType === 'module') {
        for (const bodyElement of ast.body) {
            if (bodyElement.type === 'ExportDeclaration') {
                if (bodyElement.declaration.type === 'ClassDeclaration') {
                    console.log(bodyElement.declaration.id.name)
                }
            }
        }
    }
}
