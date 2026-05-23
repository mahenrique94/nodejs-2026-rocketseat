import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, Zap, List, Target, AlertTriangle, XCircle } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type MethodId = 'all' | 'race' | 'allSettled' | 'any'

// ─── data ─────────────────────────────────────────────────────────────────────

const METHODS = [
  {
    id: 'all' as MethodId,
    name: 'Promise.all',
    tagline: 'Todos ou nenhum',
    color: 'text-[#29e0a9]',
    border: 'border-[#29e0a9]/40',
    bg: 'bg-[#29e0a9]/10',
    Icon: CheckCircle2,
    behavior: 'Resolve quando TODAS as Promises resolvem. Rejeita imediatamente se QUALQUER uma rejeitar.',
    useCase: 'Buscar dados independentes em paralelo. Ex: carregar usuário + posts + comentários ao mesmo tempo — todos são necessários.',
    successResult: 'Array com os valores na mesma ordem das Promises passadas',
    failResult: 'Rejeita com o erro da primeira Promise que falhar',
    code: `const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
])
// ✅ Paralelo — ~3x mais rápido que sequencial
// ❌ Se fetchPosts() falhar, o resultado inteiro é perdido`,
  },
  {
    id: 'race' as MethodId,
    name: 'Promise.race',
    tagline: 'O mais rápido vence',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    Icon: Zap,
    behavior: 'Resolve ou rejeita com o resultado da Promise que terminar PRIMEIRO — sucesso ou falha.',
    useCase: 'Timeout pattern. Buscar dado com limite de tempo — o que chegar primeiro: o resultado real ou o erro de timeout.',
    successResult: 'Resolve com o valor da Promise mais rápida',
    failResult: 'Rejeita com o erro da Promise mais rápida a falhar',
    code: `function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout!')), ms)
  )
  return Promise.race([promise, timeout])
}

const data = await withTimeout(fetchData(), 5000)
// ✅ Rejeita após 5s se a fetch não terminar`,
  },
  {
    id: 'allSettled' as MethodId,
    name: 'Promise.allSettled',
    tagline: 'Espera todos, sem cancelar',
    color: 'text-[#b585fb]',
    border: 'border-[#9956f6]/40',
    bg: 'bg-[#9956f6]/10',
    Icon: List,
    behavior: 'Espera que TODAS terminem, resolvidas ou rejeitadas. Nunca rejeita — sempre retorna um array com o status de cada Promise.',
    useCase: 'Processar múltiplos itens onde falhas parciais são aceitáveis. Ex: enviar emails para N usuários — quer saber quais falharam.',
    successResult: 'Array de { status: "fulfilled", value } ou { status: "rejected", reason }',
    failResult: 'NUNCA rejeita — sempre resolve com o array completo',
    code: `const results = await Promise.allSettled([
  sendEmail('user1@email.com'),
  sendEmail('user2@email.com'), // pode falhar
  sendEmail('user3@email.com'),
])

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Enviado:', result.value)
  } else {
    console.error('Falhou:', result.reason)
  }
})`,
  },
  {
    id: 'any' as MethodId,
    name: 'Promise.any',
    tagline: 'Qualquer um que resolver',
    color: 'text-sky-300',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    Icon: Target,
    behavior: 'Resolve com o valor da PRIMEIRA Promise que resolver com sucesso. Só rejeita se TODAS as Promises falharem.',
    useCase: 'Fallback entre múltiplas fontes. Ex: buscar dado de CDN1, CDN2 ou CDN3 — aceita o primeiro que responder.',
    successResult: 'Resolve com o valor da primeira Promise bem-sucedida',
    failResult: 'Rejeita com AggregateError se TODAS as Promises falharem',
    code: `// Buscar de múltiplas fontes — o primeiro que responder
const data = await Promise.any([
  fetch('https://cdn1.exemplo.com/api').then(r => r.json()),
  fetch('https://cdn2.exemplo.com/api').then(r => r.json()),
  fetch('https://cdn3.exemplo.com/api').then(r => r.json()),
])
// ✅ Resolve com o CDN mais rápido
// ❌ Só falha se os 3 CDNs falharem (AggregateError)`,
  },
]

const SEQUENTIAL_CODE = `// ⚠️ Sequencial — executa um de cada vez: ~3s total
const user    = await fetchUser(id)         // 1s
const posts   = await fetchPosts(id)        // 1s
const profile = await fetchProfile(id)      // 1s
// Total: ~3 segundos`

const PARALLEL_CODE = `// ✅ Paralelo — executa ao mesmo tempo: ~1s total
const [user, posts, profile] = await Promise.all([
  fetchUser(id),      // todos iniciam
  fetchPosts(id),     // ao mesmo tempo
  fetchProfile(id),   // ~1s total
])`

// ─── sub-components ───────────────────────────────────────────────────────────

