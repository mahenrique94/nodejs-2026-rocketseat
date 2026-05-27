import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Radio, Zap, ChevronRight, AlertTriangle, Eye, Layers } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'
import { CodeHighlight } from '../components/CodeHighlight'

const TABS = ['Básico', 'Herança', 'Padrão Observer'] as const
type Tab = (typeof TABS)[number]

const TAB_CONTENT: Record<Tab, { description: string; code: string }> = {
  'Básico': {
    description: 'Crie uma instância de EventEmitter e registre listeners com .on() e .once() — o alicerce do sistema de eventos do Node.js.',
    code: `import { EventEmitter } from 'node:events'

const emitter = new EventEmitter()

// listener permanente — dispara a cada emit
emitter.on('data', (payload) => {
  console.log('recebido:', payload)
})

// listener único — remove-se após a primeira execução
emitter.once('connected', () => {
  console.log('conexão estabelecida!')
})

// emitir eventos com dados
emitter.emit('data', { id: 1, value: 42 })
emitter.emit('connected')
emitter.emit('connected') // ignorado — .once já foi removido

// remover listener específico
const handler = (x) => console.log(x)
emitter.on('ping', handler)
emitter.off('ping', handler) // remove apenas esse listener`,
  },
  'Herança': {
    description: 'Extender EventEmitter é o padrão predominante no Node.js — streams, HTTP servers e a maioria das APIs nativas usam essa abordagem.',
    code: `import { EventEmitter } from 'node:events'

class Database extends EventEmitter {
  private connected = false

  connect(url: string) {
    setTimeout(() => {
      this.connected = true
      this.emit('connect', { url })
    }, 100)
  }

  query(sql: string) {
    if (!this.connected) {
      this.emit('error', new Error('not connected'))
      return
    }
    const start = Date.now()
    // ...executa query...
    this.emit('query', { sql, duration: Date.now() - start })
  }

  close() {
    this.connected = false
    this.emit('close')
    this.removeAllListeners()
  }
}

const db = new Database()

db.on('connect', ({ url }) => console.log(\`conectado: \${url}\`))
db.on('error',   (err)  => console.error('erro:', err.message))
db.on('query',   ({ sql, duration }) => console.log(\`\${sql} (\${duration}ms)\`))
db.on('close',   ()     => console.log('conexão encerrada'))

db.connect('postgres://localhost/app')`,
  },
  'Padrão Observer': {
    description: 'Um único evento pode ter múltiplos listeners independentes — cada um reage sem saber da existência dos outros.',
    code: `import { EventEmitter } from 'node:events'

// event bus centralizado
const bus = new EventEmitter()

// múltiplos consumidores do mesmo evento
bus.on('order:created', (order) => {
  emailService.sendConfirmation(order)
})

bus.on('order:created', (order) => {
  inventory.reserve(order.items)
})

bus.on('order:created', (order) => {
  analytics.track('order_created', order)
})

bus.on('order:created', (order) => {
  warehouse.notify(order)
})

// um único emit dispara todos os 4 listeners
bus.emit('order:created', {
  id:    'ord_abc123',
  items: ['item_a', 'item_b'],
  total: 150.00,
})

// verificar quantidade de listeners
console.log(bus.listenerCount('order:created')) // 4`,
  },
}

const METHODS = [
  {
    name: '.on(event, fn)',
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    border: 'border-[#29e0a9]/20',
    desc: 'Registra listener permanente. Dispara toda vez que o evento for emitido.',
  },
  {
    name: '.once(event, fn)',
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    border: 'border-[#9956f6]/20',
    desc: 'Listener de uso único. Remove-se automaticamente após a primeira emissão.',
  },
  {
    name: '.off(event, fn)',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    desc: 'Remove um listener específico. Alias de removeListener().',
  },
  {
    name: '.emit(event, ...args)',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    desc: 'Dispara o evento de forma síncrona, chamando todos os listeners em ordem de registro.',
  },
  {
    name: '.removeAllListeners()',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    desc: 'Remove todos os listeners de todos os eventos. Use ao destruir objetos.',
  },
  {
    name: '.setMaxListeners(n)',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    desc: 'Define o limite antes do aviso de memory leak (padrão: 10). Use 0 para ilimitado.',
  },
]

const CONCEPTS = [
  {
    icon: Radio,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    label: 'EventEmitter',
    desc: 'Classe base do sistema de eventos do Node.js que implementa o padrão Observer de forma síncrona.',
  },
  {
    icon: Eye,
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    label: 'Observer Pattern',
    desc: 'Desacopla produtor e consumidor — múltiplos listeners reagem ao mesmo evento de forma independente.',
  },
  {
    icon: Zap,
    color: 'text-[#9956f6]',
    bg: 'bg-[#9956f6]/10',
    label: 'Emissão Síncrona',
    desc: '.emit() é síncrono: os listeners executam imediatamente, em sequência, antes do código seguinte.',
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    label: 'Memory Leaks',
    desc: 'Listeners não removidos acumulam em objetos de longa vida. Sempre use .off() ou .once() quando possível.',
  },
]

