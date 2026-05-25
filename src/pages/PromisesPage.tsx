import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Zap, Link2, RefreshCcw, Lightbulb, Code2,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type PromiseState = 'pending' | 'fulfilled' | 'rejected'
type MethodTab = 'then' | 'catch' | 'finally'

// ─── data ─────────────────────────────────────────────────────────────────────

const STATE_CONFIG = {
  pending: {
    label: 'Pending',
    desc: 'A Promise foi criada. O trabalho está em andamento.',
    color: 'text-[#7c7c8a]',
    border: 'border-[#505059]/50',
    bg: 'bg-[#29292e]/40',
    pulse: 'bg-[#505059]',
    code: `const p = new Promise((resolve, reject) => {
  // trabalhando...
  // ainda não resolvida nem rejeitada
})

console.log(p) // Promise { <pending> }`,
  },
  fulfilled: {
    label: 'Fulfilled',
    desc: 'A operação foi concluída com sucesso. O valor está disponível.',
    color: 'text-[#29e0a9]',
    border: 'border-[#29e0a9]/50',
    bg: 'bg-[#29e0a9]/10',
    pulse: 'bg-[#29e0a9]',
    code: `const p = new Promise((resolve, reject) => {
  resolve('dados carregados') // ← resolve com valor
})

p.then(value => {
  console.log(value) // 'dados carregados'
})`,
  },
  rejected: {
    label: 'Rejected',
    desc: 'A operação falhou. O motivo (reason) está disponível.',
    color: 'text-red-400',
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    pulse: 'bg-red-400',
    code: `const p = new Promise((resolve, reject) => {
  reject(new Error('falha na conexão')) // ← rejeita
})

p.catch(err => {
  console.error(err.message) // 'falha na conexão'
})`,
  },
}

const METHOD_TABS: { id: MethodTab; label: string; color: string }[] = [
  { id: 'then', label: '.then()', color: 'text-[#29e0a9]' },
  { id: 'catch', label: '.catch()', color: 'text-red-400' },
  { id: 'finally', label: '.finally()', color: 'text-amber-400' },
]

const METHOD_CONTENT: Record<MethodTab, { desc: string; tip: string; code: string }> = {
  then: {
    desc: 'Chamado quando a Promise é resolvida. Recebe o valor e retorna uma nova Promise, permitindo encadeamento.',
    tip: 'Cada .then() retorna uma nova Promise. Se você retornar um valor, ele vira a resolução da próxima. Se retornar uma Promise, ela é esperada.',
    code: `fetch('https://api.github.com/users/rocketseat')
  .then(response => response.json())    // Response → JSON
  .then(user => {
    console.log(user.name)              // 'Rocketseat'
    return user.followers               // passa adiante
  })
  .then(followers => {
    console.log(followers)              // número de seguidores
  })
// Cada .then() encadeia — o retorno vira o próximo input`,
  },
  catch: {
    desc: 'Chamado quando qualquer Promise da cadeia é rejeitada. Equivale a .then(null, onRejected).',
    tip: 'Um único .catch() no final captura erros de qualquer .then() anterior. Muito mais limpo que verificar err em cada callback.',
    code: `fetch('https://api.exemplo.com/dados')
  .then(res => {
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    return res.json()
  })
  .then(dados => processar(dados))
  .catch(err => {
    // Captura qualquer erro da cadeia inteira ↑
    console.error('Falhou:', err.message)
  })`,
  },
  finally: {
    desc: 'Executado sempre — seja a Promise resolvida ou rejeitada. Ideal para limpeza e operações de finalização.',
    tip: '.finally() não recebe o valor da Promise — apenas sinaliza que ela foi concluída, independente do resultado.',
    code: `let isLoading = true

fetch('/api/usuario')
  .then(res => res.json())
  .then(user => renderizar(user))
  .catch(err => mostrarErro(err))
  .finally(() => {
    isLoading = false   // sempre executa
    esconderSpinner()   // sucesso ou erro
  })`,
  },
}

const CHAIN_STEPS = [
  { label: "fetch('/api/user')", type: 'Promise<Response>' },
  { label: '.then(res => res.json())', type: 'Promise<User>' },
  { label: '.then(user => salvar(user))', type: 'Promise<void>' },
  { label: ".then(() => 'Pronto!')", type: 'string' },
]

const CREATE_CODE = `// Promisificando uma função com callback
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

// Uso:
readFileAsync('./config.json')
  .then(JSON.parse)
  .then(config => console.log(config))
  .catch(err => console.error(err))

// Node.js já oferece versões promisificadas:
import { readFile } from 'node:fs/promises'
const data = await readFile('./config.json', 'utf-8')`

// ─── sub-components ───────────────────────────────────────────────────────────

