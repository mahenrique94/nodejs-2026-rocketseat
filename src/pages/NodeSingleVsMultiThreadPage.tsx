import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChefHat, Users, Cpu, Eye, Compass,
  FolderOpen, Globe, Lock, Image, BarChart2, Zap,
  Play, Pause, RotateCcw, RefreshCcw,
  Lightbulb, AlertTriangle, CheckCircle2, XCircle,
  FlaskConical, Search, Crown, Settings2, Loader2, Flame, GitBranch,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ className?: string }>
type Mode = 'single' | 'multi'

interface RequestItem {
  id: number
  label: string
  status: 'pending' | 'processing' | 'done'
}

// ─── blocking demo ────────────────────────────────────────────────────────────

function BlockingDemo() {
  const [mode, setMode] = useState<Mode>('single')
  const [tick, setTick] = useState(0)
  const [isRunningCPU, setIsRunningCPU] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [cpuProgress, setCpuProgress] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([])

  // heartbeat — para quando bloqueado (single-thread)
  useEffect(() => {
    if (isBlocked) return
    const t = setInterval(() => setTick((v) => v + 1), 120)
    return () => clearInterval(t)
  }, [isBlocked])

  // incoming requests — acumulam quando bloqueado
  useEffect(() => {
    const t = setInterval(() => {
      if (isBlocked) {
        setPendingCount((v) => v + 1)
      } else {
        setProcessedCount((v) => v + 1)
      }
    }, 400)
    timersRef.current.push(t)
    return () => clearInterval(t)
  }, [isBlocked])

  function runCPUTask() {
    if (isRunningCPU) return
    setIsRunningCPU(true)
    setCpuProgress(0)

    const blocked = mode === 'single'
    if (blocked) setIsBlocked(true)

    const start = Date.now()
    const t = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / 3000) * 100, 100)
      setCpuProgress(pct)
      if (pct >= 100) {
        clearInterval(t)
        setIsRunningCPU(false)
        if (blocked) {
          setIsBlocked(false)
          setPendingCount(0) // flush queue
        }
      }
    }, 50)
    timersRef.current.push(t)
  }

  function reset() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setTick(0)
    setIsRunningCPU(false)
    setIsBlocked(false)
    setCpuProgress(0)
    setPendingCount(0)
    setProcessedCount(0)
  }

  useEffect(() => { reset() }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const heartbeatColor = isBlocked ? 'text-red-400' : 'text-[#29e0a9]'
  const heartbeatBg    = isBlocked ? 'bg-red-500/10 border-red-500/30' : 'bg-[#29e0a9]/10 border-[#29e0a9]/30'

  return (
    <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6 space-y-6">
      {/* mode toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Simulação ao Vivo</h3>
          <p className="text-[#505059] text-xs mt-0.5">Veja o que acontece quando código CPU-intensivo é executado</p>
        </div>
        <div className="flex items-center gap-1 bg-[#09090a] border border-[#29292e] rounded-xl p-1">
          {(['single', 'multi'] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => setMode(m)}
              whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer
                ${mode === m ? 'bg-[#9956f6] text-white' : 'text-[#7c7c8a] hover:text-white'}`}
            >
              {m === 'single' ? '1 Thread' : '4 Threads'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* thread diagram */}
      <div className="space-y-3">
        {/* main thread */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-[#505059] uppercase tracking-widest">Thread Principal (Event Loop)</p>
          <div className="relative h-10 bg-[#09090a] border border-[#29292e] rounded-xl overflow-hidden">
            {/* running indicator */}
            <motion.div
              animate={{ opacity: isBlocked ? 0.3 : 1 }}
              className="absolute inset-0 flex items-center px-4 gap-3"
            >
              <motion.div
                animate={{ scaleX: isBlocked ? 0 : 1, backgroundColor: '#29e0a9' }}
                transition={{ duration: 0.3 }}
                className="w-2 h-2 rounded-full bg-[#29e0a9]"
              />
              <span className="text-xs font-mono text-[#7c7c8a] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isBlocked ? 'bg-red-400' : 'bg-[#29e0a9]'}`} />
                {isBlocked ? 'bloqueada — aguardando CPU...' : 'processando requisições'}
              </span>
            </motion.div>

            {/* blocked overlay */}
            <AnimatePresence>
              {isBlocked && (
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="absolute inset-0 bg-red-500/20 border-r-2 border-red-500 rounded-xl"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* worker threads */}
        {mode === 'multi' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] font-bold text-[#505059] uppercase tracking-widest">Worker Threads</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-10 bg-[#09090a] border border-[#29292e] rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center px-4 gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 1 && isRunningCPU ? 'bg-amber-400 animate-pulse' : 'bg-[#29292e]'}`} />
                  <span className="text-xs font-mono text-[#505059]">
                    {i === 1 && isRunningCPU ? `processando tarefa CPU (${Math.round(cpuProgress)}%)` : `Worker ${i} — ocioso`}
                  </span>
                </div>
                {i === 1 && isRunningCPU && (
                  <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: cpuProgress / 100 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-amber-500/15 rounded-xl"
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* heartbeat */}
        <div className={`rounded-xl border p-3 transition-colors duration-300 ${heartbeatBg}`}>
          <p className="text-[10px] text-[#505059] uppercase tracking-widest mb-1">Heartbeat</p>
          <motion.p
            key={tick}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className={`text-xl font-bold font-mono origin-left ${heartbeatColor}`}
          >
            {tick}
          </motion.p>
          <p className={`text-[10px] mt-0.5 ${heartbeatColor} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isBlocked ? 'bg-red-400' : 'bg-[#29e0a9]'}`} />
            {isBlocked ? 'congelado' : 'ativo'}
          </p>
        </div>

        {/* cpu task */}
        <div className={`rounded-xl border p-3 transition-colors duration-300
          ${isRunningCPU ? 'border-amber-500/30 bg-amber-500/10' : 'border-[#29292e] bg-[#09090a]'}`}
        >
          <p className="text-[10px] text-[#505059] uppercase tracking-widest mb-1">Tarefa CPU</p>
          <p className={`text-xl font-bold font-mono ${isRunningCPU ? 'text-amber-400' : 'text-[#323238]'}`}>
            {isRunningCPU ? `${Math.round(cpuProgress)}%` : '—'}
          </p>
          {isRunningCPU && (
            <div className="w-full bg-[#29292e] rounded-full h-1 mt-1.5">
              <motion.div
                className="bg-amber-500 h-1 rounded-full"
                animate={{ width: `${cpuProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </div>

        {/* pending */}
        <div className={`rounded-xl border p-3 transition-colors duration-300
          ${pendingCount > 0 ? 'border-red-500/30 bg-red-500/10' : 'border-[#29292e] bg-[#09090a]'}`}
        >
          <p className="text-[10px] text-[#505059] uppercase tracking-widest mb-1">Fila Bloqueada</p>
          <motion.p
            key={pendingCount}
            animate={{ scale: pendingCount > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2 }}
            className={`text-xl font-bold font-mono ${pendingCount > 0 ? 'text-red-400' : 'text-[#323238]'}`}
          >
            {pendingCount}
          </motion.p>
          <p className="text-[10px] text-[#505059] mt-0.5">requisições presas</p>
        </div>

        {/* processed */}
        <div className="rounded-xl border border-[#29292e] bg-[#09090a] p-3">
          <p className="text-[10px] text-[#505059] uppercase tracking-widest mb-1">Processadas</p>
          <p className="text-xl font-bold font-mono text-[#9956f6]">{processedCount}</p>
          <p className="text-[10px] text-[#505059] mt-0.5">requisições ok</p>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <motion.button
          onClick={runCPUTask}
          disabled={isRunningCPU}
          whileHover={!isRunningCPU ? { scale: 1.03 } : {}}
          whileTap={!isRunningCPU ? { scale: 0.97 } : {}}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-500 text-white text-sm font-semibold transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isRunningCPU ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
            {isRunningCPU ? 'Calculando...' : 'Adicionar Tarefa CPU'}
          </span>
        </motion.button>
        <motion.button
          onClick={reset}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#29292e] text-[#7c7c8a] hover:text-white text-sm transition cursor-pointer"
        >
          Resetar
        </motion.button>

        <p className="text-[#505059] text-xs ml-auto flex items-center gap-1.5">
          {mode === 'single'
            ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            : <CheckCircle2 className="w-3.5 h-3.5 text-[#29e0a9] shrink-0" />}
          {mode === 'single'
            ? 'No modo single-thread, a tarefa CPU congela tudo'
            : 'No modo multi-thread, a tarefa CPU vai para um Worker Thread'}
        </p>
      </div>
    </div>
  )
}

// ─── hidden threads section ───────────────────────────────────────────────────

const THREAD_ROLES = [
  {
    dotColor: 'bg-[#29e0a9]',
    label: 'Thread Principal',
    color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
    tc: 'text-[#29e0a9]',
    desc: 'Executa seu código JavaScript. Roda o Event Loop. Nunca deve ser bloqueada.',
    items: ['Seu código JS', 'Event Loop', 'Callbacks', 'Promises'],
  },
  {
    dotColor: 'bg-amber-400',
    label: 'Thread Pool (libuv)',
    color: 'border-amber-500/30 bg-amber-500/5',
    tc: 'text-amber-400',
    desc: '4 threads gerenciadas pelo libuv para operações que o kernel não suporta de forma assíncrona.',
    items: ['fs.readFile', 'crypto.hash', 'dns.lookup', 'zlib.gzip'],
  },
  {
    dotColor: 'bg-[#5f75f2]',
    label: 'Kernel / OS Threads',
    color: 'border-[#5f75f2]/30 bg-[#5f75f2]/5',
    tc: 'text-[#a0b0ff]',
    desc: 'O sistema operacional gerencia sockets de rede com epoll/kqueue de forma completamente assíncrona.',
    items: ['TCP sockets', 'HTTP requests', 'WebSockets', 'UDP'],
  },
  {
    dotColor: 'bg-[#9956f6]',
    label: 'Worker Threads (seu código)',
    color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
    tc: 'text-[#b585fb]',
    desc: 'Threads JavaScript que você cria explicitamente para tarefas CPU-intensivas.',
    items: ['Image processing', 'Data parsing', 'Cálculos pesados', 'ML inference'],
  },
]

// ─── code comparison section ──────────────────────────────────────────────────

const CODE_EXAMPLES = [
  {
    id: 'without-worker',
    label: 'Sem Worker Thread (bloqueia)',
    LabelIcon: XCircle as LucideIcon,
    labelIconColor: 'text-red-400',
    code: `import { createServer } from 'node:http'

function calculoPesado(n) {
  // Simula trabalho CPU-intensivo
  let resultado = 0
  for (let i = 0; i < n; i++) resultado += i
  return resultado
}

createServer((req, res) => {
  if (req.url === '/calcular') {
    // ⚠️ BLOQUEIA a thread principal por segundos!
    // Nenhuma outra requisição é processada enquanto isso
    const resultado = calculoPesado(5_000_000_000)
    res.end(JSON.stringify({ resultado }))
  } else {
    res.end('ok') // ficará preso esperando o cálculo
  }
}).listen(3000)`,
    accent: 'border-red-500/20 bg-red-500/5',
  },
  {
    id: 'with-worker',
    label: 'Com Worker Thread (não bloqueia)',
    LabelIcon: CheckCircle2 as LucideIcon,
    labelIconColor: 'text-[#29e0a9]',
    code: `import { createServer } from 'node:http'
import { Worker } from 'node:worker_threads'

createServer((req, res) => {
  if (req.url === '/calcular') {
    // ✅ Cálculo vai para outra thread
    const worker = new Worker(\`
      const { parentPort, workerData } = require('worker_threads')
      let resultado = 0
      for (let i = 0; i < workerData.n; i++) resultado += i
      parentPort.postMessage(resultado)
    \`, { eval: true, workerData: { n: 5_000_000_000 } })

    worker.on('message', (resultado) => {
      res.end(JSON.stringify({ resultado }))
    })
  } else {
    // ✅ Responde imediatamente — thread principal livre!
    res.end('ok')
  }
}).listen(3000)`,
    accent: 'border-[#29e0a9]/20 bg-[#29e0a9]/5',
  },
]

const CLUSTER_CODE = `import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { createServer } from 'node:http'

if (cluster.isPrimary) {
  const numCPUs = cpus().length // ex: 8 cores

  console.log(\`Primary \${process.pid} — criando \${numCPUs} workers\`)

  // Cria um processo filho por núcleo de CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(\`Worker \${worker.process.pid} morreu — reiniciando...\`)
    cluster.fork() // auto-restart
  })
} else {
  // Cada worker roda o servidor HTTP normalmente
  createServer((req, res) => {
    res.end(\`Respondido pelo worker \${process.pid}\`)
  }).listen(3000)

  console.log(\`Worker \${process.pid} iniciado\`)
}`

// ─── decision guide ───────────────────────────────────────────────────────────

const DECISIONS: { scenario: string; solution: string; why: string; color: string; Icon: LucideIcon }[] = [
  {
    scenario: 'Ler/escrever arquivos',
    solution: 'fs.promises (Event Loop)',
    why: 'libuv gerencia via thread pool automaticamente — não bloqueante',
    color: 'border-[#29e0a9]/30',
    Icon: FolderOpen,
  },
  {
    scenario: 'Requisições HTTP / APIs',
    solution: 'fetch / http.request',
    why: 'Rede é tratada pelo kernel OS de forma assíncrona — zero bloqueio',
    color: 'border-[#5f75f2]/30',
    Icon: Globe,
  },
  {
    scenario: 'Hashing, criptografia',
    solution: 'crypto (assíncrono)',
    why: 'crypto.hash com callback usa o thread pool do libuv automaticamente',
    color: 'border-amber-500/30',
    Icon: Lock,
  },
  {
    scenario: 'Processamento de imagens, vídeo',
    solution: 'Worker Threads',
    why: 'CPU-intensivo, bloquearia o Event Loop por segundos sem worker',
    color: 'border-[#9956f6]/30',
    Icon: Image,
  },
  {
    scenario: 'Parsing de CSV/JSON grande',
    solution: 'Worker Threads + Streams',
    why: 'Dividir o trabalho em streams evita carregar tudo na memória',
    color: 'border-[#9956f6]/30',
    Icon: BarChart2,
  },
  {
    scenario: 'Escalar para múltiplos CPUs',
    solution: 'Cluster module ou PM2',
    why: 'Um processo não usa mais de 1 CPU — cluster cria N processos idênticos',
    color: 'border-pink-500/30',
    Icon: Zap,
  },
]

// ─── page ─────────────────────────────────────────────────────────────────────

export function NodeSingleVsMultiThreadPage() {
  const [activeCode, setActiveCode] = useState('without-worker')

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
            <span className="text-[#505059] text-sm group-hover:text-[#7c7c8a] transition">Node.js 2026</span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Single Thread vs Multi Thread
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
            className="inline-flex items-center gap-2 bg-[#9956f6]/10 border border-[#9956f6]/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-[#b585fb]">Módulo 1 · Fundamentos</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-[#9956f6] via-[#e254ff] to-[#29e0a9] bg-clip-text text-transparent">
              Single Thread vs Multi Thread
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            "Node.js é single-threaded" é uma meia-verdade. O seu JavaScript roda em uma thread,
            mas o runtime usa várias por baixo dos panos. Entenda a diferença — e quando criar suas próprias threads.
          </motion.p>
        </motion.div>

        {/* concept cards — the analogy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 26 }}
            className="bg-[#121214] border border-red-500/20 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-red-300" />
              <div>
                <h3 className="font-bold text-white">Single Thread</h3>
                <p className="text-[#505059] text-xs">O chef que faz tudo sozinho</p>
              </div>
            </div>
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              Imagine um restaurante com <strong className="text-white">um único chef</strong> que anota o pedido,
              cozinha e serve — tudo ele. Enquanto cozinha um prato que demora 2 horas,
              ninguém mais é atendido. <span className="text-red-400">Tudo para.</span>
            </p>
            <div className="flex flex-col gap-2">
              {['Pedido 1 → Cozinha 2h → Servido ✓', 'Pedido 2 → esperando...', 'Pedido 3 → esperando...'].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono
                  ${i === 0 ? 'bg-[#29e0a9]/10 text-[#29e0a9]' : 'bg-red-500/10 text-red-400'}`}>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
            className="bg-[#121214] border border-[#29e0a9]/20 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#29e0a9]" />
              <div>
                <h3 className="font-bold text-white">Multi Thread</h3>
                <p className="text-[#505059] text-xs">O chef que delega</p>
              </div>
            </div>
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              Agora o restaurante tem <strong className="text-white">um chef principal</strong> que anota pedidos e coordena,
              mais <strong className="text-white">sous-chefs</strong> que cozinham em paralelo.
              O chef principal nunca fica parado esperando. <span className="text-[#29e0a9]">Tudo flui.</span>
            </p>
            <div className="flex flex-col gap-2">
              {[
                'Chef principal → Anota pedidos (rápido)',
                'Sous-chef 1 → Cozinhando prato A',
                'Sous-chef 2 → Cozinhando prato B',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono bg-[#29e0a9]/10 text-[#29e0a9]">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* live demo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-white/50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Demonstração Interativa</h2>
          </div>
          <BlockingDemo />
        </div>

        {/* hidden threads */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-white/50 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">As Threads Escondidas</h2>
              <p className="text-[#505059] text-xs mt-0.5">"Single-threaded" se refere ao seu JS — o runtime usa muito mais</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {THREAD_ROLES.map((role, i) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
                className={`rounded-xl border p-5 space-y-3 ${role.color}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${role.dotColor}`} />
                  <h4 className={`font-bold text-xs ${role.tc}`}>{role.label}</h4>
                </div>
                <p className="text-[#7c7c8a] text-xs leading-5">{role.desc}</p>
                <div className="space-y-1">
                  {role.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="text-[#323238] text-xs shrink-0">→</span>
                      <span className="text-[#505059] text-xs font-mono">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl px-5 py-4 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              <strong className="text-white">A regra de ouro:</strong> operações de I/O (rede, arquivos, banco de dados)
              são não-bloqueantes por natureza — o Event Loop lida com elas. Só tarefas
              <strong className="text-white"> CPU-intensivas</strong> (cálculos longos, processamento de imagens, encoding de vídeo)
              precisam de Worker Threads.
            </p>
          </div>
        </div>

        {/* worker threads code */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-white/50" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Worker Threads na Prática</h2>
              <p className="text-[#505059] text-xs mt-0.5">O mesmo servidor HTTP — sem e com Worker Thread</p>
            </div>
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            {/* tabs */}
            <div className="flex border-b border-[#29292e]">
              {CODE_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveCode(ex.id)}
                  className={`px-4 py-3 text-xs font-semibold transition-colors cursor-pointer border-b-2
                    ${activeCode === ex.id
                      ? 'text-white border-[#9956f6]'
                      : 'text-[#505059] border-transparent hover:text-[#a8a8b3]'
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ex.LabelIcon className={`w-3.5 h-3.5 ${ex.labelIconColor}`} />
                    {ex.label}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {CODE_EXAMPLES.filter((e) => e.id === activeCode).map((ex) => (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className={`p-1 m-4 rounded-xl border ${ex.accent}`}
                >
                  <pre className="p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                    {ex.code}
                  </pre>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* cluster */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white/50" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Cluster Module</h2>
              <p className="text-[#505059] text-xs mt-0.5">Usar todos os núcleos da CPU com múltiplos processos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm">Como o Cluster funciona</h3>
              <div className="space-y-3">
                {[
                  { Icon: Crown, label: 'Processo Primary', desc: 'Gerencia os workers. Não serve requisições. Faz fork() de N processos.', color: 'border-[#9956f6]/30 bg-[#9956f6]/5 text-[#b585fb]' },
                  { Icon: Settings2, label: 'Worker 1..N', desc: 'Cada worker é um processo Node.js independente com seu próprio Event Loop.', color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5 text-[#29e0a9]' },
                  { Icon: RotateCcw, label: 'Load Balancing', desc: 'O SO distribui conexões entre os workers via round-robin (ou SO-specific).', color: 'border-[#5f75f2]/30 bg-[#5f75f2]/5 text-[#a0b0ff]' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border p-3 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <item.Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <p className="text-[#7c7c8a] text-xs leading-4">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#09090a] border border-[#29292e] rounded-xl p-4">
                <p className="text-amber-400 text-xs font-bold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Cluster vs Worker Threads
                </p>
                <div className="space-y-1.5">
                  {[
                    ['Cluster', 'Múltiplos processos', 'Não compartilham memória'],
                    ['Worker Threads', 'Múltiplas threads', 'Compartilham memória'],
                  ].map(([name, a, b]) => (
                    <div key={name} className="flex items-start gap-2 text-xs">
                      <span className="text-[#9956f6] shrink-0 font-mono">{name}:</span>
                      <span className="text-[#7c7c8a]">{a} — {b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
              <div className="border-b border-[#29292e] px-4 py-3">
                <span className="text-xs font-semibold text-[#7c7c8a]">cluster.js</span>
              </div>
              <pre className="p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                {CLUSTER_CODE}
              </pre>
            </div>
          </div>
        </div>

        {/* decision guide */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-white/50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Guia de Decisão</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DECISIONS.map((d, i) => (
              <motion.div
                key={d.scenario}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                className={`rounded-xl border bg-[#121214] p-4 ${d.color}`}
              >
                <div className="flex items-start gap-3">
                  <d.Icon className="w-5 h-5 shrink-0 text-[#a8a8b3] mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-white text-xs font-bold">{d.scenario}</p>
                    <p className="text-[#9956f6] text-xs font-mono font-semibold">{d.solution}</p>
                    <p className="text-[#505059] text-xs leading-4">{d.why}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            {
              Icon: RefreshCcw,
              title: 'Event Loop: I/O assíncrono',
              color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
              tc: 'text-[#29e0a9]',
              body: 'Para I/O (rede, arquivos, banco), o Event Loop é suficiente e eficiente. Não crie threads desnecessariamente.',
            },
            {
              Icon: Cpu,
              title: 'Worker Threads: CPU pesado',
              color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
              tc: 'text-[#b585fb]',
              body: 'Para código que usa 100% da CPU por mais de ~100ms, mova para um Worker Thread. Sua aplicação agradece.',
            },
            {
              Icon: Zap,
              title: 'Cluster: escala horizontal',
              color: 'border-pink-500/30 bg-pink-500/5',
              tc: 'text-pink-300',
              body: 'Para usar todos os núcleos do servidor, use cluster ou PM2. Cada processo tem seu próprio Event Loop.',
            },
          ].map((c) => (
            <div key={c.title} className={`rounded-xl border p-5 ${c.color}`}>
              <c.Icon className={`w-6 h-6 mb-2 ${c.tc}`} />
              <h4 className={`font-bold text-sm mb-2 ${c.tc}`}>{c.title}</h4>
              <p className="text-[#7c7c8a] text-xs leading-5">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
