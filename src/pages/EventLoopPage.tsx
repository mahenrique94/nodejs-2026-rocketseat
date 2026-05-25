import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Layers, Zap, Clock, Terminal, FileCode2, RefreshCcw,
  BookOpen, Play, Pause, RotateCcw, CheckCircle2,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'idle'
  | 'push-sync'
  | 'run-sync'
  | 'pop-sync'
  | 'push-async'
  | 'run-async'
  | 'pop-async'
  | 'microtask'
  | 'macrotask'
  | 'done'

interface StackFrame {
  id: number
  label: string
  color: string
}

interface QueueItem {
  id: number
  label: string
  type: 'micro' | 'macro'
}

interface Step {
  phase: Phase
  description: string
  code: string
  stackFrames: StackFrame[]
  microQueue: QueueItem[]
  macroQueue: QueueItem[]
  highlight: string | null
  log: string[]
}

// ─── animation steps ──────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    phase: 'idle',
    description: 'O Node.js iniciou. Tudo está vazio e aguardando a execução.',
    code: `console.log("1: sync");

setTimeout(() => {
  console.log("4: timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise");
});

console.log("2: sync");`,
    stackFrames: [],
    microQueue: [],
    macroQueue: [],
    highlight: null,
    log: [],
  },
  {
    phase: 'push-sync',
    description: 'O Node.js lê o script. Ele empilha a primeira chamada síncrona na Call Stack.',
    code: `❯ console.log("1: sync");

setTimeout(() => {
  console.log("4: timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise");
});

console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
      { id: 2, label: 'console.log("1: sync")', color: 'bg-[#8234e9]' },
    ],
    microQueue: [],
    macroQueue: [],
    highlight: 'console.log("1: sync")',
    log: [],
  },
  {
    phase: 'run-sync',
    description: 'A Call Stack executa console.log("1: sync") imediatamente.',
    code: `❯ console.log("1: sync");  // ✓ executado

setTimeout(() => {
  console.log("4: timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise");
});

console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
      { id: 2, label: 'console.log("1: sync")', color: 'bg-[#8234e9]' },
    ],
    microQueue: [],
    macroQueue: [],
    highlight: null,
    log: ['1: sync'],
  },
  {
    phase: 'pop-sync',
    description: 'Pronto! A função é removida da pilha. O Node.js avança para a próxima linha.',
    code: `  console.log("1: sync");  // ✓

❯ setTimeout(() => {
    console.log("4: timeout");
  }, 0);

Promise.resolve().then(() => {
  console.log("3: promise");
});

console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
    ],
    microQueue: [],
    macroQueue: [],
    highlight: null,
    log: ['1: sync'],
  },
  {
    phase: 'push-async',
    description: 'setTimeout() é chamado. O Node.js repassa o callback para a Timer API — sem bloquear! Após ~0ms o callback cai na Macro Task Queue.',
    code: `  console.log("1: sync");  // ✓

❯ setTimeout(() => {       // repassado à Timer API
    console.log("4: timeout");
  }, 0);

Promise.resolve().then(() => {
  console.log("3: promise");
});

console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
      { id: 3, label: 'setTimeout(fn, 0)', color: 'bg-amber-600' },
    ],
    microQueue: [],
    macroQueue: [{ id: 1, label: 'callback do timeout', type: 'macro' }],
    highlight: null,
    log: ['1: sync'],
  },
  {
    phase: 'pop-async',
    description: 'setTimeout retorna imediatamente. O callback aguarda na Macro Queue. O código síncrono continua rodando.',
    code: `  console.log("1: sync");  // ✓
  setTimeout(...)          // ✓ registrado

❯ Promise.resolve().then(() => {
    console.log("3: promise");
  });

console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
      { id: 4, label: 'Promise.resolve().then(fn)', color: 'bg-[#00a277]' },
    ],
    microQueue: [{ id: 1, label: 'promise .then()', type: 'micro' }],
    macroQueue: [{ id: 1, label: 'callback do timeout', type: 'macro' }],
    highlight: null,
    log: ['1: sync'],
  },
  {
    phase: 'run-async',
    description: 'Promise.resolve().then() agenda seu callback na Micro Task Queue — prioridade maior que as macrotasks!',
    code: `  console.log("1: sync");  // ✓
  setTimeout(...)          // ✓
  Promise.resolve().then() // ✓ agendado

❯ console.log("2: sync");`,
    stackFrames: [
      { id: 1, label: 'main()', color: 'bg-[#9956f6]' },
      { id: 5, label: 'console.log("2: sync")', color: 'bg-[#8234e9]' },
    ],
    microQueue: [{ id: 1, label: 'promise .then()', type: 'micro' }],
    macroQueue: [{ id: 1, label: 'callback do timeout', type: 'macro' }],
    highlight: null,
    log: ['1: sync'],
  },
  {
    phase: 'microtask',
    description: 'console.log("2: sync") executa e sai da pilha. A Call Stack está vazia! Antes de pegar da Macro Queue, o Node.js esvazia TODAS as microtasks primeiro.',
    code: `  console.log("1: sync");  // ✓
  setTimeout(...)          // ✓
  Promise.resolve().then() // ✓

  console.log("2: sync");  // ✓

▶ [Esvaziando a Micro Queue...]`,
    stackFrames: [
      { id: 6, label: 'callback do promise .then()', color: 'bg-[#00a277]' },
    ],
    microQueue: [],
    macroQueue: [{ id: 1, label: 'callback do timeout', type: 'macro' }],
    highlight: null,
    log: ['1: sync', '2: sync'],
  },
  {
    phase: 'macrotask',
    description: 'O callback da Promise executa → "3: promise" é impresso. A Micro Queue está vazia. Agora o Event Loop escolhe a próxima Macro Task.',
    code: `  // todo código síncrono concluído ✓
  // micro queue esvaziada ✓

▶ [Macro Queue — buscando próxima tarefa...]`,
    stackFrames: [
      { id: 7, label: 'callback do timeout', color: 'bg-amber-600' },
    ],
    microQueue: [],
    macroQueue: [],
    highlight: null,
    log: ['1: sync', '2: sync', '3: promise'],
  },
  {
    phase: 'done',
    description: 'O callback do timeout executa → "4: timeout" é impresso. O Event Loop verifica se há mais trabalho — nada restante. O Node.js encerra.',
    code: `  // tudo concluído! ✓`,
    stackFrames: [],
    microQueue: [],
    macroQueue: [],
    highlight: null,
    log: ['1: sync', '2: sync', '3: promise', '4: timeout'],
  },
]

