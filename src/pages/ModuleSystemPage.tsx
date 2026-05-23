import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Package, ArrowRight, CheckCircle2, Lightbulb, FileCode2 } from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type Tab = 'cjs' | 'esm' | 'interop'

// ─── data ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; year: string }[] = [
  { id: 'cjs', label: 'CommonJS', year: 'Node.js < 12' },
  { id: 'esm', label: 'ES Modules', year: 'Node.js 12+ / ES2015' },
  { id: 'interop', label: 'Interoperabilidade', year: 'Convivência' },
]

const TAB_CONTENT: Record<Tab, { desc: string; exportCode: string; importCode: string; notes: string[] }> = {
  cjs: {
    desc: 'CommonJS foi o sistema de módulos original do Node.js. Usa require() para importar e module.exports para exportar. Síncrono e amplamente suportado.',
    exportCode: `// math.js — exportando com CommonJS
function soma(a, b) {
  return a + b
}

function subtracao(a, b) {
  return a - b
}

// Exportar objeto com múltiplas funções
module.exports = { soma, subtracao }

// Ou exportar uma única coisa
module.exports = function soma(a, b) {
  return a + b
}`,
    importCode: `// app.js — importando com CommonJS
const { soma, subtracao } = require('./math')

// Importar módulo nativo do Node
const path = require('node:path')
const fs   = require('node:fs')

// Importar pacote npm
const express = require('express')

console.log(soma(1, 2))       // 3
console.log(path.join('a', 'b')) // 'a/b'`,
    notes: [
      'require() é síncrono — carrega e executa o módulo imediatamente',
      'module.exports pode ser qualquer valor: objeto, função, classe, string...',
      'Arquivos .js em projetos sem "type":"module" no package.json são CommonJS por padrão',
    ],
  },
  esm: {
    desc: 'ES Modules é o padrão oficial da linguagem JavaScript (ES2015). Usa import/export estático, suportado nativamente no browser e no Node.js desde v12.',
    exportCode: `// math.mjs — exportando com ES Modules
// Named exports (exportações nomeadas)
export function soma(a, b) {
  return a + b
}

export function subtracao(a, b) {
  return a - b
}

// Default export (exportação padrão)
export default class Calculadora {
  soma(a, b) { return a + b }
}

// Exportar variável
export const PI = 3.14159`,
    importCode: `// app.mjs — importando com ES Modules
import { soma, subtracao } from './math.mjs'
import Calculadora from './math.mjs'

// Importar módulo nativo (sempre com node: prefix)
import path from 'node:path'
import { readFile } from 'node:fs/promises'

// Importar tudo com alias
import * as math from './math.mjs'

// Importar JSON (Node 22+)
import config from './config.json' with { type: 'json' }

console.log(soma(1, 2))      // 3
console.log(math.PI)         // 3.14159`,
    notes: [
      'import/export são analisados estaticamente — o bundler pode fazer tree-shaking',
      'Use "type": "module" no package.json para tratar todos os .js como ESM',
      'Use o prefixo node: ao importar módulos nativos (import from \'node:fs\')',
    ],
  },
  interop: {
    desc: 'Node.js suporta ambos os sistemas, mas eles têm regras de convivência. CJS pode importar ESM de forma assíncrona; ESM pode importar CJS com algumas restrições.',
    exportCode: `// package.json — configurando o tipo de módulo
{
  "name": "meu-projeto",
  "type": "module",    // todos .js são ESM

  // Ou exportar formatos diferentes para cada contexto:
  "exports": {
    ".": {
      "import": "./dist/index.mjs",  // para ESM
      "require": "./dist/index.cjs"  // para CJS
    }
  }
}

// Extensões explícitas:
// .mjs → sempre ES Module
// .cjs → sempre CommonJS
// .js  → depende do "type" no package.json`,
    importCode: `// ✅ ESM pode importar CJS
import pkg from './legado.cjs'
const { soma } = pkg

// ❌ CJS NÃO pode usar require() em ESM puro
// const esm = require('./moderno.mjs') // Erro!

// ✅ CJS pode importar ESM dinamicamente
async function carregar() {
  const { soma } = await import('./moderno.mjs')
  return soma(1, 2)
}

// Verificar o tipo do módulo em runtime
console.log(typeof require)    // 'function' em CJS
console.log(typeof import.meta) // objeto em ESM`,
    notes: [
      'Em projetos novos: use ESM ("type":"module" + import/export)',
      'Em projetos legados: mantenha CJS para evitar migrações desnecessárias',
      'Pacotes devem exportar ambos os formatos via campo "exports" no package.json',
    ],
  },
}

const DIFFERENCES = [
  {
    aspect: 'Sintaxe de importação',
    cjs: 'require("modulo")',
    esm: 'import x from "modulo"',
  },
  {
    aspect: 'Sintaxe de exportação',
    cjs: 'module.exports = valor',
    esm: 'export default / export {}',
  },
  {
    aspect: 'Execução',
    cjs: 'Síncrona',
    esm: 'Assíncrona (top-level await)',
  },
  {
    aspect: 'Análise',
    cjs: 'Runtime (dinâmica)',
    esm: 'Estática (build time)',
  },
  {
    aspect: 'Tree-shaking',
    cjs: 'Difícil / impossível',
    esm: 'Suporte completo',
  },
  {
    aspect: 'Browser',
    cjs: 'Não (requer bundler)',
    esm: 'Nativo (<script type="module">)',
  },
  {
    aspect: 'Extensão padrão',
    cjs: '.js (sem "type":"module")',
    esm: '.mjs ou "type":"module"',
  },
  {
    aspect: '__dirname / __filename',
    cjs: 'Disponível nativamente',
    esm: 'Usar import.meta.url',
  },
]

