import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Waves, ArrowRight, Filter, Zap, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'
import { CodeHighlight } from '../components/CodeHighlight'

const STREAM_TYPES = [
  {
    id: 'readable',
    label: 'Readable',
    subtitle: 'Fonte de dados',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    activeBg: 'bg-sky-500/20',
    activeBorder: 'border-sky-500/30',
    description: 'Emite chunks de dados que podem ser consumidos. Exemplos nativos: fs.createReadStream, http.IncomingMessage, process.stdin.',
    code: `import { Readable } from 'node:stream'
import { createReadStream } from 'node:fs'

// consumir stream de arquivo
const fileStream = createReadStream('./large.csv', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024, // chunks de 64 KB
})

// modo flowing — event-driven
fileStream.on('data',  (chunk) => process(chunk))
fileStream.on('end',   ()      => console.log('leitura concluída'))
fileStream.on('error', (err)   => console.error(err))

// modo paused — controle manual
fileStream.pause()
fileStream.resume()

// criar Readable customizado
const counter = new Readable({
  read() {
    for (let i = 0; i < 5; i++) {
      this.push(\`item \${i}\\n\`)
    }
    this.push(null) // sinaliza o fim da stream
  }
})

// usando for await...of (mais idiomático)
for await (const chunk of fileStream) {
  processChunk(chunk)
}`,
  },
  {
    id: 'writable',
    label: 'Writable',
    subtitle: 'Destino de dados',
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    border: 'border-[#29e0a9]/20',
    activeBg: 'bg-[#29e0a9]/20',
    activeBorder: 'border-[#29e0a9]/30',
    description: 'Recebe e persiste dados. Exemplos nativos: fs.createWriteStream, http.ServerResponse, process.stdout.',
    code: `import { Writable } from 'node:stream'
import { createWriteStream } from 'node:fs'

// escrever em arquivo
const fileOut = createWriteStream('./output.log', { flags: 'a' })

fileOut.write('linha 1\\n')
fileOut.write('linha 2\\n')
fileOut.end('fim do arquivo\\n', () => {
  console.log('gravação concluída')
})

// backpressure — respeite o sinal de pausa
function writeWithBackpressure(stream, data) {
  const canContinue = stream.write(data)
  if (!canContinue) {
    // espera o drain antes de continuar
    stream.once('drain', () => writeMore())
  }
}

// Writable customizado
const collector = new Writable({
  write(chunk, encoding, callback) {
    console.log('recebido:', chunk.toString())
    callback() // sinaliza que o chunk foi processado
  }
})

collector.write('hello')
collector.write('world')
collector.end()`,
  },
  {
    id: 'transform',
    label: 'Transform',
    subtitle: 'Readable + Writable',
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    border: 'border-[#9956f6]/20',
    activeBg: 'bg-[#9956f6]/20',
    activeBorder: 'border-[#9956f6]/30',
    description: 'Lê, transforma e re-emite dados. É ao mesmo tempo Readable e Writable. Usado para compressão, parsing, criptografia.',
    code: `import { Transform, pipeline } from 'node:stream'
import { createGzip, createGunzip } from 'node:zlib'
import { createReadStream, createWriteStream } from 'node:fs'
import { promisify } from 'node:util'

const pipelineAsync = promisify(pipeline)

// Transform customizado — converte para maiúsculas
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

// pipeline: lê → transforma → escreve
await pipelineAsync(
  createReadStream('./input.txt'),
  upperCase,
  createWriteStream('./output.txt'),
)

// compressão com zlib (Transform nativo)
await pipelineAsync(
  createReadStream('./big-file.json'),
  createGzip(),         // Transform que comprime
  createWriteStream('./big-file.json.gz'),
)

// descompressão
await pipelineAsync(
  createReadStream('./big-file.json.gz'),
  createGunzip(),
  createWriteStream('./big-file.restored.json'),
)`,
  },
] as const

type StreamTypeId = (typeof STREAM_TYPES)[number]['id']

const READ_FILE_CODE = `// arquivo de 2 GB → 2 GB na RAM
const data = await readFile('./huge.csv')
const text = data.toString()
processAll(text)

// problema: pode explodir a memória
// e travar o Event Loop por segundos`

const STREAM_READ_CODE = `// arquivo de 2 GB → ~64 KB de uso de RAM
const stream = createReadStream('./huge.csv')

for await (const chunk of stream) {
  processChunk(chunk)
}

// Event Loop nunca fica bloqueado
// memória constante independente do tamanho`

const PIPELINE_CODE = `import { pipeline } from 'node:stream/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'

// pipeline propaga erros e faz cleanup automaticamente
await pipeline(
  createReadStream('./video.mp4'),
  createGzip(),
  createWriteStream('./video.mp4.gz'),
)

// equivalente com .pipe() — EVITE (erros não propagam)
readStream.pipe(gzip).pipe(writeStream) // ❌`

const CONCEPTS = [
  {
    icon: Waves,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    label: 'Processamento Incremental',
    desc: 'Streams processam dados em chunks — nunca carregam o arquivo inteiro na memória. Fundamental para arquivos grandes.',
  },
  {
    icon: ArrowRight,
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    label: 'pipeline()',
    desc: 'Use sempre pipeline() em vez de .pipe() — ele propaga erros corretamente e faz o cleanup das streams em caso de falha.',
  },
  {
    icon: Filter,
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    label: 'Backpressure',
    desc: 'Quando o Writable não consegue consumir rápido o suficiente, sinaliza pausa para o Readable — evita estourar a memória.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    label: 'for await...of',
    desc: 'Readable implementa AsyncIterator — use for await...of para consumir streams de forma elegante sem gerenciar eventos manualmente.',
  },
]