// ─── sub-components ───────────────────────────────────────────────────────────

function CallStack({ frames }: { frames: StackFrame[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-white/50" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Call Stack</h3>
      </div>
      <div className="flex-1 border border-[#29292e] rounded-xl bg-[#09090a] p-3 flex flex-col-reverse gap-2 h-[180px] overflow-hidden">
        <AnimatePresence>
          {frames.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#505059] text-xs self-center my-auto italic"
            >
              vazia
            </motion.p>
          )}
          {frames.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`px-3 py-2 rounded-lg text-white text-xs font-mono font-semibold ${f.color} shadow-lg`}
            >
              {f.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[#505059] text-[10px] mt-2 text-center">base → topo (LIFO)</p>
    </div>
  )
}

function MicroQueue({ items }: { items: QueueItem[] }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-[#29e0a9]" />
        <h3 className="text-xs font-bold text-[#29e0a9] uppercase tracking-widest">Micro Queue</h3>
        <span className="ml-auto text-[10px] bg-[#29e0a9]/10 text-[#29e0a9] px-2 py-0.5 rounded-full">Promises · queueMicrotask</span>
      </div>
      <div className="border border-[#29e0a9]/20 rounded-xl bg-[#002f27]/20 p-3 h-[64px] flex flex-col gap-2 overflow-hidden">
        <AnimatePresence>
          {items.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[#505059] text-xs italic">vazia</motion.p>
          )}
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="px-3 py-2 rounded-lg bg-[#00a277] text-white text-xs font-mono font-semibold shadow"
            >
              {item.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MacroQueue({ items }: { items: QueueItem[] }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Macro Queue</h3>
        <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">setTimeout · setInterval · I/O</span>
      </div>
      <div className="border border-amber-500/20 rounded-xl bg-amber-950/20 p-3 h-[64px] flex flex-col gap-2 overflow-hidden">
        <AnimatePresence>
          {items.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[#505059] text-xs italic">vazia</motion.p>
          )}
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-mono font-semibold shadow"
            >
              {item.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ConsoleLog({ entries }: { entries: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [entries])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-white/50" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Saída do Console</h3>
      </div>
      <div ref={containerRef} className="flex-1 border border-[#29292e] rounded-xl bg-[#09090a] p-3 font-mono text-sm overflow-y-auto h-[120px]">
        {entries.length === 0 && (
          <span className="text-[#505059] text-xs italic">aguardando...</span>
        )}
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <motion.div
              key={entry + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[#29e0a9] leading-6"
            >
              <span className="text-[#505059] select-none mr-2">›</span>{entry}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CodePane({ code }: { code: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FileCode2 className="w-4 h-4 text-white/50" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Código-Fonte</h3>
      </div>
      <pre className="flex-1 border border-[#29292e] rounded-xl bg-[#09090a] p-4 text-xs font-mono text-[#a8a8b3] overflow-auto leading-6 h-[260px] whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
}

function PhaseIndicator({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; color: string; Icon?: React.ElementType }> = {
    idle:         { label: 'Aguardando',             color: 'bg-[#202024] text-[#7c7c8a]' },
    'push-sync':  { label: 'Empilhando na Stack',    color: 'bg-[#9956f6] text-white' },
    'run-sync':   { label: 'Executando Síncrono',    color: 'bg-[#9956f6] text-white' },
    'pop-sync':   { label: 'Removendo da Stack',     color: 'bg-[#8234e9] text-white' },
    'push-async': { label: 'Chamada Assíncrona',     color: 'bg-amber-600 text-white' },
    'run-async':  { label: 'Agendando Microtask',    color: 'bg-[#00a277] text-white' },
    'pop-async':  { label: 'Enfileirando Callback',  color: 'bg-[#00a277] text-white' },
    microtask:    { label: 'Esvaziando Micro Queue', color: 'bg-[#00a277] text-white animate-pulse', Icon: Zap },
    macrotask:    { label: 'Buscando Macro Task',    color: 'bg-amber-500 text-white animate-pulse', Icon: Clock },
    done:         { label: 'Concluído!',             color: 'bg-[#00a277] text-white', Icon: CheckCircle2 },
  }
  const { label, color, Icon } = map[phase]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export function EventLoopPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying])

  function prev() { if (!isFirst) setStepIndex((s) => s - 1) }
  function next() { if (!isLast) setStepIndex((s) => s + 1) }
  function reset() { setStepIndex(0); setIsPlaying(false) }
  function togglePlay() { if (isLast) { reset(); setIsPlaying(true) } else setIsPlaying((p) => !p) }

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Event Loop · Call Stack · Filas de Tarefas
          </h1>
          <PhaseIndicator phase={step.phase} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* hero text */}
        <div className="text-center space-y-2 pb-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#29e0a9] via-[#9956f6] to-[#e254ff] bg-clip-text text-transparent">
            Como o Node.js executa seu código
          </h2>
          <p className="text-[#7c7c8a] text-sm max-w-xl mx-auto">
            O Node.js é single-threaded, mas não-bloqueante. Avance pelos passos desta animação e entenda exatamente como isso funciona.
          </p>
        </div>

        {/* step description card */}
        <div className="relative overflow-hidden rounded-xl border border-[#29292e] bg-[#121214] px-6 py-5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9956f6]/5 to-[#29e0a9]/5 pointer-events-none" />
          <div className="flex items-start gap-4">
            <motion.div
              key={stepIndex}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="shrink-0 w-8 h-8 rounded-full bg-[#9956f6]/20 border border-[#9956f6]/40 flex items-center justify-center text-sm font-bold text-[#b585fb]"
            >
              {stepIndex + 1}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="text-[#a8a8b3] text-sm sm:text-base leading-relaxed pt-0.5"
              >
                {step.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-[#121214] border border-[#29292e] rounded-xl p-5">
            <CodePane code={step.code} />
          </div>
          <div className="lg:col-span-1 bg-[#121214] border border-[#29292e] rounded-xl p-5">
            <CallStack frames={step.stackFrames} />
          </div>
          <div className="lg:col-span-1 bg-[#121214] border border-[#29292e] rounded-xl p-5">
            <ConsoleLog entries={step.log} />
          </div>
        </div>

        {/* queues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
            <MicroQueue items={step.microQueue} />
          </div>
          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
            <MacroQueue items={step.macroQueue} />
          </div>
        </div>

        {/* event loop diagram */}
        <EventLoopDiagram phase={step.phase} />

        {/* controls */}
        <div className="flex items-center justify-center gap-3 pb-10">
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-[#7c7c8a] hover:text-white transition cursor-pointer"
            title="Reiniciar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>

          <motion.button
            onClick={prev}
            disabled={isFirst}
            whileHover={!isFirst ? { scale: 1.04 } : {}}
            whileTap={!isFirst ? { scale: 0.96 } : {}}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-white disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer text-sm font-medium"
          >
            ← Anterior
          </motion.button>

          <motion.button
            onClick={togglePlay}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`px-6 py-2 rounded-xl font-semibold text-sm border transition cursor-pointer
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
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-white disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer text-sm font-medium"
          >
            Próximo →
          </motion.button>

          {/* progress dots */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            {STEPS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => { setStepIndex(i); setIsPlaying(false) }}
                animate={{
                  width: i === stepIndex ? 16 : 8,
                  backgroundColor: i === stepIndex ? '#9956f6' : i < stepIndex ? '#361362' : '#29292e',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="h-2 rounded-full cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* concepts */}
        <ConceptCards />
      </div>
    </div>
  )
}

// ─── event loop diagram ───────────────────────────────────────────────────────

function EventLoopDiagram({ phase }: { phase: Phase }) {
  const isSync  = phase === 'push-sync' || phase === 'run-sync' || phase === 'pop-sync'
  const isAsync = phase === 'push-async' || phase === 'run-async' || phase === 'pop-async'
  const isMicro = phase === 'microtask'
  const isMacro = phase === 'macrotask'
  const isDone  = phase === 'done'

  return (
    <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <RefreshCcw className="w-4 h-4 text-white/50" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Fluxo do Event Loop</h3>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
        <FlowNode label="Seu Código" active={isSync} color="purple" />
        <Arrow />
        <FlowNode label="Call Stack" active={isSync || isMicro || isMacro} color="purple-dark" />
        <Arrow />
        <FlowNode label="APIs do Node" active={isAsync} color="sky" />
        <Arrow />
        <FlowNode label="Macro Queue" active={isMacro} color="amber" pulse={isMacro} />
        <div className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-4">
          <Arrow dir="up" />
          <FlowNode label="Event Loop" active={isMicro || isMacro || isDone} color="pink" pulse={isMicro || isMacro} />
          <Arrow />
          <FlowNode label="Micro Queue" active={isMicro} color="green" pulse={isMicro} />
        </div>
      </div>
      <p className="text-[#505059] text-xs text-center mt-4">
        A Micro Queue é sempre esvaziada antes de a próxima Macro Task ser executada
      </p>
    </div>
  )
}

type FlowColor = 'purple' | 'purple-dark' | 'sky' | 'amber' | 'pink' | 'green'

function FlowNode({ label, active, color, pulse }: {
  label: string
  active: boolean
  color: FlowColor
  pulse?: boolean
}) {
  const colors: Record<FlowColor, { on: string; off: string }> = {
    'purple':      { on: 'border-[#9956f6] bg-[#9956f6]/20 text-[#b585fb]',   off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
    'purple-dark': { on: 'border-[#8234e9] bg-[#8234e9]/20 text-[#b585fb]',   off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
    'sky':         { on: 'border-sky-400 bg-sky-500/20 text-sky-200',          off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
    'amber':       { on: 'border-amber-400 bg-amber-500/20 text-amber-200',    off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
    'pink':        { on: 'border-pink-400 bg-pink-500/20 text-pink-200',       off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
    'green':       { on: 'border-[#29e0a9] bg-[#29e0a9]/20 text-[#29e0a9]',   off: 'border-[#29292e] bg-[#121214] text-[#505059]' },
  }
  return (
    <motion.div
      animate={{ scale: active ? 1.06 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        px-3 py-2 rounded-xl border font-semibold text-center min-w-[80px] transition-colors duration-300
        ${active ? colors[color].on : colors[color].off}
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {label}
    </motion.div>
  )
}

function Arrow({ dir = 'right' }: { dir?: 'right' | 'up' }) {
  return (
    <span className={`text-[#323238] text-base select-none ${dir === 'up' ? 'rotate-[-90deg]' : ''}`}>
      →
    </span>
  )
}

// ─── concept cards ────────────────────────────────────────────────────────────

function ConceptCards() {
  const concepts = [
    {
      Icon: BookOpen,
      title: 'Call Stack',
      color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
      titleColor: 'text-[#b585fb]',
      iconColor: 'text-[#b585fb]',
      body: 'Estrutura de dados que rastreia qual função está em execução. O JavaScript é single-threaded — apenas uma coisa roda por vez, aqui.',
    },
    {
      Icon: Zap,
      title: 'Micro Task Queue',
      color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
      titleColor: 'text-[#29e0a9]',
      iconColor: 'text-[#29e0a9]',
      body: 'Onde os callbacks de Promise e queueMicrotask() ficam enfileirados. É sempre completamente esvaziada após cada tarefa, antes da próxima macrotask.',
    },
    {
      Icon: Clock,
      title: 'Macro Task Queue',
      color: 'border-amber-500/30 bg-amber-500/5',
      titleColor: 'text-amber-400',
      iconColor: 'text-amber-400',
      body: 'Onde os callbacks de setTimeout, setInterval e I/O aguardam. O Event Loop escolhe uma por "tick" — após a micro queue estar vazia.',
    },
    {
      Icon: RefreshCcw,
      title: 'Event Loop',
      color: 'border-pink-500/30 bg-pink-500/5',
      titleColor: 'text-pink-300',
      iconColor: 'text-pink-300',
      body: 'O orquestrador. Ele observa a Call Stack. Quando está vazia, esvazia as microtasks e depois escolhe uma macrotask. Repete indefinidamente.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
      {concepts.map(({ Icon, title, color, titleColor, iconColor, body }) => (
        <div key={title} className={`rounded-xl border p-5 ${color}`}>
          <Icon className={`w-5 h-5 mb-3 ${iconColor}`} />
          <h4 className={`font-bold text-sm mb-2 ${titleColor}`}>{title}</h4>
          <p className="text-[#7c7c8a] text-xs leading-5">{body}</p>
        </div>
      ))}
    </div>
  )
}
