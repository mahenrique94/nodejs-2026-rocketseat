import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Globe, FolderOpen, Package, Network, Settings2, Wrench, Database, Cpu,
  CheckCircle2, XCircle, AlertTriangle, Handshake, Globe2,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'
import { CodeHighlight } from '../components/CodeHighlight'

// ─── types ────────────────────────────────────────────────────────────────────

type Availability = 'yes' | 'no' | 'partial'

interface Side {
  availability: Availability
  summary: string
  code: string
  notes: string[]
}

type LucideIcon = React.ComponentType<{ className?: string }>

interface Topic {
  id: string
  Icon: LucideIcon
  title: string
  subtitle: string
  browser: Side
  node: Side
}

// ─── data ─────────────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
  {
    id: 'global',
    Icon: Globe,
    title: 'Objeto Global',
    subtitle: 'window vs global vs globalThis',
    browser: {
      availability: 'yes',
      summary: 'window é o objeto global. Cada aba do navegador tem o seu próprio window isolado.',
      code: `// No browser, window é o global
console.log(window === globalThis) // true

window.minhaVar = 'olá'
console.log(minhaVar) // 'olá'

// APIs exclusivas do window
window.location.href  // URL atual
window.document       // DOM
window.localStorage   // storage
window.alert('oi')    // dialog`,
      notes: [
        'Cada aba/frame tem seu próprio window isolado',
        'window contém document, location, history, navigator',
        'Variáveis var declaradas no topo viram propriedades do window',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'global é o objeto global do processo. Não existe window. Use globalThis para código portável.',
      code: `// No Node.js, global é o objeto global
console.log(global === globalThis) // true

global.minhaVar = 'olá'
console.log(minhaVar) // 'olá'

// Mas evite poluir o global!
// Prefira módulos com export/import

// globalThis funciona em ambos os ambientes
globalThis.API_URL = 'https://...'`,
      notes: [
        'global é compartilhado por todo o processo Node.js',
        'Não existe window, document, location nem DOM',
        'globalThis é a forma portável (funciona no browser e no Node.js)',
      ],
    },
  },
  {
    id: 'fs',
    Icon: FolderOpen,
    title: 'Sistema de Arquivos',
    subtitle: 'Acesso ao disco da máquina',
    browser: {
      availability: 'no',
      summary: 'Por segurança, o browser não pode ler ou escrever arquivos no sistema operacional livremente.',
      code: `// ❌ Não existe no browser
const fs = require('fs') // ReferenceError

// ✅ Única forma: usuário seleciona o arquivo
<input type="file" onChange={e => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    console.log(e.target.result)
  }
  reader.readAsText(file)
}} />

// ⚠️ File System Access API (Chrome 86+)
// Requer permissão explícita do usuário`,
      notes: [
        'Sandbox de segurança: scripts não acessam o OS livremente',
        'Apenas arquivos que o usuário escolhe explicitamente',
        'File System Access API existe, mas com permissão do usuário',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'fs é um módulo nativo com acesso completo ao sistema de arquivos: ler, escrever, mover, deletar.',
      code: `import { readFile, writeFile } from 'node:fs/promises'

// Ler arquivo
const conteudo = await readFile(
  './dados.json',
  'utf-8'
)
const dados = JSON.parse(conteudo)

// Escrever arquivo
await writeFile(
  './saida.txt',
  'Hello, Node.js!',
  'utf-8'
)

// Síncrono (bloqueia — evitar em produção)
import { readFileSync } from 'node:fs'
const txt = readFileSync('./config.txt', 'utf-8')`,
      notes: [
        'Acesso total: criar, ler, escrever, deletar, mover arquivos',
        'Prefira a versão assíncrona (fs/promises) para não bloquear',
        'Use node: prefix para importar módulos nativos (node:fs)',
      ],
    },
  },
  {
    id: 'modules',
    Icon: Package,
    title: 'Sistema de Módulos',
    subtitle: 'Como o código é organizado e importado',
    browser: {
      availability: 'partial',
      summary: 'Suporta ES Modules nativamente com <script type="module"> e import/export.',
      code: `<!-- HTML: carregando módulos -->
<script type="module" src="./app.js"></script>

// app.js — ES Modules no browser
import { soma } from './utils.js'
import React from 'https://esm.sh/react'

export function App() {
  return soma(1, 2)
}

// ❌ require() não existe no browser
const fs = require('fs') // ReferenceError`,
      notes: [
        'ES Modules (import/export) é o padrão moderno',
        'Cada arquivo tem seu próprio escopo — sem vazamento global',
        'require() é exclusivo do Node.js (CommonJS)',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'Suporta dois sistemas: CommonJS (require) legado e ES Modules (import) moderno.',
      code: `// ── CommonJS (padrão histórico) ──
const path = require('node:path')
const { soma } = require('./utils')
module.exports = { minhaFuncao }

// ── ES Modules (moderno, recomendado) ──
// package.json → "type": "module"
import path from 'node:path'
import { soma } from './utils.js'
export function minhaFuncao() {}

// Importar JSON (Node 22+)
import config from './config.json'
  with { type: 'json' }`,
      notes: [
        'CommonJS: require() / module.exports — legado mas muito comum',
        'ES Modules: import/export — padrão moderno, igual ao browser',
        'Prefira ESM em projetos novos com "type": "module" no package.json',
      ],
    },
  },
  {
    id: 'network',
    Icon: Network,
    title: 'Rede e HTTP',
    subtitle: 'Fazer e receber requisições',
    browser: {
      availability: 'partial',
      summary: 'Pode fazer requisições HTTP com fetch, mas está sujeito a CORS — a origem do servidor precisa permitir.',
      code: `// fetch funciona no browser
const res = await fetch('https://api.exemplo.com/dados')
const json = await res.json()

// ⚠️ CORS bloqueia se o servidor não permitir
// Error: CORS policy blocked the request

// O browser ENVIA origin header automaticamente:
// Origin: https://meusite.com
// O servidor precisa responder:
// Access-Control-Allow-Origin: *

// ❌ Não pode criar servidor HTTP
const server = http.createServer(...) // ReferenceError`,
      notes: [
        'CORS: Same-Origin Policy protege o usuário de requisições maliciosas',
        'O browser envia cookies, tokens de autenticação — daí a proteção',
        'Não é possível criar um servidor HTTP dentro do browser',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'Pode criar servidores HTTP, fazer requisições sem restrição de CORS e controlar headers livremente.',
      code: `import { createServer } from 'node:http'

// ✅ Criar servidor HTTP
const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // CORS
  })
  res.end(JSON.stringify({ ok: true }))
})
server.listen(3000)

// ✅ fetch sem restrições de CORS (Node 18+)
const res = await fetch('http://api-interna:8080/dados')

// ✅ Controle total de headers, cookies, etc.`,
      notes: [
        'Sem CORS: Node.js é servidor, não cliente do usuário — não há risco',
        'fetch nativo disponível desde Node.js 18 (sem instalar axios/node-fetch)',
        'Pode criar servidores TCP, UDP, HTTP/2, WebSocket, etc.',
      ],
    },
  },
  {
    id: 'env',
    Icon: Settings2,
    title: 'Variáveis de Ambiente',
    subtitle: 'Configuração e segredos',
    browser: {
      availability: 'no',
      summary: 'Não existe acesso a variáveis de ambiente do sistema operacional. Tudo que vai pro browser é público.',
      code: `// ❌ Não existe process.env no browser
console.log(process.env.SECRET) // ReferenceError

// ⚠️ Bundlers (Vite, webpack) simulam com substituição
// em tempo de build — mas o valor fica exposto no JS!
// Vite: apenas vars prefixadas com VITE_
console.log(import.meta.env.VITE_API_URL)
// → valor embutido no bundle final (público!)

// 🔴 NUNCA coloque secrets no browser:
// API keys, tokens, senhas → ficam expostos`,
      notes: [
        'Tudo enviado ao browser é código público — inspecionável',
        'Bundlers substituem variáveis em tempo de build (não é runtime)',
        'Segredos (tokens, keys de banco) devem ficar APENAS no servidor',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'process.env dá acesso às variáveis de ambiente do sistema operacional em tempo de execução.',
      code: `// ✅ process.env acessa variáveis do ambiente
console.log(process.env.NODE_ENV)   // 'production'
console.log(process.env.PORT)       // '3000'
console.log(process.env.DB_URL)     // string de conexão

// Arquivo .env (com dotenv ou Node 20.6+)
// .env:
// DB_URL=postgresql://user:senha@localhost/db
// JWT_SECRET=segredo-muito-secreto

// Node 20.6+: carrega .env nativamente
// node --env-file=.env server.js

// Desestruturando com fallback
const { PORT = '3000', NODE_ENV = 'development' } = process.env`,
      notes: [
        'Valores são sempre strings — converta números com Number()',
        'Use .env + dotenv (ou Node 20.6+ --env-file) para desenvolvimento',
        'Em produção, defina as vars no ambiente (Docker, Kubernetes, etc.)',
      ],
    },
  },
  {
    id: 'process',
    Icon: Wrench,
    title: 'Processo e Runtime',
    subtitle: 'Informações sobre o ambiente de execução',
    browser: {
      availability: 'partial',
      summary: 'Não existe o objeto process. Informações do ambiente ficam em navigator, performance e window.',
      code: `// ❌ process não existe no browser
process.exit()    // ReferenceError
process.argv      // ReferenceError
process.env       // ReferenceError

// ✅ Alternativas no browser:
navigator.userAgent   // "Chrome/120..."
navigator.platform    // "Win32"
navigator.onLine      // true/false

performance.now()     // timestamp de alta precisão
performance.memory    // uso de memória (Chrome)

// Versão do browser: userAgent parsing
// (não confiável — prefira feature detection)`,
      notes: [
        'navigator expõe info do browser e sistema do usuário',
        'performance.now() é mais preciso que Date.now()',
        'Não é possível encerrar o tab via código (process.exit não existe)',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'process é um objeto global rico com controle total sobre o processo em execução.',
      code: `// Informações do processo
console.log(process.pid)        // 12345 (ID do processo)
console.log(process.version)    // 'v22.0.0'
console.log(process.platform)   // 'linux' | 'darwin' | 'win32'
console.log(process.arch)       // 'x64' | 'arm64'
console.log(process.uptime())   // segundos rodando
console.log(process.memoryUsage()) // { rss, heapUsed... }

// Argumentos da linha de comando
// node script.js --port 3000
console.log(process.argv)
// ['node', '/path/script.js', '--port', '3000']

// Encerrar o processo
process.exit(0)  // 0 = sucesso, !0 = erro

// Eventos do processo
process.on('uncaughtException', (err) => { ... })
process.on('SIGTERM', () => { /* graceful shutdown */ })`,
      notes: [
        'process é global — disponível sem import em qualquer arquivo',
        'process.exit(0) encerra o processo imediatamente',
        'SIGTERM/SIGINT são sinais do OS para encerramento gracioso',
      ],
    },
  },
  {
    id: 'storage',
    Icon: Database,
    title: 'Armazenamento',
    subtitle: 'Como os dados persistem',
    browser: {
      availability: 'yes',
      summary: 'Storages do browser: localStorage, sessionStorage, cookies e IndexedDB — todos com limites e escopo por origem.',
      code: `// localStorage — persiste entre sessões (~5MB)
localStorage.setItem('token', 'abc123')
const token = localStorage.getItem('token')
localStorage.removeItem('token')

// sessionStorage — só durante a aba (~5MB)
sessionStorage.setItem('etapa', '2')

// Cookies — enviados ao servidor automaticamente
document.cookie = 'sessao=xyz; Path=/; Secure'

// IndexedDB — banco de dados no browser (MBs)
const db = await indexedDB.open('meu-banco', 1)

// Cache API (Service Workers)
const cache = await caches.open('v1')
await cache.add('/index.html')`,
      notes: [
        'localStorage persiste, sessionStorage some ao fechar a aba',
        'Cookies são enviados em toda requisição HTTP — cuidado com tamanho',
        'IndexedDB é ideal para grandes volumes de dados no browser',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'Node.js persiste dados em arquivos (fs), bancos de dados ou memória. Não existe localStorage.',
      code: `// Arquivo JSON simples
import { readFile, writeFile } from 'node:fs/promises'
const dados = JSON.parse(await readFile('db.json', 'utf-8'))
await writeFile('db.json', JSON.stringify(dados))

// SQLite (Node 22.5+ nativo!)
import { DatabaseSync } from 'node:sqlite'
const db = new DatabaseSync('banco.db')
db.exec('CREATE TABLE IF NOT EXISTS usuarios (...)')
const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?')
const usuario = stmt.get(1)

// PostgreSQL com driver
import postgres from 'postgres'
const sql = postgres(process.env.DB_URL)
const users = await sql\`SELECT * FROM users\``,
      notes: [
        'Node 22.5+ tem SQLite nativo com node:sqlite (sem instalar nada)',
        'Para produção: PostgreSQL, MySQL, MongoDB com drivers npm',
        'Não existe localStorage — dados em memória somem ao reiniciar',
      ],
    },
  },
  {
    id: 'workers',
    Icon: Cpu,
    title: 'Threads e Paralelismo',
    subtitle: 'Trabalho pesado sem bloquear',
    browser: {
      availability: 'yes',
      summary: 'Web Workers rodam scripts em threads separadas, sem acesso ao DOM.',
      code: `// main.js — thread principal
const worker = new Worker('./worker.js')

worker.postMessage({ numero: 1_000_000 })

worker.onmessage = (e) => {
  console.log('Resultado:', e.data.resultado)
}

// worker.js — thread separada
self.onmessage = (e) => {
  const { numero } = e.data
  let soma = 0
  for (let i = 0; i < numero; i++) soma += i

  self.postMessage({ resultado: soma })
}

// SharedArrayBuffer — memória compartilhada
// (requer headers COOP/COEP)`,
      notes: [
        'Web Workers não têm acesso ao DOM — só podem comunicar via postMessage',
        'Ideais para cálculos pesados (crypto, compressão, parsing)',
        'SharedArrayBuffer permite memória compartilhada entre threads',
      ],
    },
    node: {
      availability: 'yes',
      summary: 'Worker Threads funcionam como Web Workers: threads reais, comunicação via postMessage.',
      code: `import { Worker, isMainThread,
  parentPort, workerData
} from 'node:worker_threads'

if (isMainThread) {
  // Thread principal
  const worker = new Worker(import.meta.filename, {
    workerData: { numero: 1_000_000 }
  })
  worker.on('message', (resultado) => {
    console.log('Resultado:', resultado)
  })
} else {
  // Thread worker
  const { numero } = workerData
  let soma = 0
  for (let i = 0; i < numero; i++) soma += i
  parentPort.postMessage(soma)
}

// SharedArrayBuffer funciona sem restrições extras`,
      notes: [
        'Worker Threads têm acesso ao fs, módulos nativos, etc.',
        'Compartilham memória via SharedArrayBuffer/Atomics',
        'Thread Pool do libuv é diferente — gerenciado automaticamente',
      ],
    },
  },
]

const SHARED_APIS = [
  { name: 'fetch()', desc: 'Requisições HTTP', node: 'v18+', browser: 'sim' },
  { name: 'console.*', desc: 'Log, warn, error, table...', node: 'sim', browser: 'sim' },
  { name: 'setTimeout / setInterval', desc: 'Timers assíncronos', node: 'sim', browser: 'sim' },
  { name: 'Promise / async·await', desc: 'Código assíncrono', node: 'sim', browser: 'sim' },
  { name: 'URL / URLSearchParams', desc: 'Parsing de URLs', node: 'sim', browser: 'sim' },
  { name: 'TextEncoder / TextDecoder', desc: 'Codificação de texto', node: 'sim', browser: 'sim' },
  { name: 'Web Crypto API', desc: 'Criptografia', node: 'v15+', browser: 'sim' },
  { name: 'AbortController', desc: 'Cancelar operações', node: 'v15+', browser: 'sim' },
  { name: 'EventTarget', desc: 'Sistema de eventos', node: 'v14+', browser: 'sim' },
  { name: 'Blob / File', desc: 'Dados binários', node: 'v15+', browser: 'sim' },
  { name: 'ReadableStream', desc: 'Streams da Web API', node: 'v16+', browser: 'sim' },
  { name: 'structuredClone()', desc: 'Cópia profunda de objetos', node: 'v17+', browser: 'sim' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function AvailabilityBadge({ value }: { value: Availability }) {
  const map = {
    yes:     { label: 'Disponível',   cls: 'bg-[#29e0a9]/10 text-[#29e0a9] border-[#29e0a9]/20', Icon: CheckCircle2 },
    no:      { label: 'Indisponível', cls: 'bg-red-500/10 text-red-400 border-red-500/20',        Icon: XCircle },
    partial: { label: 'Limitado',     cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',  Icon: AlertTriangle },
  }
  const { label, cls, Icon } = map[value]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  )
}


function SidePanel({
  label, accent, side,
}: {
  label: string
  accent: 'browser' | 'node'
  side: Side
}) {
  const colors = {
    browser: {
      header: 'border-[#5f75f2]/30 bg-[#5f75f2]/10 text-[#a0b0ff]',
      note: 'bg-[#5f75f2]/5 border-[#5f75f2]/10',
    },
    node: {
      header: 'border-[#29e0a9]/30 bg-[#29e0a9]/10 text-[#29e0a9]',
      note: 'bg-[#29e0a9]/5 border-[#29e0a9]/10',
    },
  }
  const c = colors[accent]

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${c.header}`}>
        <div className="flex items-center gap-2">
          {accent === 'browser'
            ? <Globe className="w-4 h-4" />
            : <Globe2 className="w-4 h-4" />}
          <span className="font-bold text-sm">{label}</span>
        </div>
        <AvailabilityBadge value={side.availability} />
      </div>

      <p className="text-[#a8a8b3] text-sm leading-relaxed">{side.summary}</p>

      <CodeHighlight code={side.code} accent={accent} />

      <div className={`rounded-xl border p-4 space-y-2 ${c.note}`}>
        {side.notes.map((n, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#7c7c8a] text-xs mt-0.5 shrink-0">→</span>
            <p className="text-[#a8a8b3] text-xs leading-relaxed">{n}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function NodeVsBrowserPage() {
  const [activeId, setActiveId] = useState(TOPICS[0].id)
  const activeTopic = TOPICS.find((t) => t.id === activeId)!

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Node.js vs Browser
          </h1>
          <Link to="/node-architecture" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Arquitetura →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* hero */}
        <motion.div
          className="text-center space-y-3"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 bg-[#5f75f2]/10 border border-[#5f75f2]/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-[#a0b0ff]">Módulo 1 · Fundamentos</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-[#5f75f2] via-[#9956f6] to-[#29e0a9] bg-clip-text text-transparent">
              Node.js vs Browser
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Ambos executam JavaScript, mas em ambientes completamente diferentes.
            Entender as diferenças é essencial para não tentar usar <code className="text-[#b585fb] bg-[#9956f6]/10 px-1.5 py-0.5 rounded text-xs">window</code> no Node.js
            ou <code className="text-[#29e0a9] bg-[#29e0a9]/10 px-1.5 py-0.5 rounded text-xs">fs</code> no browser.
          </motion.p>
        </motion.div>

        {/* legend */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs">
          {[
            { color: 'bg-[#5f75f2]', label: 'Browser' },
            { color: 'bg-[#29e0a9]', label: 'Node.js' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[#7c7c8a]">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[#29292e]">
            {(['yes', 'no', 'partial'] as Availability[]).map((v) => (
              <AvailabilityBadge key={v} value={v} />
            ))}
          </div>
        </div>

        {/* main comparison */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* topic nav */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-[#121214] border border-[#29292e] rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {TOPICS.map((topic) => (
                <motion.button
                  key={topic.id}
                  onClick={() => setActiveId(topic.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 cursor-pointer shrink-0
                    ${activeId === topic.id
                      ? 'bg-[#9956f6]/15 border border-[#9956f6]/30 text-white'
                      : 'text-[#7c7c8a] hover:bg-[#202024] hover:text-white border border-transparent'
                    }
                  `}
                >
                  <topic.Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0 hidden lg:block">
                    <p className="text-xs font-semibold truncate">{topic.title}</p>
                    <p className="text-[10px] text-[#505059] truncate">{topic.subtitle}</p>
                  </div>
                  <span className="lg:hidden text-xs font-semibold whitespace-nowrap">{topic.title}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* topic header */}
                <div className="bg-[#121214] border border-[#29292e] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <activeTopic.Icon className="w-5 h-5 text-white/50" />
                    <div>
                      <h3 className="font-bold text-white text-base">{activeTopic.title}</h3>
                      <p className="text-[#505059] text-xs">{activeTopic.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* two columns */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
                    <SidePanel
                      label="Browser"
                      accent="browser"
                      side={activeTopic.browser}
                    />
                  </div>
                  <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
                    <SidePanel
                      label="Node.js"
                      accent="node"
                      side={activeTopic.node}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* shared apis */}
        <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-white/50" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">APIs Compartilhadas</h3>
              <p className="text-[#505059] text-xs mt-0.5">Disponíveis nos dois ambientes — escreva uma vez, rode em qualquer lugar</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {SHARED_APIS.map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
                className="rounded-xl border border-[#29292e] bg-[#09090a] p-3"
              >
                <p className="text-white text-xs font-mono font-semibold mb-1">{api.name}</p>
                <p className="text-[#7c7c8a] text-[10px] leading-4 mb-2">{api.desc}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#5f75f2]/10 text-[#a0b0ff] px-1.5 py-0.5 rounded-full">
                    <Globe className="w-2.5 h-2.5" /> {api.browser}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#29e0a9]/10 text-[#29e0a9] px-1.5 py-0.5 rounded-full">
                    <Globe2 className="w-2.5 h-2.5" /> {api.node}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-[#323238] text-xs text-center">
            Node.js vem adotando progressivamente as Web APIs — quanto mais recente a versão, mais compatibilidade com o browser.
          </p>
        </div>

        {/* takeaway cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            { Icon: Globe,     title: 'Browser: sandbox seguro', color: 'border-[#5f75f2]/30 bg-[#5f75f2]/5', tc: 'text-[#a0b0ff]', ic: 'text-[#a0b0ff]', body: 'O browser isola scripts por segurança do usuário. Sem acesso ao OS, arquivos ou variáveis de ambiente. Tudo que roda aqui é público.' },
            { Icon: Globe2,    title: 'Node.js: acesso total',   color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5', tc: 'text-[#29e0a9]', ic: 'text-[#29e0a9]', body: 'Node.js roda no servidor com acesso ao sistema de arquivos, rede, processos filhos e variáveis de ambiente. Com grandes poderes...' },
            { Icon: Handshake, title: 'JavaScript é o elo',      color: 'border-[#9956f6]/30 bg-[#9956f6]/5', tc: 'text-[#b585fb]', ic: 'text-[#b585fb]', body: 'A linguagem é a mesma — sintaxe, tipos, async/await, Promises. O ambiente muda, mas seu conhecimento de JS vale nos dois lados.' },
          ].map(({ Icon, title, color, tc, ic, body }) => (
            <div key={title} className={`rounded-xl border p-5 ${color}`}>
              <Icon className={`w-5 h-5 mb-3 ${ic}`} />
              <h4 className={`font-bold text-sm mb-2 ${tc}`}>{title}</h4>
              <p className="text-[#a8a8b3] text-xs leading-5">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
