import * as fs from 'fs'
import * as path from 'path'
import {fileURLToPath} from "url";
import {LogUtil} from "../logutil.ts";
import {ovsToAstUtil} from "../ovs/factory/OvsToAstUtil.ts";
import {EsTreeAstType} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";
import {CompletionItem, CompletionItemKind} from "vscode-languageserver/node";
import Es6Parser from "subhuti-ts/src/language/es2015/Es6Parser.ts";
import JsonUtil from "subhuti/src/utils/JsonUtil.ts";

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


// const a = 'file:///c%3A/Users/qinkaiyuan/IdeaProjects/testovsplg1'
const a = 'file:///c%3A/Users/qinky/IdeaProjects/testovslsp1'

const res = initCompletionMap(a)

console.log(res)

export function initCompletionMap(filePath: string) {
    const files = FileUtil.getAllFiles(filePath);
    let completionItemAry: CompletionItem[] = []
    try {
        for (const file of files) {
            LogUtil.log(file)
            const fileCode = FileUtil.readFileContent(file)
            LogUtil.log(fileCode)
            const ast = ovsToAstUtil.toAst(fileCode)
            JsonUtil.log(ast)
            if (ast.sourceType === 'module') {
                for (const bodyElement of ast.body) {
                    LogUtil.log('474444')
                    LogUtil.log(ast)
                    LogUtil.log(ast.body)
                    // LogUtil.log(bodyElement)
                    // LogUtil.log(bodyElement.type)
                    LogUtil.log('6666')
                    if (bodyElement.type === EsTreeAstType.ExportDefaultDeclaration) {
                        if (bodyElement.declaration.type === Es6Parser.prototype.ClassDeclaration) {
                            const item: CompletionItem = {
                                label: bodyElement.declaration.id.name,
                                kind: CompletionItemKind.Class,
                                detail: 'detailItem',
                                labelDetails: {
                                    detail: 'detail',
                                    description: 'description'
                                },
                                data: {
                                    label: bodyElement.declaration.id.name,
                                    type: CompletionItemKind.Class,
                                    file: file,
                                    default: !!bodyElement.default,
                                }
                            }
                            completionItemAry.push(item)
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e)
        LogUtil.log('jinrulecuowurizhi')
    }
    return completionItemAry
}
