import {OvsAstProgram} from "../interface/OvsInterface";
import {BaseNode} from "estree";
import OvsParser from "../parser/OvsParser.ts";

export default class OvsAstToEstreeAstUtil {
    static toEstreeAst(program: OvsAstProgram) {

    }

    static createNodeAst(node: BaseNode) {
        if (node.type === OvsParser.prototype.OvsRenderDomViewDeclaration.name) {

        } else {

        }
    }

    static ovsRenderDomViewDeclarationToEstree() {

    }

    static OvsRenderDomViewDeclaratorToEstree() {

    }
}
