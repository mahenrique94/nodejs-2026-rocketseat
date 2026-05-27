import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { HardDrive, ChevronRight, Hash, Binary, Layers, AlertTriangle } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'
import { CodeHighlight } from '../components/CodeHighlight'

const CREATION_TABS = ['Buffer.from()', 'Buffer.alloc()', 'Buffer.concat()'] as const
type CreationTab = (typeof CREATION_TABS)[number]

const CREATION_CODE: Record<CreationTab, { description: string; code: string }> = {
  'Buffer.from()': {
    description: 'Cria um Buffer a partir de dados existentes: string, array de bytes ou outro Buffer.',
    code: `// a partir de uma string (padrão: utf-8)
const buf1 = Buffer.from('Hello, Node.js!')
console.log(buf1)
// <Buffer 48 65 6c 6c 6f 2c 20 4e 6f 64 65 2e 6a 73 21>

// especificando encoding
const buf2 = Buffer.from('SGVsbG8=', 'base64')
console.log(buf2.toString()) // 'Hello'

// a partir de array de bytes
const buf3 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])
console.log(buf3.toString()) // 'Hello'

// copiar outro Buffer
const buf4 = Buffer.from(buf1)
buf4[0] = 0x68 // 'h' — não afeta buf1`,
  },
  'Buffer.alloc()': {
    description: 'Cria um Buffer de tamanho fixo, preenchido com zeros (seguro) ou com um valor específico.',
    code: `// alocação segura — preenchido com zeros
const buf1 = Buffer.alloc(10)
console.log(buf1)
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// alocação com valor de preenchimento
const buf2 = Buffer.alloc(10, 0xff)
console.log(buf2)
// <Buffer ff ff ff ff ff ff ff ff ff ff>

// INSEGURO — memória não inicializada (mais rápido)
// use APENAS quando você vai escrever antes de ler
const buf3 = Buffer.allocUnsafe(10)

// escrever no buffer manualmente
buf1.writeUInt32BE(42, 0)  // escreve 42 nos primeiros 4 bytes
buf1.writeUInt32BE(99, 4)  // escreve 99 nos próximos 4 bytes
console.log(buf1.readUInt32BE(0)) // 42
console.log(buf1.readUInt32BE(4)) // 99`,
  },
  'Buffer.concat()': {
    description: 'Concatena múltiplos Buffers em um único — essencial ao juntar chunks de streams.',
    code: `// juntando múltiplos chunks de uma stream
const chunks: Buffer[] = []

stream.on('data', (chunk: Buffer) => {
  chunks.push(chunk)
})

stream.on('end', () => {
  const complete = Buffer.concat(chunks)
  console.log(complete.toString('utf-8'))
})

// especificando o tamanho total (otimização)
const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
const result = Buffer.concat(chunks, totalLength)

// comparar buffers
const a = Buffer.from('abc')
const b = Buffer.from('abc')
console.log(a.equals(b))          // true
console.log(Buffer.compare(a, b)) // 0 (igual), -1 (a < b), 1 (a > b)`,
  },
}

const ENCODINGS = [
  {
    name: 'utf-8',
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    border: 'border-[#29e0a9]/20',
    desc: 'Padrão. Texto multilíngue, JSON, HTML. Caracteres podem ocupar 1–4 bytes.',
    example: `buf.toString('utf-8')     // padrão
buf.toString()            // utf-8 implícito`,
  },
  {
    name: 'base64',
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    border: 'border-[#9956f6]/20',
    desc: 'Codifica dados binários em texto ASCII. Usado em Data URLs, JWT, emails com anexos.',
    example: `buf.toString('base64')    // dados → base64
Buffer.from(str, 'base64')// base64 → dados`,
  },
  {
    name: 'hex',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    desc: 'Representação hexadecimal. Útil para debug, hashes, chaves criptográficas.',
    example: `buf.toString('hex')       // 'deadbeef...'
Buffer.from('deadbeef', 'hex')`,
  },
  {
    name: 'binary / latin1',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    desc: 'Mapeamento 1:1 byte → char. Usado em protocolos legados e arquivos binários.',
    example: `buf.toString('latin1')    // protocolo legado
buf.toString('binary')    // alias de latin1`,
  },
]

