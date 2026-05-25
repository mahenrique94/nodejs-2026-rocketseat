import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Lightbulb, CheckCircle2, XCircle, Code2, Zap, RefreshCcw } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── data ─────────────────────────────────────────────────────────────────────

type ErrorTab = 'basic' | 'http' | 'toplevel'

const COMPARISON_PROMISE = `function buscarPerfil(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(res => {
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      return res.json()
    })
    .then(user => fetch(\`/api/posts?userId=\${user.id}\`))
    .then(res => res.json())
    .then(posts => ({ user, posts }))
    // ⚠️ 'user' não está no escopo deste .then()!
    .catch(err => {
      console.error('Erro:', err)
      throw err
    })
}`

const COMPARISON_ASYNC = `async function buscarPerfil(userId) {
  try {
    const res = await fetch(\`/api/users/\${userId}\`)
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)

    const user = await res.json()
    const postsRes = await fetch(\`/api/posts?userId=\${user.id}\`)
    const posts = await postsRes.json()

    return { user, posts }  // ✅ 'user' disponível aqui
  } catch (err) {
    console.error('Erro:', err)
    throw err
  }
}`

const ERROR_TABS: { id: ErrorTab; label: string }[] = [
  { id: 'basic', label: 'try/catch básico' },
  { id: 'http', label: 'Erros HTTP' },
  { id: 'toplevel', label: 'Top-level await' },
]

const ERROR_CONTENT: Record<ErrorTab, { desc: string; code: string }> = {
  basic: {
    desc: 'O try/catch com async/await cobre tanto erros síncronos (como JSON.parse inválido) quanto erros assíncronos (erros de rede, I/O).',
    code: `async function carregarDados() {
  try {
    const data = await readFile('./config.json', 'utf-8')
    const config = JSON.parse(data)  // pode lançar SyntaxError
    return config
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Arquivo não encontrado')
    } else if (err instanceof SyntaxError) {
      console.error('JSON inválido:', err.message)
    } else {
      throw err  // re-lança erros inesperados
    }
  } finally {
    console.log('Sempre executa — sucesso ou erro')
  }
}`,
  },
  http: {
    desc: 'Atenção: fetch() NÃO lança erro em respostas 4xx/5xx. Você precisa verificar res.ok manualmente e lançar o erro.',
    code: `async function buscarUsuario(id) {
  const res = await fetch(\`/api/users/\${id}\`)

  // fetch NÃO lança erro em respostas 4xx/5xx!
  // Você precisa verificar manualmente:
  if (!res.ok) {
    throw new Error(\`Erro HTTP: \${res.status} \${res.statusText}\`)
  }

  return res.json()
}

// Uso:
try {
  const user = await buscarUsuario(42)
  console.log(user.name)
} catch (err) {
  console.error(err.message) // 'Erro HTTP: 404 Not Found'
}`,
  },
  toplevel: {
    desc: 'Em módulos ESM (.mjs ou "type":"module"), você pode usar await diretamente no nível do módulo — sem precisar de uma função async.',
    code: `// Em um arquivo ESM, await funciona no nível do módulo:
const config = await readFile('./config.json', 'utf-8')
const { port, host } = JSON.parse(config)

const server = createServer(handleRequest)
server.listen(port, host)
console.log(\`Servidor em \${host}:\${port}\`)

// Antes disso, era necessário usar um IIFE:
// ;(async () => {
//   const config = await readFile('./config.json')
//   ...
// })()`,
  },
}

const PATTERNS = [
  {
    title: 'Paralelo com Promise.all',
    color: 'border-amber-500/30 bg-amber-500/5',
    tc: 'text-amber-400',
    desc: 'Para executar múltiplas operações independentes em paralelo, use await Promise.all([]). Evite await sequencial sem necessidade.',
    code: `const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id),
])`,
  },
  {
    title: 'Loop com await',
    color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
    tc: 'text-[#b585fb]',
    desc: 'await funciona dentro de for...of. Array.forEach() NÃO espera corretamente — prefira for...of ou Promise.all.',
    code: `// ✅ Correto — sequencial
for (const id of ids) {
  const user = await getUser(id)
}`,
  },
  {
    title: 'Valor padrão',
    color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
    tc: 'text-[#29e0a9]',
    desc: 'Combine async/await com nullish coalescing para valores padrão seguros quando a operação pode retornar null.',
    code: `const data = await fetchConfig() ?? defaultConfig`,
  },
  {
    title: 'Retorno implícito',
    color: 'border-sky-500/30 bg-sky-500/5',
    tc: 'text-sky-300',
    desc: 'Funções async SEMPRE retornam uma Promise, mesmo que o return seja síncrono. O valor é encapsulado automaticamente.',
    code: `async function getName() {
  return 'Ana' // retorna Promise<string>
}`,
  },
]

const UNDER_HOOD_LEFT = `async function exemplo() {
  const dados = await buscarDados()
  return processar(dados)
}`

const UNDER_HOOD_RIGHT = `function exemplo() {
  return buscarDados()
    .then(dados => processar(dados))
}`

// ─── page ─────────────────────────────────────────────────────────────────────