export function EventsModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Básico')

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-sm font-medium text-[#a8a8b3] hidden sm:block">Módulo Events</h1>
          <Link
            to="/native-modules"
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
          <div className="inline-flex items-center gap-2 bg-sky-400/10 border border-sky-400/20 rounded-full px-3 py-1">
            <Radio className="w-3 h-3 text-sky-400" />
            <span className="text-sky-400 text-xs font-semibold">Módulo 3 · Módulos Nativos</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-sky-300 via-[#29e0a9] to-[#9956f6] bg-clip-text text-transparent">
              Módulo Events
            </span>
          </h1>
          <p className="text-[#7c7c8a] text-lg max-w-2xl leading-relaxed">
            O{' '}
            <code className="text-sky-300 bg-sky-400/10 px-1.5 py-0.5 rounded text-base">EventEmitter</code>{' '}
            é a espinha dorsal do Node.js. Streams, HTTP servers, processos e a maioria das APIs nativas são todos EventEmitters. Entender o padrão Observer é entender o Node.js.
          </p>
        </motion.div>

        {/* tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Como usar</h2>
          <div className="flex gap-1 bg-[#121214] border border-[#29292e] rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
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
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{TAB_CONTENT[activeTab].description}</p>
              </div>
              <CodeHighlight code={TAB_CONTENT[activeTab].code} />
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* observer visual */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Fluxo do padrão Observer</h2>
          <div className="bg-[#121214] border border-[#29292e] rounded-2xl p-8">
            <div className="flex flex-col items-center gap-5">
              {/* emitter box */}
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-8 py-4 text-center">
                <div className="text-sky-300 font-mono font-bold text-sm">emitter.emit('order:created', data)</div>
                <div className="text-[#505059] text-xs mt-1">Emissor — não conhece os listeners</div>
              </div>

              {/* arrow */}
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-gradient-to-b from-sky-500/50 to-[#29292e]" />
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#505059]" />
              </div>

              {/* listeners */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {[
                  { label: 'Listener A', action: '→ envia email', color: 'text-[#29e0a9]', bg: 'bg-[#29e0a9]/10', border: 'border-[#29e0a9]/20' },
                  { label: 'Listener B', action: '→ reserva estoque', color: 'text-[#9956f6]', bg: 'bg-[#9956f6]/10', border: 'border-[#9956f6]/20' },
                  { label: 'Listener C', action: '→ notifica analytics', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
                ].map((l) => (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className={`${l.bg} border ${l.border} rounded-xl px-4 py-3 text-center`}
                  >
                    <div className={`font-mono font-bold text-xs ${l.color}`}>{l.label}</div>
                    <div className="text-[#7c7c8a] text-xs mt-0.5">{l.action}</div>
                  </motion.div>
                ))}
              </div>

              <p className="text-[#505059] text-xs text-center max-w-md">
                Um único <code className="text-[#7c7c8a]">emit</code> dispara todos os listeners registrados naquele evento, em ordem de registro, de forma <strong className="text-[#a8a8b3]">síncrona</strong>.
              </p>
            </div>
          </div>
        </motion.section>

        {/* methods grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 26 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-white">Métodos essenciais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {METHODS.map((m) => (
              <div
                key={m.name}
                className={`bg-[#121214] border border-[#29292e] rounded-xl p-4 space-y-2`}
              >
                <span className={`inline-block font-mono text-xs font-bold ${m.color} ${m.bg} border ${m.border} px-2 py-1 rounded`}>
                  {m.name}
                </span>
                <p className="text-[#7c7c8a] text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* memory leak warning */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 flex gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-amber-300 font-semibold text-sm">Cuidado com memory leaks</p>
              <p className="text-[#a8a8b3] text-sm leading-relaxed">
                Listeners registrados em objetos de longa vida (singletons, conexões persistentes) sem serem removidos acumulam e causam memory leak. Sempre use{' '}
                <code className="text-amber-300 bg-amber-400/10 px-1 rounded">.off()</code> ao destruir objetos ou{' '}
                <code className="text-amber-300 bg-amber-400/10 px-1 rounded">.once()</code> para handlers de uso único. O Node.js emite um aviso automático quando há mais de 10 listeners no mesmo evento.
              </p>
            </div>
          </div>
        </motion.section>

        {/* concept cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 26 }}
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
          transition={{ delay: 0.4 }}
          className="border-t border-[#29292e] pt-8 flex justify-end"
        >
          <Link
            to="/native-modules"
            className="flex items-center gap-2 bg-[#121214] border border-[#29292e] hover:border-[#505059] rounded-xl px-5 py-3 text-sm text-[#a8a8b3] hover:text-white transition-colors group"
          >
            <Layers className="w-4 h-4 text-[#505059] group-hover:text-[#a8a8b3] transition-colors" />
            Módulos Nativos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
