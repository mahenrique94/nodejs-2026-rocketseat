import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Box, ChevronRight, HardDrive, Globe, Monitor, Database, FolderOpen } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

const MODULES = [
  {
    id: 'fs',
    label: 'node:fs',
    icon: HardDrive,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    activeBg: 'bg-emerald-500/20',
    activeBorder: 'border-emerald-500/30',
    description: 'Sistema de arquivos — leitura, escrita, diretórios e watchers.',
    code: `import { readFile, writeFile, mkdir, watch } from 'node:fs/promises'
import { createReadStream } from 'node:fs'

// leitura com encoding
const content = await readFile('./config.json', 'utf-8')
const config  = JSON.parse(content)

// escrita atômica
await writeFile('./output.txt', 'hello, node!', 'utf-8')

// criar diretório (e pais, se não existirem)
await mkdir('./logs/2026', { recursive: true })

// watcher reativo
const watcher = watch('./src', { recursive: true })
for await (const { eventType, filename } of watcher) {
  console.log(\`\${eventType}: \${filename}\`)
}

// stream para arquivos grandes
const stream = createReadStream('./large-file.csv', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024, // 64 KB por chunk
})`,
  },
  {
    id: 'path',
    label: 'node:path',
    icon: FolderOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    activeBg: 'bg-sky-500/20',
    activeBorder: 'border-sky-500/30',
    description: 'Manipulação de caminhos de arquivo de forma cross-platform.',
    code: `import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM — equivalente ao __dirname do CJS
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// construção de caminhos cross-platform
const config = path.join(__dirname, '..', 'config', 'app.json')
const abs     = path.resolve('./src/index.ts') // absoluto

// desestruturação de caminhos
const { dir, name, ext, base } = path.parse('/src/utils/helper.ts')
// dir: '/src/utils' | name: 'helper' | ext: '.ts' | base: 'helper.ts'

// normalização
path.normalize('/foo//bar/../baz') // '/foo/baz'

// separador de plataforma
path.sep   // '/' no Unix, '\\\\' no Windows
path.posix // força Unix em qualquer plataforma`,
  },
  {
    id: 'http',
    label: 'node:http',
    icon: Globe,
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    border: 'border-[#9956f6]/20',
    activeBg: 'bg-[#9956f6]/20',
    activeBorder: 'border-[#9956f6]/30',
    description: 'Servidor e cliente HTTP puro — a base de todos os frameworks web Node.js.',
    code: `import { createServer } from 'node:http'

// servidor HTTP básico
const server = createServer((req, res) => {
  const url = new URL(req.url!, \`http://\${req.headers.host}\`)

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', pid: process.pid }))
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})

// cliente HTTP (fetch nativo é preferível no Node 18+)
import { get } from 'node:http'
get('http://localhost:3000/health', (res) => {
  let data = ''
  res.on('data', (chunk) => data += chunk)
  res.on('end', () => console.log(JSON.parse(data)))
})`,
  },
  {
    id: 'os',
    label: 'node:os',
    icon: Monitor,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-500/30',
    description: 'Informações do sistema operacional e hardware.',
    code: `import os from 'node:os'

// informações do sistema
os.platform()       // 'linux' | 'darwin' | 'win32'
os.arch()           // 'x64' | 'arm64'
os.release()        // versão do kernel: '25.4.0'
os.hostname()       // nome do host

// recursos de hardware
os.cpus()           // array com info de cada CPU core
os.cpus().length    // número de cores
os.totalmem()       // memória total em bytes
os.freemem()        // memória disponível em bytes

// diretórios padrão
os.homedir()        // '/Users/mhc'
os.tmpdir()         // '/tmp' no Unix

// rede
os.networkInterfaces() // interfaces de rede com IPs

// útil para decidir paralelismo
const workers = Math.max(1, os.cpus().length - 1)
console.log(\`iniciando \${workers} workers\`)`,
  },
  {
    id: 'sqlite',
    label: 'node:sqlite',
    icon: Database,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    activeBg: 'bg-pink-500/20',
    activeBorder: 'border-pink-500/30',
    description: 'SQLite nativo — disponível no Node.js 22.5+ sem dependências externas.',
    code: `// node:sqlite — Node.js 22.5+ (experimental → estável no 23.x)
import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync(':memory:') // ou caminho para arquivo

// criar tabela
db.exec(\`
  CREATE TABLE users (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    email TEXT UNIQUE
  )
\`)

// prepared statements (seguro contra SQL injection)
const insert = db.prepare(
  'INSERT INTO users (name, email) VALUES (?, ?)'
)
insert.run('Alice', 'alice@example.com')
insert.run('Bob',   'bob@example.com')

// consulta com todos os resultados
const all = db.prepare('SELECT * FROM users WHERE name LIKE ?')
const rows = all.all('%li%') // [{ id: 1, name: 'Alice', ... }]

// consulta com um resultado
const one = db.prepare('SELECT * FROM users WHERE id = ?')
const user = one.get(1)`,
  },
] as const

