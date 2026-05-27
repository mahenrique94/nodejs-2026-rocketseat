// ── token types ──────────────────────────────────────────────────────────────

type TType = 'comment' | 'string' | 'keyword' | 'builtin' | 'number' | 'plain'

interface Token { type: TType; text: string }

// ── vocabularies ─────────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'import', 'export', 'from',
  'default', 'class', 'new', 'typeof', 'instanceof', 'in', 'of', 'async',
  'await', 'try', 'catch', 'finally', 'throw', 'this', 'super', 'extends',
  'true', 'false', 'null', 'undefined', 'void', 'as', 'type', 'interface',
  'enum', 'abstract', 'declare', 'readonly', 'static', 'private', 'public',
  'protected', 'with', 'yield', 'delete', 'eval', 'module', 'require',
])

const BUILTINS = new Set([
  'console', 'process', 'window', 'document', 'global', 'globalThis',
  'exports', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Promise', 'Array', 'Object', 'Map', 'Set', 'Error', 'JSON', 'Math',
  'Date', 'Buffer', 'fetch', 'URL', 'crypto', 'Symbol', 'RegExp', 'Number',
  'String', 'Boolean', 'BigInt', 'WeakMap', 'WeakSet', 'performance',
  'navigator', 'localStorage', 'sessionStorage', 'Worker', 'Atomics',
  'SharedArrayBuffer', 'cluster', 'caches', 'self', 'parentPort', 'workerData',
  'isMainThread', 'cpus', 'createServer', 'readFile', 'writeFile', 'readFileSync',
])

// ── tokenizer ─────────────────────────────────────────────────────────────────

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      const nl = code.indexOf('\n', i)
      const end = nl === -1 ? code.length : nl
      tokens.push({ type: 'comment', text: code.slice(i, end) })
      i = end
      continue
    }
    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const endPos = end === -1 ? code.length : end + 2
      tokens.push({ type: 'comment', text: code.slice(i, endPos) })
      i = endPos
      continue
    }
    // Shell / HTML comment
    if (code[i] === '#' && (i === 0 || code[i - 1] === '\n' || code[i - 1] === ' ')) {
      const nl = code.indexOf('\n', i)
      const end = nl === -1 ? code.length : nl
      tokens.push({ type: 'comment', text: code.slice(i, end) })
      i = end
      continue
    }
    // Single-quoted string
    if (code[i] === "'") {
      let j = i + 1
      while (j < code.length && code[j] !== "'" && code[j] !== '\n') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Double-quoted string
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length && code[j] !== '"' && code[j] !== '\n') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Template literal (simplified — not parsing ${} internals)
    if (code[i] === '`') {
      let j = i + 1
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // Numbers (including numeric separators and hex/binary)
    if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i - 1]))) {
      let j = i
      if (code[i] === '0' && /[xXoObB]/.test(code[i + 1] ?? '')) {
        j += 2
        while (j < code.length && /[\w]/.test(code[j])) j++
      } else {
        while (j < code.length && /[\d_.]/.test(code[j])) j++
      }
      tokens.push({ type: 'number', text: code.slice(i, j) })
      i = j
      continue
    }
    // Identifiers, keywords, builtins
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[\w$]/.test(code[j])) j++
      const word = code.slice(i, j)
      const type: TType = KEYWORDS.has(word) ? 'keyword' : BUILTINS.has(word) ? 'builtin' : 'plain'
      tokens.push({ type, text: word })
      i = j
      continue
    }
    tokens.push({ type: 'plain', text: code[i] })
    i++
  }

  return tokens
}

// ── colours ───────────────────────────────────────────────────────────────────

const COLORS: Record<TType, string> = {
  comment: '#5c6e79',
  string:  '#c3e88d',
  keyword: '#c792ea',
  builtin: '#ffcb6b',
  number:  '#f78c6c',
  plain:   '#cdd3de',
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  code: string
  accent?: 'browser' | 'node'
  border?: string
  className?: string
}

export function CodeHighlight({ code, accent, border: borderProp, className }: Props) {
  const border = borderProp ?? (accent === 'browser' ? 'border-[#5f75f2]/20' : accent === 'node' ? 'border-[#29e0a9]/20' : 'border-[#29292e]')
  const tokens = tokenize(code)

  return (
    <pre className={`bg-[#09090a] border ${border} rounded-xl p-4 text-xs font-mono leading-[1.7] overflow-auto ${className ?? ''}`}>
      {tokens.map((tok, idx) => (
        <span key={idx} style={{ color: COLORS[tok.type] }}>
          {tok.text}
        </span>
      ))}
    </pre>
  )
}
