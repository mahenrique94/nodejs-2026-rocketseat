import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle, GitBranch, ShieldAlert, CheckCircle2, XCircle,
  Clock, ArrowRight, Lightbulb,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── data ─────────────────────────────────────────────────────────────────────

const CALLBACK_HELL_CODE = `// Leitura de config → parse → busca → validação → salvamento
fs.readFile('./config.json', 'utf-8', (err, data) => {
  if (err) return console.error('Erro ao ler config:', err)

  parseConfig(data, (err, config) => {
    if (err) return console.error('Erro ao parsear:', err)

    fetchUser(config.userId, (err, user) => {
      if (err) return console.error('Erro ao buscar usuário:', err)

      validateUser(user, (err, valid) => {
        if (err) return console.error('Erro ao validar:', err)

        saveResult(valid, (err, result) => {
          if (err) return console.error('Erro ao salvar:', err)
          console.log('Concluído!', result)
          // e se precisar de mais um passo aqui?
          //   outro callback...
          //     e outro...
          //       e outro...
        })
      })
    })
  })
})`

const PROMISES_CODE = `// A mesma lógica, de forma linear e legível
fs.promises.readFile('./config.json', 'utf-8')
  .then(parseConfig)
  .then(config => fetchUser(config.userId))
  .then(validateUser)
  .then(saveResult)
  .then(result => console.log('Concluído!', result))
  .catch(err => console.error('Erro:', err))
// Um único .catch() cobre todos os passos acima`

const EVOLUTION_STEPS = [
  {
    id: 'callbacks',
    label: 'Callbacks',
    years: '1995 – 2012',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    description:
      'O início do assincronismo em JavaScript. Funções passadas como argumento para serem chamadas após uma operação. Simples, mas que escala muito mal com operações aninhadas.',
    code: `fs.readFile('./file.txt', (err, data) => {
  if (err) handleError(err)
  else processData(data)
})`,
  },
  {
    id: 'promises',
    label: 'Promises',
    years: 'ES2015 / 2015',
    color: 'text-[#29e0a9]',
    border: 'border-[#29e0a9]/40',
    bg: 'bg-[#29e0a9]/10',
    description:
      'Encadeamento limpo com `.then()` e `.catch()`. Resolveu o aninhamento excessivo. Tratamento de erros centralizado. Novo desafio: chains longas.',
    code: `readFile('./file.txt')
  .then(processData)
  .catch(handleError)`,
  },
  {
    id: 'async-await',
    label: 'Async/Await',
    years: 'ES2017 / 2017',
    color: 'text-[#9956f6]',
    border: 'border-[#9956f6]/40',
    bg: 'bg-[#9956f6]/10',
    description:
      'Sintaxe síncrona para código assíncrono. Melhor legibilidade, depuração e tratamento de erros com try/catch nativo. Açúcar sintático sobre Promises.',
    code: `async function processar() {
  const data = await readFile('./file.txt')
  return processData(data)
}`,
  },
  {
    id: 'promise-api',
    label: 'Promise API',
    years: 'ES2020+ / 2020',
    color: 'text-sky-300',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    description:
      '`Promise.all`, `.race`, `.allSettled`, `.any` — coordenando múltiplas Promises de forma declarativa. O kit completo do assincronismo moderno.',
    code: `const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
])`,
  },
]

const PROBLEMS = [
  {
    Icon: GitBranch,
    title: 'Pyramid of Doom',
    color: 'border-amber-500/30 bg-amber-500/5',
    tc: 'text-amber-400',
    body: 'Cada operação assíncrona adiciona um nível de indentação. Com 5+ operações, o código vira uma pirâmide — impossível de ler, manter ou testar.',
  },
  {
    Icon: AlertTriangle,
    title: 'Error Handling Duplicado',
    color: 'border-red-500/30 bg-red-500/5',
    tc: 'text-red-400',
    body: 'Cada callback precisa de seu próprio `if (err) return`. Fácil esquecer um nível — e deixar erros silenciosos que derrubam a aplicação.',
  },
  {
    Icon: ShieldAlert,
    title: 'Inversion of Control',
    color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
    tc: 'text-[#b585fb]',
    body: 'Você passa sua função para código de terceiros. Perde controle de quando, quantas vezes e se ela será chamada. Um problema fundamental de confiança.',
  },
]

// ─── sub-components ───────────────────────────────────────────────────────────