export function AsyncAwaitPage() {
  const [activeTab, setActiveTab] = useState<'promises' | 'async'>('promises')
  const [errorTab, setErrorTab] = useState<ErrorTab>('basic')

  const error = ERROR_CONTENT[errorTab]

  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <RocketseatIcon className="h-6 w-auto text-[#F7F7FA] group-hover:text-white transition" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-center text-white/90 hidden sm:block">
            Async/Await
          </h1>
          <Link to="/promise-api" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Promise API →
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
            <span className="text-xs font-semibold text-[#b585fb]">Módulo 2 · Assincronismo</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-[#9956f6] via-[#e254ff] to-[#29e0a9] bg-clip-text text-transparent">
              Async/Await: A Forma Moderna
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Async/await é açúcar sintático sobre Promises. Escreva código assíncrono com a aparência
            de código síncrono — mais legível, mais fácil de depurar e com tratamento de erros nativo via try/catch.
          </motion.p>
        </motion.div>

        {/* comparison */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9956f6]">Promises vs Async/Await</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="flex border-b border-[#29292e]">
              {[
                { key: 'promises' as const, label: 'Com Promises', border: 'border-[#5f75f2]' },
                { key: 'async' as const, label: 'Com Async/Await', border: 'border-[#29e0a9]' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer
                    ${activeTab === tab.key ? `text-white ${tab.border}` : 'text-[#505059] border-transparent hover:text-[#a8a8b3]'}`}
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
                className="p-5 space-y-3"
              >
                {activeTab === 'promises' ? (
                  <>
                    <div className="flex items-start gap-3 bg-[#5f75f2]/5 border border-[#5f75f2]/20 rounded-xl px-4 py-3">
                      <XCircle className="w-4 h-4 text-[#a0b0ff] shrink-0 mt-0.5" />
                      <p className="text-[#a8a8b3] text-xs leading-relaxed">
                        Problema clássico: <code className="text-[#a0b0ff] font-mono">user</code> declarado
                        em um <code className="text-[#a0b0ff] font-mono">.then()</code> não fica disponível no próximo.
                        Você precisa criar variáveis externas ou reformular a lógica.
                      </p>
                    </div>
                    <pre className="bg-[#09090a] border border-[#5f75f2]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {COMPARISON_PROMISE}
                    </pre>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-[#29e0a9] shrink-0 mt-0.5" />
                      <p className="text-[#a8a8b3] text-xs leading-relaxed">
                        Com async/await, <code className="text-[#29e0a9] font-mono">user</code> é declarado
                        com <code className="text-[#29e0a9] font-mono">const</code> e fica disponível
                        em todo o escopo da função — código linear e legível.
                      </p>
                    </div>
                    <pre className="bg-[#09090a] border border-[#29e0a9]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {COMPARISON_ASYNC}
                    </pre>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* error handling */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Tratamento de Erros</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="flex flex-wrap gap-1 p-3 border-b border-[#29292e]">
              {ERROR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setErrorTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer
                    ${errorTab === tab.id ? 'bg-[#9956f6]/20 border border-[#9956f6]/40 text-[#b585fb]' : 'text-[#505059] hover:text-[#a8a8b3]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={errorTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="p-5 space-y-4"
              >
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{error.desc}</p>
                <pre className="bg-[#09090a] border border-[#29292e] rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                  {error.code}
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* patterns */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">Padrões com Async/Await</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PATTERNS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl border p-5 space-y-3 ${p.color}`}
              >
                <h4 className={`font-bold text-sm ${p.tc}`}>{p.title}</h4>
                <p className="text-[#7c7c8a] text-xs leading-relaxed">{p.desc}</p>
                <pre className="bg-[#09090a] border border-[#29292e] rounded-xl p-3 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                  {p.code}
                </pre>
              </motion.div>
            ))}
          </div>
        </section>

        {/* under the hood */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#505059]">Por Baixo dos Panos</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-6">
            <p className="text-[#505059] text-xs mb-4 text-center">Async/await é transformado em Promises pelo motor JavaScript</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <p className="text-[#505059] text-[10px] uppercase tracking-widest">O que você escreve</p>
                <pre className="bg-[#09090a] border border-[#9956f6]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75]">
                  {UNDER_HOOD_LEFT}
                </pre>
              </div>
              <div className="flex flex-col gap-3">
                <div className="hidden lg:flex justify-center">
                  <span className="text-[#323238] text-2xl">⟺</span>
                </div>
                <div className="lg:hidden text-center text-[#323238] text-xs uppercase tracking-widest">equivalente</div>
                <div className="space-y-2">
                  <p className="text-[#505059] text-[10px] uppercase tracking-widest">O que o motor executa</p>
                  <pre className="bg-[#09090a] border border-[#29e0a9]/20 rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75]">
                    {UNDER_HOOD_RIGHT}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-4 bg-[#202024] rounded-xl px-4 py-3">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[#7c7c8a] text-xs leading-relaxed">
                Async/await <strong className="text-white">não substitui</strong> Promises — ele é construído sobre elas.
                Entender Promises é essencial para depurar código async/await.
              </p>
            </div>
          </div>
        </section>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            {
              Icon: Code2,
              title: 'async',
              color: 'border-[#9956f6]/30 bg-[#9956f6]/5',
              tc: 'text-[#b585fb]',
              body: 'Toda função marcada com async retorna uma Promise automaticamente, mesmo que não haja await dentro dela.',
            },
            {
              Icon: Zap,
              title: 'await',
              color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
              tc: 'text-[#29e0a9]',
              body: 'Suspende a execução da função async até a Promise resolver, liberando o Event Loop para outras tarefas. Não bloqueia a thread.',
            },
            {
              Icon: RefreshCcw,
              title: 'try/catch',
              color: 'border-amber-500/30 bg-amber-500/5',
              tc: 'text-amber-400',
              body: 'O tratamento de erros de Promises com async/await usa try/catch nativo — muito mais natural do que .catch() encadeado.',
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