const CONCEPTS = [
  { icon: Binary, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Dados Binários', desc: 'Buffers representam sequências brutas de bytes — a forma como os computadores armazenam e transferem dados.' },
  { icon: Hash, color: 'text-[#29e0a9]', bg: 'bg-[#29e0a9]/10', label: 'Tamanho Fixo', desc: 'Um Buffer tem tamanho imutável. Para alterar o tamanho, crie um novo Buffer com Buffer.concat() ou slice.' },
  { icon: Layers, color: 'text-[#9956f6]', bg: 'bg-[#9956f6]/10', label: 'View sobre ArrayBuffer', desc: 'Buffer herda de Uint8Array — é uma view sobre um ArrayBuffer compartilhado com a Web Crypto API.' },
  { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'allocUnsafe', desc: "Buffer.allocUnsafe() é mais rápido mas pode vazar dados de memória. Só use quando for escrever todos os bytes antes de ler." },
]

export function BuffersPage() {
  const [activeTab, setActiveTab] = useState<CreationTab>('Buffer.from()')

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-sm font-medium text-[#a8a8b3] hidden sm:block">Buffers</h1>
          <Link
            to="/streams"
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
          <div className="inline-flex items-center gap-2 bg-orange-400/10 border border-orange-400/20 rounded-full px-3 py-1">
            <HardDrive className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold">Módulo 3 · Módulos Nativos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-orange-300 via-amber-400 to-[#9956f6] bg-clip-text text-transparent">
              Buffers
            </span>
          </h1>
          <p className="text-[#7c7c8a] text-lg max-w-2xl leading-relaxed">
            Antes de HTTP, arquivos e streams, há bytes. O{' '}
            <code className="text-orange-300 bg-orange-400/10 px-1.5 py-0.5 rounded text-base">Buffer</code>{' '}
            é a forma do Node.js manipular dados binários brutos — a base de toda I/O no runtime.
          </p>
        </motion.div>

        {/* what is a buffer visual */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">O que é um Buffer?</h2>
          <div className="bg-[#121214] border border-[#29292e] rounded-2xl p-6 space-y-5">
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              Um Buffer é uma sequência contígua de bytes na memória, com tamanho fixo. Pense nele como um array de números de 0 a 255 — cada posição representa um byte.
            </p>

            {/* byte visualization */}
            <div className="space-y-2">
              <p className="text-[#505059] text-xs font-mono">Buffer.from('Hello')</p>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { char: 'H', hex: '48', dec: 72 },
                  { char: 'e', hex: '65', dec: 101 },
                  { char: 'l', hex: '6c', dec: 108 },
                  { char: 'l', hex: '6c', dec: 108 },
                  { char: 'o', hex: '6f', dec: 111 },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="flex flex-col items-center bg-[#202024] border border-[#29292e] rounded-lg px-3 py-2 min-w-[52px]"
                  >
                    <span className="text-white font-mono font-bold text-sm">{b.char}</span>
                    <span className="text-orange-400 font-mono text-xs">0x{b.hex}</span>
                    <span className="text-[#505059] font-mono text-xs">{b.dec}</span>
                  </motion.div>
                ))}
                <div className="flex items-center text-[#505059] text-xs font-mono self-center px-2">→ 5 bytes</div>
              </div>
            </div>

            <CodeHighlight code={`const buf = Buffer.from('Hello')
console.log(buf)        // <Buffer 48 65 6c 6c 6f>
console.log(buf.length) // 5
console.log(buf[0])     // 72 (código ASCII de 'H')
console.log(buf.toString()) // 'Hello'`} />
          </div>
        </motion.section>

        {/* creation tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Como criar Buffers</h2>
          <div className="flex gap-1 bg-[#121214] border border-[#29292e] rounded-xl p-1 w-fit flex-wrap">
            {CREATION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-[#7c7c8a] hover:text-[#a8a8b3]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-[#121214] border border-[#29292e] rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#29292e]">
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{CREATION_CODE[activeTab].description}</p>
              </div>
              <CodeHighlight code={CREATION_CODE[activeTab].code} />
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* encodings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Encodings</h2>
          <p className="text-[#7c7c8a] text-sm">
            O encoding define como bytes são convertidos para e de strings. Use{' '}
            <code className="text-[#a8a8b3] bg-[#202024] px-1 rounded">buf.toString(encoding)</code> e{' '}
            <code className="text-[#a8a8b3] bg-[#202024] px-1 rounded">Buffer.from(str, encoding)</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENCODINGS.map((enc) => (
              <div
                key={enc.name}
                className={`bg-[#121214] border border-[#29292e] rounded-xl p-4 space-y-2`}
              >
                <span className={`inline-block font-mono text-xs font-bold ${enc.color} ${enc.bg} border ${enc.border} px-2 py-1 rounded`}>
                  {enc.name}
                </span>
                <p className="text-[#7c7c8a] text-xs leading-relaxed">{enc.desc}</p>
                <pre className="text-xs text-[#505059] font-mono leading-relaxed">{enc.example}</pre>
              </div>
            ))}
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
            to="/streams"
            className="flex items-center gap-2 bg-[#121214] border border-[#29292e] hover:border-[#505059] rounded-xl px-5 py-3 text-sm text-[#a8a8b3] hover:text-white transition-colors group"
          >
            <Layers className="w-4 h-4 text-[#505059] group-hover:text-[#a8a8b3] transition-colors" />
            Streams
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