export function StreamsPage() {
  const [activeId, setActiveId] = useState<StreamTypeId>('readable')
  const active = STREAM_TYPES.find((s) => s.id === activeId)!

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-sm font-medium text-[#a8a8b3] hidden sm:block">Streams</h1>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-[#7c7c8a] hover:text-white transition"
          >
            Início <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="inline-flex items-center gap-2 bg-sky-400/10 border border-sky-400/20 rounded-full px-3 py-1">
            <Waves className="w-3 h-3 text-sky-400" />
            <span className="text-sky-400 text-xs font-semibold">Módulo 3 · Módulos Nativos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-sky-300 via-[#9956f6] to-[#29e0a9] bg-clip-text text-transparent">
              Streams
            </span>
          </h1>
          <p className="text-[#7c7c8a] text-lg max-w-2xl leading-relaxed">
            Streams processam dados em pedaços (chunks) sem carregar tudo na memória. São a razão pela qual o Node.js pode processar um arquivo de 10 GB com apenas alguns megabytes de RAM.
          </p>
        </motion.div>

        {/* readFile vs stream comparison */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Por que usar Streams?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* readFile */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-red-500/10 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-semibold">readFile — carrega tudo na memória</span>
              </div>
              <CodeHighlight code={READ_FILE_CODE} border="border-red-500/10" />
            </div>
            {/* stream */}
            <div className="bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#29e0a9]/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#29e0a9]" />
                <span className="text-[#29e0a9] text-xs font-semibold">Stream — chunks de 64 KB na memória</span>
              </div>
              <CodeHighlight code={STREAM_READ_CODE} border="border-[#29e0a9]/10" />
            </div>
          </div>
        </motion.section>

        {/* stream types */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Tipos de Stream</h2>
          <div className="flex gap-2 flex-wrap">
            {STREAM_TYPES.map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveId(st.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  activeId === st.id
                    ? `${st.activeBg} ${st.color} border ${st.activeBorder}`
                    : 'bg-[#121214] text-[#7c7c8a] border-[#29292e] hover:border-[#505059] hover:text-[#a8a8b3]'
                }`}
              >
                <span className="font-mono font-bold">{st.label}</span>
                <span className={`text-xs ${activeId === st.id ? 'opacity-70' : 'text-[#505059]'}`}>{st.subtitle}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-[#121214] border border-[#29292e] rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#29292e]">
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{active.description}</p>
              </div>
              <CodeHighlight code={active.code} />
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* pipeline visual */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Pipeline — componha streams</h2>
          <div className="bg-[#121214] border border-[#29292e] rounded-2xl p-6 space-y-5">
            {/* visual pipeline */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Readable', sub: 'createReadStream', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
                null,
                { label: 'Transform', sub: 'createGzip', color: 'text-[#9956f6]', bg: 'bg-[#9956f6]/10', border: 'border-[#9956f6]/20' },
                null,
                { label: 'Writable', sub: 'createWriteStream', color: 'text-[#29e0a9]', bg: 'bg-[#29e0a9]/10', border: 'border-[#29e0a9]/20' },
              ].map((item, i) =>
                item === null ? (
                  <ArrowRight key={i} className="w-4 h-4 text-[#505059] shrink-0" />
                ) : (
                  <div key={i} className={`${item.bg} border ${item.border} rounded-xl px-4 py-2.5 text-center`}>
                    <div className={`font-mono font-bold text-xs ${item.color}`}>{item.label}</div>
                    <div className="text-[#505059] text-xs mt-0.5">{item.sub}</div>
                  </div>
                )
              )}
            </div>

            <CodeHighlight code={PIPELINE_CODE} />
          </div>
        </motion.section>

        {/* backpressure */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="bg-[#9956f6]/5 border border-[#9956f6]/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#b585fb]" />
              <span className="text-[#b585fb] font-semibold text-sm">Entendendo Backpressure</span>
            </div>
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              Quando o Readable produz dados mais rápido do que o Writable pode consumir, o buffer interno enche. O mecanismo de backpressure sinaliza ao Readable para pausar — evitando estourar a memória. <code className="text-[#b585fb] bg-[#9956f6]/10 px-1 rounded">pipeline()</code> gerencia isso automaticamente. Com <code className="text-[#b585fb] bg-[#9956f6]/10 px-1 rounded">.write()</code> manual, observe o valor de retorno: <code className="text-[#b585fb] bg-[#9956f6]/10 px-1 rounded">false</code> significa "pare de escrever e espere o evento drain".
            </p>
          </div>
        </motion.section>

        {/* concept cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 26 }}
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

        {/* footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t border-[#29292e] pt-8 flex justify-between items-center"
        >
          <Link
            to="/buffers"
            className="flex items-center gap-2 text-sm text-[#505059] hover:text-[#7c7c8a] transition"
          >
            ← Buffers
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 bg-[#29e0a9]/10 border border-[#29e0a9]/20 hover:bg-[#29e0a9]/20 rounded-xl px-5 py-3 text-sm text-[#29e0a9] transition-colors"
          >
            Ver todos os módulos →
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