function TimingBar({ label, segments, color }: { label: string; segments: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[#505059] text-xs">{label}</p>
      <div className="flex gap-1">
        {Array.from({ length: segments }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className={`h-6 rounded flex-1 ${color} flex items-center justify-center text-[10px] font-mono text-white/80`}
          >
            1s
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function PromiseApiPage() {
  const [activeMethod, setActiveMethod] = useState<MethodId>('all')

  const method = METHODS.find((m) => m.id === activeMethod)!

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
            Promise API
          </h1>
          <Link to="/module-system" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Módulos →
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
            className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-pink-400">Módulo 2 · Assincronismo</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-pink-400 via-[#9956f6] to-[#29e0a9] bg-clip-text text-transparent">
              Promise API: all, race, allSettled, any
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Quando você precisa coordenar múltiplas Promises simultâneas, a Promise API oferece
            quatro métodos com comportamentos distintos. Escolha o certo para cada cenário.
          </motion.p>
        </motion.div>

        {/* method selector */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Explorando os 4 Métodos</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METHODS.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setActiveMethod(m.id)}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer
                  ${activeMethod === m.id ? `${m.bg} ${m.border}` : 'bg-[#121214] border-[#29292e] hover:border-[#323238]'}`}
              >
                <m.Icon className={`w-5 h-5 mb-2 ${activeMethod === m.id ? m.color : 'text-[#505059]'}`} />
                <p className={`text-xs font-bold ${activeMethod === m.id ? m.color : 'text-[#7c7c8a]'}`}>
                  {m.name}
                </p>
                <p className="text-[#505059] text-[10px] mt-0.5">{m.tagline}</p>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMethod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`bg-[#121214] border rounded-xl p-6 space-y-5 ${method.border}`}
            >
              <div className="flex items-start gap-3">
                <method.Icon className={`w-6 h-6 ${method.color} shrink-0 mt-0.5`} />
                <div>
                  <h3 className={`font-bold text-lg ${method.color}`}>{method.name}</h3>
                  <p className="text-[#505059] text-xs">{method.tagline}</p>
                </div>
              </div>

              <p className="text-[#a8a8b3] text-sm leading-relaxed">{method.behavior}</p>

              <div className="bg-[#202024] rounded-xl px-4 py-3">
                <p className="text-[#505059] text-xs mb-1">Caso de uso</p>
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{method.useCase}</p>
              </div>

              <pre className={`bg-[#09090a] border ${method.border} rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto`}>
                {method.code}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#29e0a9] shrink-0 mt-0.5" />
                  <p className="text-[#7c7c8a] text-xs leading-relaxed">{method.successResult}</p>
                </div>
                <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[#7c7c8a] text-xs leading-relaxed">{method.failResult}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* decision matrix */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9956f6]">Quando usar cada um?</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[#29292e]">
              <div className="px-4 py-3" />
              <div className="px-4 py-3 border-l border-[#29292e] text-center">
                <p className="text-[#29e0a9] text-xs font-bold">Precisa de TODOS</p>
              </div>
              <div className="px-4 py-3 border-l border-[#29292e] text-center">
                <p className="text-sky-300 text-xs font-bold">Qualquer UM basta</p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-b border-[#29292e]">
              <div className="px-4 py-4 flex items-center">
                <p className="text-red-400 text-xs font-bold">Abortar na falha</p>
              </div>
              <div className="px-4 py-4 border-l border-[#29292e] text-center">
                <span className="text-[#29e0a9] text-sm font-bold font-mono">Promise.all</span>
                <p className="text-[#505059] text-[10px] mt-1">Todos ou nenhum</p>
              </div>
              <div className="px-4 py-4 border-l border-[#29292e] text-center">
                <span className="text-amber-400 text-sm font-bold font-mono">Promise.race</span>
                <p className="text-[#505059] text-[10px] mt-1">O mais rápido</p>
              </div>
            </div>
            <div className="grid grid-cols-3">
              <div className="px-4 py-4 flex items-center">
                <p className="text-[#29e0a9] text-xs font-bold">Continuar na falha</p>
              </div>
              <div className="px-4 py-4 border-l border-[#29292e] text-center">
                <span className="text-[#b585fb] text-sm font-bold font-mono">Promise.allSettled</span>
                <p className="text-[#505059] text-[10px] mt-1">Todos os resultados</p>
              </div>
              <div className="px-4 py-4 border-l border-[#29292e] text-center">
                <span className="text-sky-300 text-sm font-bold font-mono">Promise.any</span>
                <p className="text-[#505059] text-[10px] mt-1">Primeiro sucesso</p>
              </div>
            </div>
          </div>
        </section>

        {/* sequential vs parallel */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">O Erro Mais Comum</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-400 text-xs font-bold">Sequencial — lento (~3s)</span>
              </div>
              <pre className="bg-[#09090a] border border-red-500/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75]">
                {SEQUENTIAL_CODE}
              </pre>
              <TimingBar label="Tempo total: ~3 segundos" segments={3} color="bg-red-500/60" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#29e0a9] shrink-0" />
                <span className="text-[#29e0a9] text-xs font-bold">Paralelo — rápido (~1s)</span>
              </div>
              <pre className="bg-[#09090a] border border-[#29e0a9]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75]">
                {PARALLEL_CODE}
              </pre>
              <TimingBar label="Tempo total: ~1 segundo" segments={1} color="bg-[#29e0a9]/60" />
            </div>
          </div>
        </section>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
          {[
            { m: METHODS[0] },
            { m: METHODS[1] },
            { m: METHODS[2] },
            { m: METHODS[3] },
          ].map(({ m }) => (
            <div key={m.id} className={`rounded-xl border p-5 ${m.bg} ${m.border}`}>
              <m.Icon className={`w-5 h-5 mb-3 ${m.color}`} />
              <h4 className={`font-bold text-sm mb-2 ${m.color}`}>{m.name}</h4>
              <p className="text-[#7c7c8a] text-xs leading-5">{m.tagline}. {m.behavior.split('.')[0]}.</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
