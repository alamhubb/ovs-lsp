// Vite 插件
import {createFilter, Plugin} from "vite"
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import {es6Tokens} from 'subhuti-ts/src/language/es2015/Es6Tokens.ts'
import SubhutiCst from "../../../subhuti/src/struct/SubhutiCst.ts";
import JsonUtil from "../../../subhuti/src/utils/JsonUtil.ts";
import OvsParser from "./parser/OvsParser.ts";
import SubhutiToAstUtil, {es6CstToEstreeAstUtil} from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";
import {OvsToAstUtil} from "./factory/OvsToAstUtil.ts";
import {TokenProvider} from "../IntellijTokenUtil.ts";
import Es6CstToEstreeAstUtil from "subhuti-ts/src/language/es2015/Es6CstToEstreeAstUtil.ts";

function traverseClearTokens(currentNode: SubhutiCst) {
    if (!currentNode || !currentNode.children || !currentNode.children.length)
        return
    // 将当前节点添加到 Map 中
    // 递归遍历子节点
    if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(child => traverseClearTokens(child))
    }
    currentNode.tokens = undefined
    return currentNode
}

export function vitePluginOvsTransform(code) {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    const parser = new OvsParser(tokens)

    let code1 = null
    let curCst = parser.Program()
    curCst = traverseClearTokens(curCst)
    // JsonUtil.log(curCst)
    console.log(111231)
    // JsonUtil.log(curCst)
    //cst转 estree ast
    const ast = es6CstToEstreeAstUtil.createProgramAst(curCst)
    JsonUtil.log(ast)
    // console.log(456465)
    //ast to client ast
    // TokenProvider.visitNode(ast)
    // JsonUtil.log(TokenProvider.tokens)


    // code1 = parser.exec()
    // console.log(code1)
    // const mapping = new OvsMappingParser()
    // mapping.openMappingMode(curCst)
    // code1 = mapping.exec(curCst)
    // console.log(code1)
    return `
    import OvsAPI from "@/ovs/OvsAPI.ts";\n
    ${code1}
    `
}
const code = `export default class Testa {
    static print11(abc) {
        console.log(true)
    }
}




`
// const code = `let a = div{
//             header = div{123},
//             true
//         }
// `
const res = vitePluginOvsTransform(code)


export default function vitePluginOvs(): Plugin {
    const filter = createFilter(
        /\.ovs$/,
        null,
    )
    // @ts-ignore
    return {
        enforce: 'pre',
        transform(code, id) {
            if (!filter(id)) {
                return
            }
            code = vitePluginOvsTransform(code)

            return code
        }
    }
}
