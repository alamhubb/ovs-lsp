// Vite 插件
import {createFilter, Plugin} from "vite"
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import {es6Tokens} from 'subhuti-ts/src/language/es2015/Es6Tokens.ts'
import SubhutiCst from "../../../subhuti/src/struct/SubhutiCst.ts";
import JsonUtil from "../../../subhuti/src/utils/JsonUtil.ts";
import OvsParser from "./parser/OvsParser.ts";
import {ovsToAstUtil} from "./factory/Es6CstToOvsAstUtil.ts";
import {TokenProvider} from "../IntellijTokenUtil.ts";
import OvsAPI from "./OvsAPI.ts";
import generate from "@babel/generator";

export function traverseClearTokens(currentNode: SubhutiCst) {
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

export function traverseClearLoc(currentNode: SubhutiCst) {
    currentNode.loc = undefined
    if (!currentNode || !currentNode.children || !currentNode.children.length)
        return
    // 将当前节点添加到 Map 中
    // 递归遍历子节点
    if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(child => traverseClearLoc(child))
    }
    currentNode.loc = undefined
    return currentNode
}

export function vitePluginOvsTransform(code) {
    console.log(code)
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    if (!tokens.length) return code
    const parser = new OvsParser(tokens)

    console.log(tokens)
    let code1 = null
    let curCst = parser.Program()
    // JsonUtil.log(7777)
    curCst = traverseClearTokens(curCst)
    curCst = traverseClearLoc(curCst)
    // JsonUtil.log(curCst)
    console.log(111231)
    // JsonUtil.log(curCst)
    //cst转 estree ast
    const ast = ovsToAstUtil.createProgramAst(curCst)
    JsonUtil.log(ast)
    console.log(123123)
    console.log(generate.default)
    console.log(56465)
    code1 = generate.default(ast).code
    if (code1) {
        code1 = removeSemicolons(code1)
    }

    function removeSemicolons(code) {
        console.log(code)
        // 按行分割，处理每行，然后重新组合
        return code.replace(/;$/gm, '')
    }

    console.log(656555)
    console.log(code1)
    //ast to client ast
    // TokenProvider.visitNode(ast)
    // JsonUtil.log(TokenProvider.tokens)
    // OvsAPI.createVNode('div', 123)

    // code1 = parser.exec()
    // console.log(code1)
    // const mapping = new OvsMappingParser()
    // mapping.openMappingMode(curCst)
    // code1 = mapping.exec(curCst)
    // console.log(code1)
    return `${code1}`
    /*    return `
        // import OvsAPI from "@/ovs/OvsAPI.ts";\n
        ${code1.code}
        `*/
}

const code = `let c1 = 123
let c2 = c1
let c3 = c2
let c4 = c3
let c5 = c4
let c6 = c5
let c7 = c6
let c8 = c7
let c9 = c8
let c10 = c9
let c11 = c10

Tes
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
