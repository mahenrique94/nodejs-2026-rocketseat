import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Code2, Package, Link as LinkIcon, Cpu, RefreshCcw, Server,
  Layers, ScanSearch, Zap, Play, Pause, RotateCcw,
  Lightbulb, XCircle, CheckCircle2,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'
import { CodeHighlight } from '../components/CodeHighlight'

// ─── types ────────────────────────────────────────────────────────────────────

type LayerId = 'user-code' | 'node-apis' | 'bindings' | 'v8' | 'libuv' | 'os'

interface FlowStep {
  activeLayer: LayerId | null
  title: string
  description: string
  tip: string | null
}

interface Thread {
  id: number
  state: 'idle' | 'busy' | 'done'
  task: string | null
}

// ─── data ─────────────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ className?: string }>

const LAYERS: {
  id: LayerId
  label: string
  sublabel: string
  color: string
  border: string
  glow: string
  text: string
  Icon: LucideIcon
  description: string
  detail: string
}[] = [
  {
    id: 'user-code',
    label: 'Seu Código JavaScript',
    sublabel: 'app.js, index.js...',
    color: 'bg-[#9956f6]/15',
    border: 'border-[#9956f6]/40',
    glow: 'shadow-[0_0_24px_rgba(153,86,246,0.3)]',
    text: 'text-[#b585fb]',
    Icon: Code2,
    description: 'Onde tudo começa',
    detail:
      'Você escreve JavaScript. O V8 compila e executa. Quando você chama funções assíncronas como fs.readFile() ou setTimeout(), não está bloqueando — está delegando o trabalho para as camadas abaixo.',
  },
  {
    id: 'node-apis',
    label: 'Node.js APIs',
    sublabel: 'fs · http · crypto · path · os · stream...',
    color: 'bg-sky-500/15',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_0_24px_rgba(14,165,233,0.3)]',
    text: 'text-sky-300',
    Icon: Package,
    description: 'Módulos nativos',
    detail:
      'Node.js expõe módulos nativos escritos em JavaScript que se comunicam com o C++ por baixo dos panos. São eles: fs (arquivos), http/https (rede), crypto (criptografia), stream (fluxo de dados), entre outros.',
  },
  {
    id: 'bindings',
    label: 'Node.js Bindings',
    sublabel: 'C++ Bridge · node_file.cc · node_crypto.cc...',
    color: 'bg-[#323238]/60',
    border: 'border-[#505059]/60',
    glow: 'shadow-[0_0_24px_rgba(80,80,89,0.4)]',
    text: 'text-[#a8a8b3]',
    Icon: LinkIcon,
    description: 'Ponte JavaScript ↔ C++',
    detail:
      'Os Bindings são arquivos C++ que usam a API do V8 para expor funcionalidades nativas ao JavaScript. Por exemplo, node_file.cc implementa o módulo fs. É aqui que o mundo JS e o mundo C++ se encontram.',
  },
  {
    id: 'v8',
    label: 'V8 Engine',
    sublabel: 'JIT Compiler · Garbage Collector · Heap',
    color: 'bg-red-500/15',
    border: 'border-red-500/40',
    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.3)]',
    text: 'text-red-300',
    Icon: Cpu,
    description: 'Motor JavaScript do Google',
    detail:
      'O V8 é o motor JS do Chrome, embutido no Node.js. Ele compila JavaScript diretamente para código de máquina nativo (JIT), gerencia a memória via garbage collection e executa tudo em uma única thread. É rápido porque nunca interpreta — sempre compila.',
  },
  {
    id: 'libuv',
    label: 'libuv',
    sublabel: 'Event Loop · Thread Pool · Async I/O',
    color: 'bg-[#29e0a9]/15',
    border: 'border-[#29e0a9]/40',
    glow: 'shadow-[0_0_24px_rgba(41,224,169,0.3)]',
    text: 'text-[#29e0a9]',
    Icon: RefreshCcw,
    description: 'O coração não-bloqueante',
    detail:
      'libuv é uma biblioteca C multiplataforma que dá ao Node.js seus superpoderes. Ela implementa o Event Loop, gerencia um Thread Pool com 4 workers (por padrão), e abstrai I/O assíncrono para Linux (epoll), macOS (kqueue) e Windows (IOCP).',
  },
  {
    id: 'os',
    label: 'Sistema Operacional',
    sublabel: 'Kernel · epoll · kqueue · IOCP · Disco · Rede',
    color: 'bg-[#29292e]/60',
    border: 'border-[#505059]/40',
    glow: 'shadow-[0_0_24px_rgba(41,41,46,0.6)]',
    text: 'text-[#7c7c8a]',
    Icon: Server,
    description: 'A camada mais baixa',
    detail:
      'O kernel do sistema operacional executa as chamadas de sistema reais: ler um arquivo do disco, abrir sockets de rede, resolver DNS. O libuv usa epoll no Linux, kqueue no macOS e IOCP no Windows para notificações de I/O assíncrono do próprio kernel.',
  },
]