function StateMachine({
  current,
  onSet,
}: {
  current: PromiseState
  onSet: (s: PromiseState) => void
}) {
  const s = STATE_CONFIG[current]

  return (
    <div className="space-y-5">
      {/* diagram */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* pending */}
        <motion.div
          animate={{ scale: current === 'pending' ? 1.06 : 1 }}
          className={`rounded-xl border px-5 py-4 text-center min-w-[120px] transition-all duration-300
            ${current === 'pending' ? 'border-[#505059]/50 bg-[#29292e]/40' : 'border-[#29292e] bg-[#121214]'}`}
        >
          <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${current === 'pending' ? 'bg-[#505059] animate-pulse' : 'bg-[#29292e]'}`} />
          <p className={`text-xs font-bold ${current === 'pending' ? 'text-[#a8a8b3]' : 'text-[#505059]'}`}>Pending</p>
        </motion.div>

        {/* arrows */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-2">
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            <button
              onClick={() => onSet('fulfilled')}
              className={`rounded-lg border px-3 py-1.5 text-[10px] font-mono transition-all duration-200 cursor-pointer
                ${current === 'fulfilled' ? 'border-[#29e0a9]/40 bg-[#29e0a9]/10 text-[#29e0a9]' : 'border-[#29292e] text-[#505059] hover:text-[#a8a8b3]'}`}
            >
              resolve(value) →
            </button>
          </div>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            <button
              onClick={() => onSet('rejected')}
              className={`rounded-lg border px-3 py-1.5 text-[10px] font-mono transition-all duration-200 cursor-pointer
                ${current === 'rejected' ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-[#29292e] text-[#505059] hover:text-[#a8a8b3]'}`}
            >
              reject(reason) →
            </button>
          </div>
        </div>

        {/* fulfilled / rejected */}
        <div className="flex flex-col gap-3">
          <motion.div
            animate={{ scale: current === 'fulfilled' ? 1.06 : 1 }}
            className={`rounded-xl border px-5 py-4 text-center min-w-[120px] transition-all duration-300
              ${current === 'fulfilled' ? 'border-[#29e0a9]/50 bg-[#29e0a9]/10' : 'border-[#29292e] bg-[#121214]'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${current === 'fulfilled' ? 'bg-[#29e0a9] animate-pulse' : 'bg-[#29292e]'}`} />
            <p className={`text-xs font-bold ${current === 'fulfilled' ? 'text-[#29e0a9]' : 'text-[#505059]'}`}>Fulfilled</p>
          </motion.div>
          <motion.div
            animate={{ scale: current === 'rejected' ? 1.06 : 1 }}
            className={`rounded-xl border px-5 py-4 text-center min-w-[120px] transition-all duration-300
              ${current === 'rejected' ? 'border-red-500/50 bg-red-500/10' : 'border-[#29292e] bg-[#121214]'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${current === 'rejected' ? 'bg-red-400 animate-pulse' : 'bg-[#29292e]'}`} />
            <p className={`text-xs font-bold ${current === 'rejected' ? 'text-red-400' : 'text-[#505059]'}`}>Rejected</p>
          </motion.div>
        </div>
      </div>

      {/* state detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={`rounded-xl border p-5 space-y-3 ${s.bg} ${s.border}`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${s.pulse} animate-pulse`} />
            <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
          </div>
          <p className="text-[#a8a8b3] text-sm leading-relaxed">{s.desc}</p>
          <pre className={`bg-[#09090a] border ${s.border} rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto`}>
            {s.code}
          </pre>
        </motion.div>
      </AnimatePresence>

      {/* state buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => onSet('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
            ${current === 'pending' ? 'bg-[#29292e] border-[#505059]/50 text-white' : 'bg-[#121214] border-[#29292e] text-[#505059] hover:text-[#a8a8b3]'}`}
        >
          ● Criar Promise
        </button>
        <button
          onClick={() => onSet('fulfilled')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
            ${current === 'fulfilled' ? 'bg-[#29e0a9]/15 border-[#29e0a9]/40 text-[#29e0a9]' : 'bg-[#121214] border-[#29292e] text-[#505059] hover:text-[#a8a8b3]'}`}
        >
          ✓ Resolver
        </button>
        <button
          onClick={() => onSet('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
            ${current === 'rejected' ? 'bg-red-500/15 border-red-500/40 text-red-400' : 'bg-[#121214] border-[#29292e] text-[#505059] hover:text-[#a8a8b3]'}`}
        >
          ✗ Rejeitar
        </button>
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function PromisesPage() {
  const [promiseState, setPromiseState] = useState<PromiseState>('pending')
  const [methodTab, setMethodTab] = useState<MethodTab>('then')

  const method = METHOD_CONTENT[methodTab]

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Promises
          </h1>
          <Link to="/async-await" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Async/Await →
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
            className="inline-flex items-center gap-2 bg-[#29e0a9]/10 border border-[#29e0a9]/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-[#29e0a9]">Módulo 2 · Assincronismo</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-[#29e0a9] via-[#9956f6] to-[#e254ff] bg-clip-text text-transparent">
              Promises: Anatomia e Encadeamento
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Uma Promise representa um valor que pode estar disponível agora, no futuro, ou nunca.
            Entenda os três estados e domine <code className="text-[#29e0a9] bg-[#29e0a9]/10 px-1.5 rounded">.then()</code>,{' '}
            <code className="text-red-400 bg-red-500/10 px-1.5 rounded">.catch()</code> e{' '}
            <code className="text-amber-400 bg-amber-500/10 px-1.5 rounded">.finally()</code>.
          </motion.p>
        </motion.div>

        {/* state machine */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">Os 3 Estados de uma Promise</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>
          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6">
            <p className="text-[#505059] text-xs mb-5 text-center">
              Clique em um botão ou seta para mudar de estado
            </p>
            <StateMachine current={promiseState} onSet={setPromiseState} />
          </div>
        </section>

        {/* anatomy — then/catch/finally */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9956f6]">Anatomia dos Métodos</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="flex border-b border-[#29292e]">
              {METHOD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMethodTab(tab.id)}
                  className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer font-mono
                    ${methodTab === tab.id
                      ? `text-white ${tab.id === 'then' ? 'border-[#29e0a9]' : tab.id === 'catch' ? 'border-red-400' : 'border-amber-400'}`
                      : 'text-[#505059] border-transparent hover:text-[#a8a8b3]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={methodTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="p-5 space-y-4"
              >
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{method.desc}</p>
                <pre className="bg-[#09090a] border border-[#29292e] rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                  {method.code}
                </pre>
                <div className="flex items-start gap-3 bg-[#202024] rounded-xl px-4 py-3">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[#7c7c8a] text-xs leading-relaxed">{method.tip}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* chaining pipeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b585fb]">O Encadeamento de Promises</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6 space-y-4">
            <p className="text-[#505059] text-xs">Cada etapa recebe o resultado da anterior e retorna uma nova Promise</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-x-auto pb-2">
              {CHAIN_STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#09090a] border border-[#9956f6]/30 rounded-xl px-4 py-3 flex-shrink-0"
                  >
                    <p className="text-[#b585fb] text-xs font-mono font-semibold">{step.label}</p>
                    <p className="text-[#505059] text-[10px] mt-1">{step.type}</p>
                  </motion.div>
                  {i < CHAIN_STEPS.length - 1 && (
                    <span className="text-[#323238] text-lg self-center hidden sm:block">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-start gap-3 bg-[#202024] rounded-xl px-4 py-3">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[#7c7c8a] text-xs leading-relaxed">
                Cada <code className="text-[#b585fb] font-mono">.then()</code> retorna uma <strong className="text-white">nova</strong> Promise.
                Se você retornar um valor, ele vira a resolução da próxima. Se retornar uma Promise, ela é esperada antes de continuar.
              </p>
            </div>
          </div>
        </section>

        {/* creating promises */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">Criando Promises do Zero</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>
          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="border-b border-[#29292e] px-4 py-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#505059]" />
              <span className="text-[#505059] text-xs font-mono">promisify.js</span>
            </div>
            <pre className="p-5 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
              {CREATE_CODE}
            </pre>
          </div>
        </section>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            {
              Icon: RefreshCcw,
              title: '3 Estados',
              color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
              tc: 'text-[#29e0a9]',
              body: 'Pending → Fulfilled ou Rejected. Uma vez que uma Promise é resolvida ou rejeitada, ela é imutável — seu estado nunca muda novamente.',
            },
            {
              Icon: Link2,
              title: 'Encadeamento',
              color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
              tc: 'text-[#b585fb]',
              body: 'Cada .then() recebe o valor do anterior e retorna uma nova Promise. Isso cria uma cadeia linear e legível, sem o aninhamento do callback hell.',
            },
            {
              Icon: Zap,
              title: 'Tratamento de Erros',
              color: 'border-red-500/30 bg-red-500/5',
              tc: 'text-red-400',
              body: 'Um único .catch() no final captura erros de qualquer .then() anterior. Muito mais limpo que verificar if(err) em cada nível de callback.',
            },
          ].map(({ Icon, title, color, tc, body }) => (
            <div key={title} className={`rounded-xl border p-5 ${color}`}>
              <Icon className={`w-5 h-5 mb-3 ${tc}`} />
              <h4 className={`font-bold text-sm mb-2 ${tc}`}>{title}</h4>
              <p className="text-[#7c7c8a] text-xs leading-5">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