function CodePanel({
  code,
  label,
  icon,
  accent,
}: {
  code: string
  label: string
  icon: React.ReactNode
  accent: 'bad' | 'good'
}) {
  const styles = {
    bad: { border: 'border-red-500/30', bg: 'bg-red-500/5', header: 'text-red-400' },
    good: { border: 'border-[#29e0a9]/30', bg: 'bg-[#29e0a9]/5', header: 'text-[#29e0a9]' },
  }
  const s = styles[accent]
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${s.border}`}>
        {icon}
        <span className={`text-xs font-bold ${s.header}`}>{label}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function CallbackHellPage() {
  const [activeTab, setActiveTab] = useState<'bad' | 'good'>('bad')
  const [activeStep, setActiveStep] = useState<string | null>(null)

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
            Callback Hell
          </h1>
          <Link to="/promises" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Promises →
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
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-amber-400">Módulo 2 · Assincronismo</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-amber-400 via-red-400 to-[#9956f6] bg-clip-text text-transparent">
              O Problema do Callback Hell
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Antes das Promises e async/await, o JavaScript assíncrono vivia num labirinto de callbacks
            aninhados. Entenda o problema que motivou toda a evolução do assincronismo moderno.
          </motion.p>
        </motion.div>

        {/* the problem — tab switcher */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">O Problema em Código</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="flex border-b border-[#29292e]">
              {[
                { key: 'bad' as const, label: '❌ Callback Hell', color: 'border-red-400' },
                { key: 'good' as const, label: '✅ Com Promises', color: 'border-[#29e0a9]' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer
                    ${activeTab === tab.key
                      ? `text-white ${tab.color}`
                      : 'text-[#505059] border-transparent hover:text-[#a8a8b3]'
                    }`}
                >
                  {tab.label}
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
                className="p-5"
              >
                {activeTab === 'bad' ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[#a8a8b3] text-xs leading-relaxed">
                        Cada operação assíncrona aninha dentro da anterior. Com 5 passos, o código se move
                        4 níveis para a direita — a <strong className="text-red-400">Pyramid of Doom</strong>.
                      </p>
                    </div>
                    <pre className="bg-[#09090a] border border-red-500/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {CALLBACK_HELL_CODE}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-[#29e0a9] shrink-0 mt-0.5" />
                      <p className="text-[#a8a8b3] text-xs leading-relaxed">
                        Com Promises, a mesma lógica vira uma cadeia linear — legível de cima para baixo,
                        com um único <code className="text-[#29e0a9] font-mono">.catch()</code> cobrindo todos os erros.
                      </p>
                    </div>
                    <pre className="bg-[#09090a] border border-[#29e0a9]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {PROMISES_CODE}
                    </pre>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* the 3 problems */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Por que é um problema?</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROBLEMS.map(({ Icon, title, color, tc, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 28 }}
                className={`rounded-xl border p-5 ${color}`}
              >
                <Icon className={`w-5 h-5 mb-3 ${tc}`} />
                <h4 className={`font-bold text-sm mb-2 ${tc}`}>{title}</h4>
                <p className="text-[#7c7c8a] text-xs leading-5">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* evolution timeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">A Evolução do Assincronismo</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="space-y-3">
            {EVOLUTION_STEPS.map((step, i) => {
              const isActive = activeStep === step.id
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer
                      ${isActive ? `${step.bg} ${step.border}` : 'bg-[#121214] border-[#29292e] hover:border-[#323238]'}`}
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs
                        ${isActive ? `${step.border} ${step.color}` : 'border-[#29292e] text-[#505059]'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`font-bold text-sm ${isActive ? step.color : 'text-[#a8a8b3]'}`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-[#505059] font-mono">{step.years}</span>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'rotate-90 text-white/50' : 'text-[#323238]'}`} />
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-3">
                            <p className="text-[#a8a8b3] text-sm leading-relaxed">{step.description}</p>
                            <pre className={`bg-[#09090a] border ${step.border} rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto`}>
                              {step.code}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              )
            })}
          </div>

          <div className="flex items-start gap-3 bg-[#121214] border border-[#29292e] rounded-xl px-5 py-4">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              <strong className="text-white">Não existe solução perfeita — existe evolução.</strong>{' '}
              Callbacks funcionam para casos simples. O problema só aparece com operações aninhadas.
              Por isso as Promises e o async/await foram criados: não para substituir callbacks, mas para tornar o código assíncrono complexo legível.
            </p>
          </div>
        </section>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            {
              Icon: Clock,
              title: 'Callback: a origem',
              color: 'border-[#29292e] bg-[#121214]',
              tc: 'text-[#a8a8b3]',
              body: 'Passar funções como argumento é fundamental em JS. O problema não é o callback em si — é o aninhamento excessivo que surge com operações assíncronas encadeadas.',
            },
            {
              Icon: GitBranch,
              title: 'Pyramid of Doom',
              color: 'border-red-500/30 bg-red-500/5',
              tc: 'text-red-400',
              body: 'Com cada nível de callback, o código se move para a direita, formando uma pirâmide. Torna-se impossível testar, manter e tratar erros de forma consistente.',
            },
            {
              Icon: CheckCircle2,
              title: 'A Solução: Promises',
              color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
              tc: 'text-[#b585fb]',
              body: 'ES2015 introduziu Promises para resolver exatamente isso. A próxima aula mostra como `.then()`, `.catch()` e `.finally()` transformam o código assíncrono.',
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
