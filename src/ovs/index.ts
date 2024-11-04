// Vite 插件
import {createFilter, Plugin} from "vite"
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import {es6Tokens} from '../../../subhuti/src/syntax/es6/Es6Tokens.ts'
import SubhutiCst from "../../../subhuti/src/struct/SubhutiCst.ts";
import JsonUtil from "../../../subhuti/src/utils/JsonUtil.ts";
import OvsParser from "./parser/OvsParser.ts";
import SubhutiLChaining from "subhuti/src/struct/SubhutiLChaining.ts";
import SubhutiToAstUtil from "subhuti/src/parser/SubhutiToAstUtil.ts";

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

function transToAst(cst: SubhutiCst) {
    const ast = SubhutiToAstUtil.createProgramAst(cst)
    JsonUtil.log(ast)
}

export function vitePluginOvsTransform(code) {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    const parser = new OvsParser(tokens)

    let code1 = null
    parser.Program().match((curCst: SubhutiCst): SubhutiLChaining => {
        JsonUtil.log(traverseClearTokens(curCst))
        console.log(2313123)
        const ast = SubhutiToAstUtil.createProgramAst(curCst)
        JsonUtil.log(ast)
        // code1 = parser.exec()
        // console.log(code1)
        // const mapping = new OvsMappingParser()
        // mapping.openMappingMode(curCst)
        // code1 = mapping.exec(curCst)
        // console.log(code1)
        return null
    })
    return `
    import OvsAPI from "@/ovs/OvsAPI.ts";\n
    ${code1}
    `
}

const code = `let a = div{
            header = div{123},
            456
        }
`
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