const FLOW_STEPS: FlowStep[] = [
  {
    activeLayer: null,
    title: 'Rastreando uma leitura de arquivo',
    description:
      'Vamos acompanhar o caminho completo de fs.readFile("dados.txt", callback) através de todas as camadas do Node.js — do seu código até o Sistema Operacional e de volta.',
    tip: 'Clique em "Próximo" para começar ou em qualquer camada para explorar.',
  },
  {
    activeLayer: 'user-code',
    title: '1. Seu código chama fs.readFile()',
    description:
      'fs.readFile("dados.txt", callback) entra na Call Stack. O V8 executa essa linha — mas ela não lê o arquivo! Ela apenas registra a intenção de leitura e retorna imediatamente.',
    tip: 'O código síncrono continua executando na mesma thread enquanto a leitura acontece em paralelo.',
  },
  {
    activeLayer: 'node-apis',
    title: '2. O módulo fs recebe a chamada',
    description:
      'O módulo nativo fs do Node.js processa a requisição. Ele valida os parâmetros (caminho, encoding, callback) e repassa para a camada de Bindings C++.',
    tip: 'O módulo fs é escrito em JavaScript, mas logo aciona código C++ nativo.',
  },
  {
    activeLayer: 'bindings',
    title: '3. Bindings C++ fazem a ponte',
    description:
      'O arquivo node_file.cc recebe a requisição. Aqui o mundo JavaScript encontra o mundo C++. Os Bindings criam uma requisição nativa e a entregam ao libuv.',
    tip: 'Este é o "buraco de coelho" — do JS puro para C++ nativo de alta performance.',
  },
  {
    activeLayer: 'libuv',
    title: '4. libuv recebe e decide a estratégia',
    description:
      'libuv recebe a requisição de leitura. Para I/O de arquivo (disco), ele usa o Thread Pool — pois o sistema de arquivos não tem suporte nativo a I/O assíncrono em todos os OSes. Para rede (sockets), usa I/O assíncrono direto do kernel.',
    tip: 'Operações que usam Thread Pool: arquivo, DNS, crypto, zlib. Rede usa I/O assíncrono do kernel.',
  },
  {
    activeLayer: 'os',
    title: '5. Thread do pool lê o arquivo no OS',
    description:
      'Uma das 4 threads do pool faz a chamada bloqueante ao sistema operacional: read(fd, buffer, size). Essa thread fica bloqueada aguardando o disco, mas a thread principal (Event Loop) continua livre.',
    tip: 'Isso é o segredo do Node.js: bloquear threads do pool, nunca a thread principal.',
  },
  {
    activeLayer: 'libuv',
    title: '6. Event Loop segue livre enquanto aguarda',
    description:
      'Enquanto a thread do pool aguarda o disco, o Event Loop continua processando: executando outros callbacks, respondendo requisições HTTP, processando timers. O Node.js nunca para.',
    tip: 'Esta é a essência do modelo não-bloqueante — a thread principal jamais espera.',
  },
  {
    activeLayer: 'libuv',
    title: '7. Thread notifica o Event Loop',
    description:
      'A leitura terminou! A thread do pool posta o resultado na fila de eventos do libuv. O Event Loop, na sua fase de I/O poll, detecta que há resultados prontos.',
    tip: 'O libuv usa uma fila interna (uv__io_poll) para comunicar threads com o Event Loop.',
  },
  {
    activeLayer: 'node-apis',
    title: '8. Resultado volta pela cadeia',
    description:
      'O dado do arquivo sobe: libuv → Bindings C++ → módulo fs. O fs monta o objeto de resposta JavaScript com o conteúdo do arquivo e prepara o callback para ser invocado.',
    tip: 'Os Bindings convertem dados C++ (buffers nativos) para objetos JavaScript do V8.',
  },
  {
    activeLayer: 'user-code',
    title: '9. Seu callback é executado',
    description:
      'O callback entra na Call Stack e executa com os dados do arquivo. Todo o ciclo foi assíncrono e não-bloqueante. Sua aplicação respondeu a outras requisições durante todo esse tempo.',
    tip: null,
  },
]