type ModuleId = (typeof MODULES)[number]['id']

const CONCEPTS = [
  { icon: Box, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'node: prefix', desc: "Use sempre o prefixo node: (ex: import fs from 'node:fs') para deixar explícito que é um módulo nativo, não um pacote npm." },
  { icon: HardDrive, color: 'text-sky-400', bg: 'bg-sky-400/10', label: 'Sem instalação', desc: 'Módulos nativos fazem parte do runtime — não precisam de npm install e não aparecem no package.json.' },
  { icon: Globe, color: 'text-[#9956f6]', bg: 'bg-[#9956f6]/10', label: 'fs/promises', desc: 'Prefira a sub-API de promises (node:fs/promises) em vez do callback-style para código mais legível e seguro.' },
  { icon: Database, color: 'text-pink-400', bg: 'bg-pink-400/10', label: 'node:sqlite nativo', desc: 'A partir do Node.js 22.5, SQLite está disponível nativamente — sem better-sqlite3, sem bindings, sem instalação.' },
]

export function NativeModulesPage() {
  const [activeId, setActiveId] = useState<ModuleId>('fs')
  const active = MODULES.find((m) => m.id === activeId)!

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
            <span className="text-[#505059] text-sm group-hover:text-[#7c7c8a] transition">Node.js 2026</span>
          </Link>
          <h1 className="text-sm font-medium text-[#a8a8b3] hidden sm:block">Módulos Nativos</h1>
          <Link
            to="/buffers"
            className="flex items-center gap-1.5 text-sm text-[#7c7c8a] hover:text-white transition"
          >
            Próximo <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
            <Box className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">Módulo 3 · Módulos Nativos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-emerald-300 via-sky-400 to-[#9956f6] bg-clip-text text-transparent">
              Módulos Nativos
            </span>
          </h1>
          <p className="text-[#7c7c8a] text-lg max-w-2xl leading-relaxed">
            Node.js vem com uma biblioteca padrão poderosa — sem instalar nada. Use o prefixo{' '}
            <code className="text-emerald-300 bg-emerald-400/10 px-1.5 py-0.5 rounded text-base">node:</code>{' '}
            para importar módulos nativos de forma explícita e segura.
          </p>
        </motion.div>

        {/* module explorer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Explore os módulos</h2>

          {/* module selector */}
          <div className="flex flex-wrap gap-2">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              const isActive = mod.id === activeId
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveId(mod.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-medium border transition-all ${
                    isActive
                      ? `${mod.activeBg} ${mod.color} border ${mod.activeBorder}`
                      : 'bg-[#121214] text-[#7c7c8a] border-[#29292e] hover:border-[#505059] hover:text-[#a8a8b3]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mod.label}
                </button>
              )
            })}
          </div>

          {/* detail panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-[#121214] border border-[#29292e] rounded-2xl overflow-hidden"
            >
              <div className={`px-5 py-4 border-b border-[#29292e] flex items-center gap-3`}>
                <active.icon className={`w-4 h-4 ${active.color}`} />
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{active.description}</p>
              </div>
              <pre className="p-5 text-sm text-[#a8a8b3] overflow-x-auto leading-relaxed font-mono">
                <code>{active.code}</code>
              </pre>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* node: prefix tip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold text-sm">Boas práticas com módulos nativos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { tip: "Prefira node: prefix", detail: "import fs from 'node:fs' deixa claro que não é um pacote npm. Evita colisões de nomes." },
                { tip: 'Use fs/promises', detail: "A sub-API assíncrona com promises (node:fs/promises) é mais limpa que callbacks ou fs.readFileSync." },
                { tip: 'Evite sync em servers', detail: 'Funções como readFileSync bloqueiam o Event Loop. Use sempre a versão assíncrona em servidores HTTP.' },
              ].map(({ tip, detail }) => (
                <div key={tip} className="bg-[#09090a] border border-[#29292e] rounded-xl p-3 space-y-1">
                  <p className="text-emerald-300 text-xs font-semibold">{tip}</p>
                  <p className="text-[#7c7c8a] text-xs leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* concept cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Conceitos-chave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONCEPTS.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="bg-[#121214] border border-[#29292e] rounded-2xl p-5 flex gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-[#7c7c8a] text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* next */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="border-t border-[#29292e] pt-8 flex justify-end"
        >
          <Link
            to="/buffers"
            className="flex items-center gap-2 bg-[#121214] border border-[#29292e] hover:border-[#505059] rounded-xl px-5 py-3 text-sm text-[#a8a8b3] hover:text-white transition-colors group"
          >
            <HardDrive className="w-4 h-4 text-[#505059] group-hover:text-[#a8a8b3] transition-colors" />
            Buffers
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
