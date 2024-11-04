import { createKeywordToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import Es6TokenConsumer, { Es6TokenName, es6TokensObj } from 'subhuti/src/syntax/es6/Es6Tokens.ts'

export const ovsTokenName = {
  ...Es6TokenName,
  OvsToken: "OvsToken"
}
export const ovsTokensObj = {
  ...es6TokensObj,
  OvsToken: createKeywordToken(ovsTokenName.OvsToken, "Ovs")
}
export const ovs6Tokens = Object.values(ovsTokensObj)

export default class OvsTokenConsumer extends Es6TokenConsumer {
  OvsToken() {
    return this.consume(ovsTokensObj.OvsToken)
  }
}