// ─── page ─────────────────────────────────────────────────────────────────────

export function ModuleSystemPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cjs')

  const content = TAB_CONTENT[activeTab]

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
            CommonJS vs ES Modules
          </h1>
          <Link to="/events-module" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            Events →
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
            className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1"
          >
            <span className="text-xs font-semibold text-sky-300">Módulo 3 · Módulos Nativos</span>
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-2xl sm:text-3xl font-bold"
          >
            <span className="bg-gradient-to-r from-sky-300 via-[#5f75f2] to-[#9956f6] bg-clip-text text-transparent">
              CommonJS vs ES Modules
            </span>
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Node.js suporta dois sistemas de módulos:{' '}
            <code className="text-amber-400 bg-amber-500/10 px-1.5 rounded">require()</code> do CommonJS legado e{' '}
            <code className="text-sky-300 bg-sky-500/10 px-1.5 rounded">import/export</code> do padrão moderno.
            Entenda as diferenças e quando usar cada um.
          </motion.p>
        </motion.div>

        {/* tab switcher */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-300">Explorando os Sistemas</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="flex border-b border-[#29292e]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer
                    ${activeTab === tab.id
                      ? 'text-white border-[#5f75f2]'
                      : 'text-[#505059] border-transparent hover:text-[#a8a8b3]'
                    }`}
                >
                  <span className="block font-bold">{tab.label}</span>
                  <span className="text-[10px] font-normal text-[#505059]">{tab.year}</span>
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
                className="p-5 space-y-5"
              >
                <p className="text-[#a8a8b3] text-sm leading-relaxed">{content.desc}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-[#505059]" />
                      <span className="text-[#505059] text-xs font-mono">exportação</span>
                    </div>
                    <pre className="bg-[#09090a] border border-[#29292e] rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {content.exportCode}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-[#505059]" />
                      <span className="text-[#505059] text-xs font-mono">importação</span>
                    </div>
                    <pre className="bg-[#09090a] border border-[#29292e] rounded-xl p-4 text-xs font-mono text-[#a8a8b3] leading-[1.75] overflow-auto">
                      {content.importCode}
                    </pre>
                  </div>
                </div>

                <div className="bg-[#202024] rounded-xl p-4 space-y-2">
                  {content.notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#505059] text-xs shrink-0 mt-0.5">→</span>
                      <p className="text-[#7c7c8a] text-xs leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* comparison table */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9956f6]">Comparação Direta</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#29292e]">
                    <th className="text-left px-5 py-3 text-[#505059] font-semibold uppercase tracking-widest w-44">Aspecto</th>
                    <th className="px-4 py-3 text-center font-bold text-amber-400">CommonJS</th>
                    <th className="px-4 py-3 text-center font-bold text-sky-300">ES Modules</th>
                  </tr>
                </thead>
                <tbody>
                  {DIFFERENCES.map((row, i) => (
                    <tr key={row.aspect} className={`border-b border-[#29292e]/60 ${i % 2 === 0 ? '' : 'bg-[#0f0f11]'}`}>
                      <td className="px-5 py-3 text-[#7c7c8a] font-medium">{row.aspect}</td>
                      <td className="px-4 py-3 text-center">
                        <code className="text-amber-400 font-mono text-[10px] bg-amber-500/5 px-1.5 py-0.5 rounded">{row.cjs}</code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <code className="text-sky-300 font-mono text-[10px] bg-sky-500/5 px-1.5 py-0.5 rounded">{row.esm}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* recommendation */}
        <section>
          <div className="flex items-start gap-3 bg-[#29e0a9]/5 border border-[#29e0a9]/20 rounded-xl px-5 py-4">
            <Lightbulb className="w-4 h-4 text-[#29e0a9] shrink-0 mt-0.5" />
            <p className="text-[#a8a8b3] text-sm leading-relaxed">
              <strong className="text-white">Recomendação para projetos novos:</strong>{' '}
              Use ES Modules — adicione <code className="text-[#29e0a9] font-mono bg-[#29e0a9]/10 px-1">"type": "module"</code> no{' '}
              <code className="text-[#29e0a9] font-mono bg-[#29e0a9]/10 px-1">package.json</code> e use{' '}
              <code className="text-[#29e0a9] font-mono bg-[#29e0a9]/10 px-1">import/export</code> em todo o código.
              Para projetos legados, mantenha CommonJS até ter necessidade real de migrar.
            </p>
          </div>
        </section>

        {/* concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10">
          {[
            {
              Icon: Package,
              title: 'CommonJS',
              color: 'border-amber-500/30 bg-amber-500/5',
              tc: 'text-amber-400',
              body: 'O padrão histórico do Node.js. require() é síncrono e dinâmico. Ainda domina o ecossistema legado e a maioria dos pacotes no npm.',
            },
            {
              Icon: ArrowRight,
              title: 'ES Modules',
              color: 'border-sky-500/30 bg-sky-500/5',
              tc: 'text-sky-300',
              body: 'O padrão oficial da linguagem. import/export são estáticos, permitindo tree-shaking e carregamento assíncrono. Funciona no browser e no Node.js.',
            },
            {
              Icon: CheckCircle2,
              title: 'Recomendação',
              color: 'border-[#29e0a9]/30 bg-[#29e0a9]/5',
              tc: 'text-[#29e0a9]',
              body: 'Projetos novos: ESM com "type":"module". Projetos existentes: mantenha CJS. Pacotes: exporte os dois formatos via campo "exports".',
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
