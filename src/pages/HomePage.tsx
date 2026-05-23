import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Globe, Cpu, Layers, RotateCcw, ArrowRight, Package,
  AlertTriangle, CheckCircle2, Zap, List,
  GitBranch, Radio, Box, HardDrive, Waves,
} from 'lucide-react'
import { RocketseatWordmark } from '../components/RocketseatLogo'

type LucideIcon = (props: { className?: string }) => JSX.Element | null

const MODULES = [
  {
    number: 1,
    title: 'Ecossistema Node.js',
    numberColor: 'text-[#29e0a9]',
    lessons: [
      {
        path: '/node-vs-browser',
        title: 'Node.js vs Browser',
        description: 'window vs global, sistema de arquivos, módulos, variáveis de ambiente e tudo que muda entre os dois ambientes.',
        Icon: Globe as LucideIcon,
        iconColor: 'text-[#a0b0ff]',
        accent: 'from-[#5f75f2]/5 to-[#29e0a9]/5',
        border: 'border-[#29292e] hover:border-[#5f75f2]/40',
        tag: 'Ambiente',
        tagColor: 'bg-[#5f75f2]/10 text-[#a0b0ff]',
      },
      {
        path: '/node-single-vs-multi-thread',
        title: 'Single Thread vs Multi Thread',
        description: 'Por que Node.js é single-threaded, quando isso é um problema e como usar Worker Threads e Cluster para resolver.',
        Icon: Cpu as LucideIcon,
        iconColor: 'text-[#b585fb]',
        accent: 'from-[#9956f6]/5 to-[#e254ff]/5',
        border: 'border-[#29292e] hover:border-[#9956f6]/40',
        tag: 'Threads',
        tagColor: 'bg-[#9956f6]/10 text-[#b585fb]',
      },
      {
        path: '/node-architecture',
        title: 'Arquitetura do Node.js',
        description: 'V8, libuv, I/O não-bloqueante, Thread Pool e como as camadas do Node.js se comunicam internamente.',
        Icon: Layers as LucideIcon,
        iconColor: 'text-[#29e0a9]',
        accent: 'from-[#29e0a9]/5 to-[#9956f6]/5',
        border: 'border-[#29292e] hover:border-[#29e0a9]/40',
        tag: 'Arquitetura',
        tagColor: 'bg-[#29e0a9]/10 text-[#29e0a9]',
      },
      {
        path: '/package-manager',
        title: 'Package Managers — npm, yarn, pnpm, bun e deno',
        description: 'Como o npm funciona internamente, semver, package.json, lockfiles e uma comparação entre os gerenciadores modernos.',
        Icon: Package as LucideIcon,
        iconColor: 'text-red-400',
        accent: 'from-red-500/5 to-amber-500/5',
        border: 'border-[#29292e] hover:border-red-500/40',
        tag: 'Package Manager',
        tagColor: 'bg-red-500/10 text-red-400',
      },
    ],
  },
  {
    number: 2,
    title: 'Assincronismo',
    numberColor: 'text-amber-400',
    lessons: [
      {
        path: '/node-event-loop-call-stack',
        title: 'Event Loop, Call Stack e Filas de Tarefas',
        description: 'Como o Node.js é single-threaded mas não-bloqueante através de uma animação passo a passo.',
        Icon: RotateCcw as LucideIcon,
        iconColor: 'text-[#b585fb]',
        accent: 'from-[#9956f6]/5 to-[#e254ff]/5',
        border: 'border-[#29292e] hover:border-[#9956f6]/40',
        tag: 'Event Loop',
        tagColor: 'bg-[#9956f6]/10 text-[#b585fb]',
      },
      {
        path: '/callback-hell',
        title: 'Callback Hell',
        description: 'O problema da pirâmide da desgraça, inversão de controle e por que precisamos de uma evolução no modelo assíncrono.',
        Icon: AlertTriangle as LucideIcon,
        iconColor: 'text-amber-400',
        accent: 'from-amber-500/5 to-red-500/5',
        border: 'border-[#29292e] hover:border-amber-500/40',
        tag: 'Callbacks',
        tagColor: 'bg-amber-500/10 text-amber-400',
      },
      {
        path: '/promises',
        title: 'Promises',
        description: 'Estados pending/fulfilled/rejected, .then/.catch/.finally, encadeamento e como criar suas próprias Promises.',
        Icon: CheckCircle2 as LucideIcon,
        iconColor: 'text-[#29e0a9]',
        accent: 'from-[#29e0a9]/5 to-[#9956f6]/5',
        border: 'border-[#29292e] hover:border-[#29e0a9]/40',
        tag: 'Promises',
        tagColor: 'bg-[#29e0a9]/10 text-[#29e0a9]',
      },
      {
        path: '/async-await',
        title: 'Async/Await',
        description: 'Sintaxe que transforma Promises em código sequencial, tratamento de erros com try/catch e padrões de uso avançados.',
        Icon: Zap as LucideIcon,
        iconColor: 'text-[#b585fb]',
        accent: 'from-[#9956f6]/5 to-[#e254ff]/5',
        border: 'border-[#29292e] hover:border-[#9956f6]/40',
        tag: 'Async/Await',
        tagColor: 'bg-[#9956f6]/10 text-[#b585fb]',
      },
      {
        path: '/promise-api',
        title: 'Promise API — all, race, allSettled, any',
        description: 'Métodos estáticos para compor múltiplas Promises em paralelo, com a matriz de decisão para escolher o método certo.',
        Icon: List as LucideIcon,
        iconColor: 'text-pink-400',
        accent: 'from-pink-500/5 to-[#9956f6]/5',
        border: 'border-[#29292e] hover:border-pink-500/40',
        tag: 'Promise API',
        tagColor: 'bg-pink-500/10 text-pink-400',
      },
    ],
  },
  {
    number: 3,
    title: 'Módulos Nativos',
    numberColor: 'text-sky-400',
    lessons: [
      {
        path: '/module-system',
        title: 'Sistema de Módulos — CommonJS vs ES Modules',
        description: 'Diferenças entre require() e import/export, tree-shaking, interoperabilidade e quando usar cada sistema.',
        Icon: GitBranch as LucideIcon,
        iconColor: 'text-sky-400',
        accent: 'from-sky-500/5 to-[#9956f6]/5',
        border: 'border-[#29292e] hover:border-sky-500/40',
        tag: 'Módulos',
        tagColor: 'bg-sky-500/10 text-sky-400',
      },
      {
        path: '/events-module',
        title: 'Módulo Events — EventEmitter',
        description: 'Padrão Observer, .on/.once/.off/.emit, herança de EventEmitter e como evitar memory leaks com listeners.',
        Icon: Radio as LucideIcon,
        iconColor: 'text-sky-300',
        accent: 'from-sky-400/5 to-[#29e0a9]/5',
        border: 'border-[#29292e] hover:border-sky-400/40',
        tag: 'Events',
        tagColor: 'bg-sky-400/10 text-sky-300',
      },
      {
        path: '/native-modules',
        title: 'Módulos Nativos — fs, path, http, os, SQLite',
        description: "A biblioteca padrão do Node.js — sem npm install. Explore os módulos mais usados com exemplos práticos e o prefixo node:.",
        Icon: Box as LucideIcon,
        iconColor: 'text-emerald-400',
        accent: 'from-emerald-500/5 to-sky-500/5',
        border: 'border-[#29292e] hover:border-emerald-500/40',
        tag: 'Built-in',
        tagColor: 'bg-emerald-500/10 text-emerald-400',
      },
      {
        path: '/buffers',
        title: 'Buffers — Dados Binários',
        description: 'Como o Node.js lida com bytes brutos. Buffer.from, Buffer.alloc, encodings (utf-8, base64, hex) e operações de manipulação.',
        Icon: HardDrive as LucideIcon,
        iconColor: 'text-orange-400',
        accent: 'from-orange-500/5 to-amber-500/5',
        border: 'border-[#29292e] hover:border-orange-500/40',
        tag: 'Binário',
        tagColor: 'bg-orange-500/10 text-orange-400',
      },
      {
        path: '/streams',
        title: 'Streams — Processamento Incremental',
        description: 'Readable, Writable e Transform streams. Como processar arquivos de gigabytes com memória constante usando pipeline().',
        Icon: Waves as LucideIcon,
        iconColor: 'text-sky-400',
        accent: 'from-sky-500/5 to-[#9956f6]/5',
        border: 'border-[#29292e] hover:border-sky-500/40',
        tag: 'Streams',
        tagColor: 'bg-sky-500/10 text-sky-400',
      },
    ],
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090a] text-white font-sans">
      {/* header */}
      <div className="border-b border-[#29292e] bg-[#09090a]/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <RocketseatWordmark className="h-[18px] w-auto text-[#F7F7FA]" />
          <span className="text-[#323238] text-sm select-none">·</span>
          <span className="text-[#505059] text-sm">Node.js 2026</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-14">

        {/* hero */}
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="inline-flex items-center gap-2 bg-[#29e0a9]/10 border border-[#29e0a9]/20 rounded-full px-3 py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#29e0a9] animate-pulse" />
            <span className="text-[#29e0a9] text-xs font-semibold">Curso em andamento</span>
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="text-4xl sm:text-5xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-r from-[#29e0a9] to-[#9956f6] bg-clip-text text-transparent">Node.js</span>
            <span className="text-white/80"> do zero</span>
            <br />
            <span className="text-[#7c7c8a] text-3xl sm:text-4xl font-medium">ao avançado</span>
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="text-[#7c7c8a] text-base max-w-xl leading-relaxed"
          >
            Aprenda Node.js com animações interativas que explicam os conceitos fundamentais de forma visual e intuitiva.
          </motion.p>
        </motion.div>

        {/* modules */}
        <div className="space-y-10">
          {MODULES.map((mod) => (
            <div key={mod.number}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest ${mod.numberColor}`}>
                  Módulo {mod.number}
                </span>
                <div className="flex-1 h-px bg-[#29292e]" />
                <span className="text-[#505059] text-xs">{mod.lessons.length} aula{mod.lessons.length !== 1 ? 's' : ''}</span>
              </div>
              <h2 className="text-lg font-bold text-[#a8a8b3] mb-5">{mod.title}</h2>

              <div className="space-y-3">
                {mod.lessons.map((lesson) => (
                  <motion.div
                    key={lesson.path}
                    whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <Link
                      to={lesson.path}
                      className={`
                        group flex items-start gap-5 rounded-xl border p-5
                        bg-gradient-to-r ${lesson.accent}
                        ${lesson.border}
                        transition-colors duration-300 block
                      `}
                    >
                      <motion.div
                        whileHover={{ scale: 1.12, rotate: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="shrink-0 w-12 h-12 rounded-xl bg-[#202024] border border-[#29292e] flex items-center justify-center"
                      >
                        <lesson.Icon className={`w-6 h-6 ${lesson.iconColor}`} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white text-base">{lesson.title}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lesson.tagColor}`}>
                            {lesson.tag}
                          </span>
                        </div>
                        <p className="text-[#7c7c8a] text-sm leading-relaxed">{lesson.description}</p>
                      </div>
                      <motion.div
                        className="shrink-0 self-center text-[#505059]"
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="border-t border-[#29292e] pt-8 flex flex-col items-center gap-2">
          <RocketseatWordmark className="h-4 w-auto text-[#323238]" />
          <p className="text-[#323238] text-xs">Node.js 2026</p>
        </div>
      </div>
    </div>
  )
}