const POOL_TASKS = [
  { id: 1, label: 'fs.readFile()', color: 'bg-sky-500' },
  { id: 2, label: 'crypto.hash()', color: 'bg-[#9956f6]' },
  { id: 3, label: 'dns.lookup()', color: 'bg-amber-500' },
  { id: 4, label: 'zlib.gzip()', color: 'bg-pink-500' },
  { id: 5, label: 'fs.writeFile()', color: 'bg-sky-500' },
]

// ─── architecture diagram ─────────────────────────────────────────────────────

function ArchitectureDiagram({
  activeLayer,
  selectedLayer,
  onSelect,
}: {
  activeLayer: LayerId | null
  selectedLayer: LayerId | null
  onSelect: (id: LayerId) => void
}) {
  const v8Layer    = LAYERS.find((l) => l.id === 'v8')!
  const libuvLayer = LAYERS.find((l) => l.id === 'libuv')!
  const topLayers  = LAYERS.filter((l) => l.id !== 'v8' && l.id !== 'libuv')

  const highlight = (id: LayerId) => activeLayer === id || selectedLayer === id

  function LayerRow({ layer }: { layer: (typeof LAYERS)[0] }) {
    const lit = highlight(layer.id)
    return (
      <button
        onClick={() => onSelect(layer.id)}
        className={`
          w-full text-left rounded-xl border px-4 py-3 transition-all duration-300 cursor-pointer
          ${lit
            ? `${layer.color} ${layer.border} ${layer.glow}`
            : 'bg-[#121214] border-[#29292e] hover:bg-[#202024] hover:border-[#323238]'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <layer.Icon className="w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <p className={`text-xs font-bold truncate transition-colors ${lit ? layer.text : 'text-[#7c7c8a]'}`}>
              {layer.label}
            </p>
            <p className={`text-[10px] truncate transition-colors ${lit ? 'text-[#505059]' : 'text-[#323238]'}`}>
              {layer.sublabel}
            </p>
          </div>
          {lit && (
            <span className={`ml-auto shrink-0 w-2 h-2 rounded-full ${layer.text.replace('text-', 'bg-')} animate-pulse`} />
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {topLayers.slice(0, 3).map((layer, i) => (
        <div key={layer.id}>
          <LayerRow layer={layer} />
          {i < 2 && (
            <div className="flex justify-center my-1">
              <span className="text-[#323238] text-xs">↓</span>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-center my-1">
        <span className="text-[#323238] text-xs">↓</span>
      </div>

      {/* V8 + libuv side by side */}
      <div className="flex gap-2">
        {[v8Layer, libuvLayer].map((layer) => {
          const lit = highlight(layer.id)
          return (
            <button
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`
                flex-1 text-left rounded-xl border px-3 py-3 transition-all duration-300 cursor-pointer
                ${lit
                  ? `${layer.color} ${layer.border} ${layer.glow}`
                  : 'bg-[#121214] border-[#29292e] hover:bg-[#202024] hover:border-[#323238]'
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <layer.Icon className="w-4 h-4" />
                {lit && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${layer.text.replace('text-', 'bg-')} animate-pulse`} />}
              </div>
              <p className={`text-xs font-bold transition-colors ${lit ? layer.text : 'text-[#7c7c8a]'}`}>
                {layer.id === 'v8' ? 'V8' : 'libuv'}
              </p>
              <p className="text-[10px] text-[#323238] truncate">
                {layer.id === 'v8' ? 'Engine' : 'Event Loop + Pool'}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-center my-1">
        <span className="text-[#323238] text-xs">↓</span>
      </div>
      <LayerRow layer={LAYERS.find((l) => l.id === 'os')!} />
    </div>
  )
}

// ─── layer detail panel ───────────────────────────────────────────────────────

function LayerDetail({ id }: { id: LayerId }) {
  const layer = LAYERS.find((l) => l.id === id)!
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`rounded-xl border p-5 ${layer.color} ${layer.border}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            initial={{ scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <layer.Icon className={`w-5 h-5 ${layer.text}`} />
          </motion.div>
          <div>
            <h4 className={`font-bold text-sm ${layer.text}`}>{layer.label}</h4>
            <p className="text-[#505059] text-xs">{layer.description}</p>
          </div>
        </div>
        <p className="text-[#a8a8b3] text-sm leading-6">{layer.detail}</p>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── thread pool visualizer ───────────────────────────────────────────────────

function ThreadPoolSection() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: 1, state: 'idle', task: null },
    { id: 2, state: 'idle', task: null },
    { id: 3, state: 'idle', task: null },
    { id: 4, state: 'idle', task: null },
  ])
  const [queue, setQueue] = useState(POOL_TASKS)
  const [done, setDone] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function reset() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setThreads([
      { id: 1, state: 'idle', task: null },
      { id: 2, state: 'idle', task: null },
      { id: 3, state: 'idle', task: null },
      { id: 4, state: 'idle', task: null },
    ])
    setQueue(POOL_TASKS)
    setDone([])
    setRunning(false)
  }

  function simulate() {
    if (running) return
    setRunning(true)
    const tasks = [...POOL_TASKS]
    const THREAD_COUNT = 4

    const firstBatch = tasks.splice(0, THREAD_COUNT)
    setThreads(
      Array.from({ length: THREAD_COUNT }, (_, i) => ({
        id: i + 1,
        state: 'busy' as const,
        task: firstBatch[i]?.label ?? null,
      })),
    )
    setQueue(tasks)

    firstBatch.forEach((task, i) => {
      const delay = 1000 + i * 600
      const t = setTimeout(() => {
        setThreads((prev) =>
          prev.map((th) => th.id === i + 1 ? { ...th, state: 'done', task: th.task } : th),
        )
        setDone((prev) => [...prev, task.label])

        if (tasks.length > 0) {
          const next = tasks.shift()!
          setQueue([...tasks])
          const t2 = setTimeout(() => {
            setThreads((prev) =>
              prev.map((th) => th.id === i + 1 ? { ...th, state: 'busy', task: next.label } : th),
            )
            const t3 = setTimeout(() => {
              setThreads((prev) =>
                prev.map((th) => th.id === i + 1 ? { ...th, state: 'done', task: th.task } : th),
              )
              setDone((prev) => [...prev, next.label])
            }, 1400)
            timersRef.current.push(t3)
          }, 400)
          timersRef.current.push(t2)
        }
      }, delay)
      timersRef.current.push(t)
    })
  }

  const stateLabel: Record<Thread['state'], string> = {
    idle: 'Aguardando',
    busy: 'Trabalhando',
    done: 'Concluído',
  }
  const stateColor: Record<Thread['state'], string> = {
    idle: 'border-[#29292e] bg-[#121214] text-[#505059]',
    busy: 'border-[#29e0a9]/40 bg-[#29e0a9]/10 text-[#29e0a9]',
    done: 'border-[#9956f6]/40 bg-[#9956f6]/10 text-[#b585fb]',
  }

  return (
    <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-white/50" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Thread Pool</h3>
            <p className="text-[#505059] text-xs mt-0.5">UV_THREADPOOL_SIZE = 4 (padrão)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-[#7c7c8a] hover:text-white transition cursor-pointer"
            title="Reiniciar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={simulate}
            disabled={running}
            className="px-4 py-2 rounded-xl bg-[#29e0a9]/15 hover:bg-[#29e0a9]/25 disabled:opacity-40 disabled:cursor-not-allowed border border-[#29e0a9]/30 text-[#29e0a9] text-xs font-semibold transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              {running ? 'Simulando...' : 'Simular'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        <div>
          <p className="text-xs font-bold text-[#505059] uppercase tracking-widest mb-3">Fila de Tarefas</p>
          <div className="space-y-2 min-h-[120px]">
            {queue.length === 0 && running && (
              <p className="text-[#505059] text-xs italic">fila vazia</p>
            )}
            <AnimatePresence>
              {queue.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`px-3 py-2 rounded-lg ${t.color}/15 border border-current text-xs font-mono font-semibold ${t.color.replace('bg-', 'text-')}`}
                >
                  {t.label}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#505059] uppercase tracking-widest mb-3">Workers (4 Threads)</p>
          <div className="space-y-2">
            {threads.map((th) => (
              <div
                key={th.id}
                className={`rounded-xl border px-3 py-2.5 transition-all duration-400 ${stateColor[th.state]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">Thread {th.id}</span>
                  <span className={`text-[10px] font-semibold ${th.state === 'busy' ? 'animate-pulse' : ''}`}>
                    {stateLabel[th.state]}
                  </span>
                </div>
                {th.task && (
                  <p className="text-[10px] font-mono mt-1 opacity-70 truncate">{th.task}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#505059] uppercase tracking-widest mb-3">→ Event Loop</p>
          <div className="space-y-2 min-h-[120px]">
            {done.length === 0 && (
              <p className="text-[#505059] text-xs italic">aguardando resultados...</p>
            )}
            <AnimatePresence>
              {done.map((label, i) => (
                <motion.div
                  key={label + i}
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="px-3 py-2 rounded-lg bg-[#9956f6]/15 border border-[#9956f6]/30 text-[#b585fb] text-xs font-mono"
                >
                  ✓ {label}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="text-[#505059] text-xs text-center">
        Operações de arquivo, crypto, DNS e zlib usam o thread pool. Sockets de rede usam I/O assíncrono direto do kernel.
      </p>
    </div>
  )
}

// ─── concept cards ────────────────────────────────────────────────────────────

function ConceptCards() {
  const cards = [
    { Icon: Cpu,        title: 'V8 Engine',       color: 'border-red-500/30 bg-red-500/5',        tc: 'text-red-300',    ic: 'text-red-300',    body: 'Compila JavaScript para código de máquina (JIT). Gerencia memória com garbage collection. Opera em uma única thread — o que torna o Event Loop possível.' },
    { Icon: RefreshCcw, title: 'libuv',            color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',   tc: 'text-[#29e0a9]',  ic: 'text-[#29e0a9]',  body: 'Biblioteca C que implementa o Event Loop e o Thread Pool. Abstrai as diferenças de I/O assíncrono entre Linux, macOS e Windows.' },
    { Icon: Cpu,        title: 'Thread Pool',      color: 'border-amber-500/30 bg-amber-500/5',    tc: 'text-amber-400',  ic: 'text-amber-400',  body: '4 threads de trabalho (padrão). Usadas para operações que não têm suporte a I/O assíncrono nativo: leitura de arquivo, crypto, DNS, zlib.' },
    { Icon: Zap,        title: 'Non-blocking I/O', color: 'border-[#9956f6]/30 bg-[#9956f6]/5',   tc: 'text-[#b585fb]',  ic: 'text-[#b585fb]',  body: 'A thread principal nunca aguarda. Enquanto uma thread do pool lê um arquivo, o Event Loop processa outras requisições. Isso é o que torna o Node.js escalável.' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
      {cards.map(({ Icon, title, color, tc, ic, body }) => (
        <div key={title} className={`rounded-xl border p-5 ${color}`}>
          <Icon className={`w-5 h-5 mb-3 ${ic}`} />
          <h4 className={`font-bold text-sm mb-2 ${tc}`}>{title}</h4>
          <p className="text-[#a8a8b3] text-sm leading-6">{body}</p>
        </div>
      ))}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function NodeArchitecturePage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = FLOW_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === FLOW_STEPS.length - 1

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= FLOW_STEPS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying])

  function prev() { if (!isFirst) { setStepIndex((s) => s - 1); setSelectedLayer(null) } }
  function next() { if (!isLast) { setStepIndex((s) => s + 1); setSelectedLayer(null) } }
  function reset() { setStepIndex(0); setIsPlaying(false); setSelectedLayer(null) }
  function togglePlay() {
    if (isLast) { reset(); setIsPlaying(true) } else setIsPlaying((p) => !p)
  }

  function handleLayerSelect(id: LayerId) {
    setSelectedLayer((prev) => (prev === id ? null : id))
    setIsPlaying(false)
  }

  const displayedLayer = selectedLayer ?? step.activeLayer

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Arquitetura do Node.js
          </h1>
          <Link
            to="/node-event-loop-call-stack"
            className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block"
          >
            Event Loop →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* hero */}
        <div className="text-center space-y-2 pb-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#29e0a9] via-[#9956f6] to-[#e254ff] bg-clip-text text-transparent">
            O que tem dentro do Node.js?
          </h2>
          <p className="text-[#7c7c8a] text-sm max-w-2xl mx-auto">
            Node.js não é apenas JavaScript. Ele é uma combinação de V8, libuv, bindings C++ e APIs nativas que trabalham juntos para criar um ambiente de execução não-bloqueante.
          </p>
        </div>

        {/* main: architecture + flow */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* architecture diagram */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-white/50" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Camadas da Arquitetura</h3>
              </div>
              <ArchitectureDiagram
                activeLayer={step.activeLayer}
                selectedLayer={selectedLayer}
                onSelect={handleLayerSelect}
              />
              <p className="text-[#323238] text-[10px] mt-3 text-center">
                clique em uma camada para explorar
              </p>
            </div>

            {displayedLayer && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <LayerDetail id={displayedLayer} />
              </div>
            )}
          </div>

          {/* flow steps */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ScanSearch className="w-4 h-4 text-white/50" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                  Rastreando fs.readFile()
                </h3>
                <span className="ml-auto text-xs text-[#505059]">
                  {stepIndex + 1} / {FLOW_STEPS.length}
                </span>
              </div>

              {/* step card */}
              <div className="relative overflow-hidden rounded-xl border border-[#29292e] bg-[#09090a] mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9956f6]/5 to-[#29e0a9]/5 pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-4"
                  >
                    <h4 className="text-white font-bold text-sm sm:text-base mb-2">{step.title}</h4>
                    <p className="text-[#a8a8b3] text-sm leading-relaxed">{step.description}</p>
                    {step.tip && (
                      <div className="mt-3 flex items-start gap-2 bg-[#202024] rounded-lg px-3 py-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[#7c7c8a] text-xs leading-relaxed">{step.tip}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* progress bar */}
              <div className="w-full bg-[#29292e] rounded-full h-1 mb-4 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#29e0a9] to-[#9956f6] h-1 rounded-full"
                  animate={{ width: `${(stepIndex / (FLOW_STEPS.length - 1)) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>

              {/* controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-[#7c7c8a] hover:text-white transition cursor-pointer shrink-0"
                  title="Reiniciar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={prev}
                  disabled={isFirst}
                  whileHover={!isFirst ? { scale: 1.04 } : {}}
                  whileTap={!isFirst ? { scale: 0.96 } : {}}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-white disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer text-xs font-medium"
                >
                  ← Anterior
                </motion.button>
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold text-xs border transition cursor-pointer
                    ${isPlaying
                      ? 'bg-white/10 border-[#29292e] text-white'
                      : 'bg-[#9956f6] border-[#8234e9] text-white'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : isLast ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pausar' : isLast ? 'Reiniciar' : 'Reproduzir'}
                  </span>
                </motion.button>
                <motion.button
                  onClick={next}
                  disabled={isLast}
                  whileHover={!isLast ? { scale: 1.04 } : {}}
                  whileTap={!isLast ? { scale: 0.96 } : {}}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-white disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer text-xs font-medium"
                >
                  Próximo →
                </motion.button>
              </div>

              {/* step dots */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {FLOW_STEPS.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => { setStepIndex(i); setIsPlaying(false); setSelectedLayer(null) }}
                    animate={{
                      width: i === stepIndex ? 16 : 6,
                      backgroundColor: i === stepIndex ? '#9956f6' : i < stepIndex ? '#361362' : '#29292e',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="h-1.5 rounded-full cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* sync vs async */}
            <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-white/50" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                  Sync vs. Async — A Diferença
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-red-300 text-xs font-bold mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 shrink-0" /> Bloqueante (evitar)
                  </p>
                  <CodeHighlight code={`const data = fs.readFileSync(\n  'arquivo.txt'\n)\n// ⚠️ tudo para aqui\n// até o arquivo ser lido`} />
                </div>
                <div className="rounded-xl border border-[#29e0a9]/20 bg-[#29e0a9]/5 p-4">
                  <p className="text-[#29e0a9] text-xs font-bold mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Não-bloqueante (correto)
                  </p>
                  <CodeHighlight code={`fs.readFile('arquivo.txt',\n  (err, data) => {\n    // executa depois ✓\n  }\n)\n// continua imediatamente`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* thread pool */}
        <ThreadPoolSection />

        {/* concept cards */}
        <ConceptCards />
      </div>
    </div>
  )
}
