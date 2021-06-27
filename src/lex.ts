import { Token, Lexer } from './types'
const keywords = {
    "function": Token.Function,
    "var": Token.Var,
    "return": Token.Return,
}
export function lex(s: string): Lexer {
    let pos = 0
    let text = ""
    let token = Token.BOF

    return {
        scan,
        token: () => token,
        pos: () => pos,
        text: () => text,
    }

    function scan() {
        scanForward(c => /[ \t\b\n]/.test(c))

        // 开始有内容的位置
        const start = pos

        // 钥匙都是\t\b\n，那就是结束标记了
        if (pos === s.length) {
            token = Token.EOF
        } else if (/[0-9]/.test(s.charAt(pos))) {
            scanForward(c => /[0-9]/.test(c))
            text = s.slice(start, pos)
            // 都是数字，就是数字的字面量类型
            token = Token.Literal
        } else if (/[_a-zA-Z]/.test(s.charAt(pos))) {
            scanForward(c => /[_a-zA-Z0-9]/.test(c))
            text = s.slice(start, pos)
            // 是预留的keywords还是变量标识符
            token = text in keywords ? keywords[text as keyof typeof keywords] : Token.Identifier
        } else {
            pos++
            // 这里就是其他的符号了
            switch (s.charAt(pos - 1)) {
                case '=': token = Token.Equals; break
                case ';': token = Token.Semicolon; break
                case ":": token = Token.Colon; break
                default: token = Token.Unknown; break
            }
        }
    }

    function scanForward(pred: (x: string) => boolean) {
        while (pos < s.length && pred(s.charAt(pos))) pos++
    }
}

export function lexAll(s: string) {
    const lexer = lex(s)
    let tokens = []
    let t
    while(true) {
        lexer.scan()
        t = lexer.token()
        switch (t) {
            case Token.EOF:
                return tokens
            case Token.Identifier:
            case Token.Literal:
                tokens.push({ token: t, text: lexer.text() })
                break
            default:
                tokens.push({ token: t })
                break
        }
    }
}
