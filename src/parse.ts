import { Lexer, Token, Node, Statement, Identifier, Expression, Module } from './types'
import { error } from './error'


export function parse(lexer: Lexer): Module {
    // 首次执行
    lexer.scan()

    return parseModule()
    function parseModule(): Module {
        // 找语句，以分号结束；
        const statements = parseSeparated(parseStatement, () => tryParseToken(Token.Semicolon))

        // 结束
        parseExpected(Token.EOF)
        return { statements, locals: new Map() }
    }

    // 启动：循环
    function parseSeparated<T>(element: () => T, separator: () => unknown) {
        const list = [element()]
        while (separator()) {
            list.push(element())
        }
        return list
    }
    // 解析语句
    function parseStatement(): Statement {
        // 当前位置
        const pos = lexer.pos()

        // 如果是变量
        if (tryParseToken(Token.Var)) {
            const name = parseIdentifier()
            const typename = tryParseToken(Token.Colon) ? parseIdentifier() : undefined
            // token预计是等号，扫描继续往下
            parseExpected(Token.Equals)
            const init = parseExpression()
            return { kind: Node.Var, name, typename, init, pos }
        } else {
            return { kind: Node.ExpressionStatement, expr: parseExpression(), pos }
        }
    }

    /**
     * 业务工具函数
     */
    // 找Token.Identifier，返回节点信息
    function parseIdentifier(): Identifier {
        const pos = lexer.pos()
        let text = lexer.text()

        if (!parseExpected(Token.Identifier)) {
            text = "(missing)"
        }

        return { kind: Node.Identifier, text, pos }
    }
    function parseExpression(): Expression {
        const pos = lexer.pos()
        const t = parseToken()
        switch (t) {
            case Token.Identifier:
                const name = { kind: Node.Identifier, text: lexer.text(), pos } as const
                if (tryParseToken(Token.Equals)) {
                    return { kind: Node.Assignment, name, value: parseExpression(), pos }
                }
                else {
                    return name
                }
            case Token.Literal:
                return { kind: Node.Literal, value: +lexer.text(), pos }
            default:
                error(pos, "Expected identifier or literal but got " + Token[t])
                return { kind: Node.Identifier, text: "(missing)", pos }
        }
    }

     /**
     * 基础工具函数
     */
    // 如果是目标token，就继续scan
    function tryParseToken(token: Token) {
        if (lexer.token() === token) {
            lexer.scan()
            return true
        }
        else {
            return false
        }
    }
    // 取实际token值
    function parseToken() {
        const t = lexer.token()
        lexer.scan()
        return t
    }
    // 检测是否是预期的token
    function parseExpected(expected: Token) {
        const pos = lexer.pos()
        const actual = parseToken()
        if (actual !== expected) {
            error(pos, `parseToken: Expected ${Token[expected]} but got ${Token[actual]}`)
        }
        return actual === expected
    }
}
