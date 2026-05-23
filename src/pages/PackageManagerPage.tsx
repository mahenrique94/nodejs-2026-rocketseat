import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Package, Lock, Globe, Shield, HardDrive, Clock,
  CheckCircle2, XCircle, Minus, Code2, Database,
  Download, Zap, Box, GitBranch, RefreshCcw, Info,
} from 'lucide-react'
import { RocketseatIcon } from '../components/RocketseatLogo'

// ─── types ────────────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ className?: string }>
type ToolId = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'deno'
type ConceptId = 'registry' | 'package-json' | 'node-modules' | 'lockfile' | 'semver'

interface PkgField {
  key: string
  value: string
  color: string
  description: string
  detail: string
}

// ─── constants ────────────────────────────────────────────────────────────────

const CONCEPT_TABS: { id: ConceptId; label: string; Icon: LucideIcon }[] = [
  { id: 'registry',     label: 'Registry',      Icon: Globe    },
  { id: 'package-json', label: 'package.json',  Icon: Code2    },
  { id: 'node-modules', label: 'node_modules',  Icon: Box      },
  { id: 'lockfile',     label: 'Lockfile',      Icon: Lock     },
  { id: 'semver',       label: 'Semver',        Icon: GitBranch },
]

const CONCEPT_CONTENT: Record<ConceptId, { title: string; body: string; highlight: string; code?: string }> = {
  registry: {
    title: 'O Registro Central (npmjs.com)',
    body: 'O npm Registry é um banco de dados público com mais de 2,5 milhões de pacotes. Quando você executa npm install lodash, o npm consulta https://registry.npmjs.org/lodash, baixa o tarball e extrai na pasta node_modules. Empresas podem hospedar registros privados (Verdaccio, GitHub Packages, Artifactory) configurados via .npmrc.',
    highlight: 'O maior repositório de software do mundo',
    code: `# Consultar metadados de um pacote
npm view lodash version

# Publicar seu pacote
npm publish

# Registry privado via .npmrc
registry=https://npm.minha-empresa.com`,
  },
  'package-json': {
    title: 'O package.json — Manifesto do Projeto',
    body: 'O package.json é o coração de qualquer projeto Node.js. Ele declara o nome, versão, ponto de entrada, scripts, dependências e metadados. O campo "scripts" permite criar atalhos de comandos (npm run dev, npm run build). O campo "engines" especifica a versão mínima do Node.js requerida.',
    highlight: 'Todo projeto Node.js começa aqui',
    code: `{
  "name": "meu-projeto",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "node --watch src/index.js",
    "build": "tsc"
  },
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "typescript": "~5.0.0" },
  "engines": { "node": ">=20" }
}`,
  },
  'node-modules': {
    title: 'node_modules — Onde os Pacotes Vivem',
    body: 'O npm v3+ usa uma árvore flat (plana): todos os pacotes e suas dependências são instalados diretamente em node_modules/. Isso evita duplicação e reduz profundidade. O problema é "phantom dependencies" — você pode importar um pacote que não declarou em package.json mas que foi instalado como dependência de outra lib.',
    highlight: 'Flat tree desde o npm v3',
    code: `node_modules/
├── express/          ← sua dep
├── accepts/          ← dep do express (hoisted)
├── ms/               ← dep de debug (hoisted)
└── lodash/           ← sua dep

# Antes do npm v3 (nested - legado):
node_modules/
└── express/
    └── node_modules/
        └── accepts/`,
  },
  lockfile: {
    title: 'Lockfile — Instalações Determinísticas',
    body: 'O package-lock.json registra a versão exata de cada pacote instalado, incluindo sub-dependências. Isso garante que qualquer desenvolvedor ou CI que rodar npm ci obtenha exatamente as mesmas versões. O npm ci é mais rápido que npm install pois pula a resolução — instala diretamente do lockfile. Sempre commite o lockfile.',
    highlight: 'Garante reprodutibilidade entre ambientes',
    code: `# npm install → atualiza package-lock.json
# npm ci → instala EXATAMENTE o lockfile (mais rápido, ideal pra CI)

# package-lock.json registra:
{
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/...",
      "integrity": "sha512-..."
    }
  }
}`,
  },
  semver: {
    title: 'Semantic Versioning — Major.Minor.Patch',
    body: 'O npm usa semver para definir faixas de versão aceitáveis. O prefixo ^ (caret) aceita Minor e Patch updates (^1.2.3 → >=1.2.3 <2.0.0). O ~ (tilde) aceita apenas Patch updates (~1.2.3 → >=1.2.3 <1.3.0). Versões sem prefixo são exatas. MAJOR rompe compatibilidade, MINOR adiciona funcionalidades, PATCH corrige bugs.',
    highlight: 'MAJOR.MINOR.PATCH — cada número tem significado',
    code: `"dependencies": {
  "express": "^4.18.0",   // >= 4.18.0 < 5.0.0
  "lodash":  "~4.17.0",   // >= 4.17.0 < 4.18.0
  "uuid":    "9.0.0",     // exatamente 9.0.0
  "chalk":   "*",         // qualquer versão (não use!)
  "react":   ">=18.0.0"   // >= 18.0.0
}

# MAJOR → breaking change (1.x → 2.0)
# MINOR → nova feature, retrocompat (1.2 → 1.3)
# PATCH → bugfix (1.2.3 → 1.2.4)`,
  },
}

const INSTALL_STEPS = [
  {
    icon: Code2,
    color: 'text-[#b585fb]',
    bg: 'bg-[#9956f6]/15',
    border: 'border-[#9956f6]/30',
    title: '1. Lê o package.json',
    desc: 'O npm lê o package.json e coleta as dependências declaradas em dependencies e devDependencies.',
  },
  {
    icon: GitBranch,
    color: 'text-sky-300',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/30',
    title: '2. Resolve a árvore de dependências',
    desc: 'Para cada pacote, o npm consulta o registry e resolve as sub-dependências recursivamente, construindo uma árvore completa.',
  },
  {
    icon: RefreshCcw,
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/15',
    border: 'border-[#29e0a9]/30',
    title: '3. Deduplica (flat tree)',
    desc: 'Pacotes compartilhados são "hoisted" para o nível raiz de node_modules, evitando cópias múltiplas da mesma versão.',
  },
  {
    icon: Lock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    title: '4. Consulta o lockfile',
    desc: 'Se package-lock.json existe, as versões exatas já estão definidas. O npm verifica integridade via hashes SHA-512.',
  },
  {
    icon: Download,
    color: 'text-pink-400',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/30',
    title: '5. Baixa os tarballs do registry',
    desc: 'Os pacotes são baixados como arquivos .tgz do registry (cache local em ~/.npm evita downloads repetidos).',
  },
  {
    icon: Box,
    color: 'text-[#29e0a9]',
    bg: 'bg-[#29e0a9]/10',
    border: 'border-[#29e0a9]/20',
    title: '6. Extrai em node_modules',
    desc: 'Os tarballs são descompactados em node_modules/. Scripts lifecycle (prepare, postinstall) são executados ao final.',
  },
]

const PKG_FIELDS: PkgField[] = [
  { key: '"name"',            value: '"meu-servidor"',          color: 'text-[#b585fb]',  description: 'Nome do pacote',          detail: 'Único no npm Registry. Usado para npm publish e como identificador. Deve ser lowercase, sem espaços.' },
  { key: '"version"',         value: '"1.0.0"',                 color: 'text-[#29e0a9]',  description: 'Versão semântica',        detail: 'Segue semver (MAJOR.MINOR.PATCH). Atualize com npm version patch|minor|major.' },
  { key: '"main"',            value: '"dist/index.js"',         color: 'text-sky-300',    description: 'Entry point (CJS)',       detail: 'Arquivo carregado com require(). Use "exports" para controle mais granular em projetos modernos.' },
  { key: '"type"',            value: '"module"',                color: 'text-sky-300',    description: 'Tipo de módulo',          detail: '"module" → todos .js tratados como ESM. "commonjs" (padrão) → .js como CJS. Use .mjs/.cjs para exceções.' },
  { key: '"scripts"',         value: '{ ... }',                 color: 'text-amber-400',  description: 'Scripts npm run',         detail: 'Atalhos de comandos: npm run dev, npm run build. Scripts pre/post são executados automaticamente (preinstall, postbuild...).' },
  { key: '"dependencies"',    value: '{ "express": "^4.18" }', color: 'text-[#29e0a9]',  description: 'Dependências de runtime', detail: 'Instaladas em produção. Use ^ para Minor/Patch updates automáticos. Sempre especifique versões no lockfile.' },
  { key: '"devDependencies"', value: '{ "typescript": "~5" }', color: 'text-pink-400',   description: 'Somente dev',             detail: 'Não instaladas em npm install --production. Use para ferramentas: TypeScript, ESLint, Vite, Jest...' },
  { key: '"engines"',         value: '{ "node": ">=20" }',     color: 'text-[#a8a8b3]',  description: 'Versão Node requerida',   detail: 'Alerta se a versão do Node não for compatível. Use para garantir APIs mínimas disponíveis no runtime.' },
]

interface Tool {
  id: ToolId
  name: string
  year: number
  author: string
  tagline: string
  color: string
  border: string
  bg: string
  description: string
  philosophy: string
  pros: string[]
  cons: string[]
  lockfile: string
  commands: { label: string; cmd: string }[]
}

const TOOLS: Tool[] = [
  {
    id: 'npm',
    name: 'npm',
    year: 2010,
    author: 'Isaac Z. Schlueter',
    tagline: 'O padrão que veio junto com o Node.js',
    color: 'text-red-400',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    description: 'O npm (Node Package Manager) é o gerenciador de pacotes oficial do Node.js, distribuído junto com o runtime. Com mais de 2,5 milhões de pacotes no registry, é o maior repositório de software do mundo.',
    philosophy: 'Ubiquidade e compatibilidade: qualquer projeto Node.js funciona com npm por padrão, sem configuração extra. A filosofia de "pequenos módulos composíveis" vem de Eric Raymond e a tradição Unix.',
    pros: [
      'Incluído no Node.js — zero configuração',
      'Maior ecossistema de pacotes do mundo',
      'Workspaces nativos desde v7',
      'npm audit para verificar vulnerabilidades',
      'npm publish para publicar pacotes',
    ],
    cons: [
      'Mais lento que alternativas modernas',
      'Maior uso de disco (flat tree com cópias)',
      'Phantom dependencies — pode importar o não declarado',
      'node_modules pode ficar enorme em monorepos',
    ],
    lockfile: 'package-lock.json',
    commands: [
      { label: 'Instalar deps',    cmd: 'npm install' },
      { label: 'Adicionar pacote', cmd: 'npm install express' },
      { label: 'Remover pacote',   cmd: 'npm uninstall express' },
      { label: 'Rodar script',     cmd: 'npm run dev' },
      { label: 'Publicar',         cmd: 'npm publish' },
      { label: 'Auditar',          cmd: 'npm audit' },
      { label: 'Instalar (CI)',    cmd: 'npm ci' },
    ],
  },
  {
    id: 'yarn',
    name: 'Yarn',
    year: 2016,
    author: 'Meta (Facebook)',
    tagline: 'Velocidade e workspaces que educaram o npm',
    color: 'text-sky-300',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    description: 'O Yarn foi criado pelo Facebook em 2016 para resolver problemas de velocidade e consistência do npm v2/v3. Yarn Classic (v1) foi amplamente adotado; Yarn Berry (v2+) introduziu Plug\'n\'Play (PnP), eliminando node_modules por completo.',
    philosophy: 'Yarn Berry aposta em "Zero-Installs": o cache dos pacotes é commitado no repositório. Com PnP, não existe node_modules — pacotes são referenciados diretamente do cache, com resolução em tempo de execução.',
    pros: [
      'Workspaces desde o início (v1)',
      'Yarn Berry: Plug\'n\'Play elimina node_modules',
      'Zero-Installs: sem npm install após git clone',
      'yarn dlx para execução sem instalação (como npx)',
      'Excelente suporte a monorepos',
    ],
    cons: [
      'Yarn Classic (v1) e Berry (v2+) são incompatíveis',
      'PnP requer suporte da toolchain (editors, bundlers)',
      'Curva de aprendizado para Yarn Berry',
      'Menos usado que npm e pnpm em projetos novos',
    ],
    lockfile: 'yarn.lock',
    commands: [
      { label: 'Instalar deps',    cmd: 'yarn install' },
      { label: 'Adicionar pacote', cmd: 'yarn add express' },
      { label: 'Remover pacote',   cmd: 'yarn remove express' },
      { label: 'Rodar script',     cmd: 'yarn dev' },
      { label: 'Publicar',         cmd: 'yarn npm publish' },
      { label: 'Executar (npx)',   cmd: 'yarn dlx create-react-app' },
      { label: 'Workspaces',       cmd: 'yarn workspace api add lodash' },
    ],
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    year: 2016,
    author: 'Zoltan Kochan',
    tagline: 'Rápido, eficiente e sem dependências fantasma',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    description: 'O pnpm (Performant npm) usa um store global de pacotes com links simbólicos (symlinks) para montar node_modules. Cada pacote é armazenado uma única vez no disco, independente de quantos projetos o utilizam.',
    philosophy: 'Content-addressable storage: os arquivos dos pacotes vivem em ~/.pnpm-store/ e são referenciados via hard links. Isso garante que express@4.18.2 ocupe espaço em disco apenas uma vez, mesmo em 100 projetos diferentes.',
    pros: [
      'Menor uso de disco: store compartilhado entre projetos',
      'Instalações mais rápidas (hard links, sem cópia)',
      'Sem phantom dependencies: node_modules é estrito',
      'Workspaces excelentes para monorepos',
      'Compatible com npm e yarn na maioria dos cenários',
    ],
    cons: [
      'Symlinks podem confundir algumas ferramentas antigas',
      'Requer store global (~/.pnpm-store/) no disco',
      'Menos ubíquo que npm em ambientes CI',
    ],
    lockfile: 'pnpm-lock.yaml',
    commands: [
      { label: 'Instalar deps',    cmd: 'pnpm install' },
      { label: 'Adicionar pacote', cmd: 'pnpm add express' },
      { label: 'Remover pacote',   cmd: 'pnpm remove express' },
      { label: 'Rodar script',     cmd: 'pnpm dev' },
      { label: 'Publicar',         cmd: 'pnpm publish' },
      { label: 'Executar (npx)',   cmd: 'pnpm dlx create-react-app' },
      { label: 'Workspace filter', cmd: 'pnpm --filter api add lodash' },
    ],
  },
  {
    id: 'bun',
    name: 'Bun',
    year: 2022,
    author: 'Jarred Sumner / Oven.sh',
    tagline: 'Runtime + bundler + test runner + package manager',
    color: 'text-pink-400',
    border: 'border-pink-500/40',
    bg: 'bg-pink-500/10',
    description: 'O Bun é um runtime JavaScript completo escrito em Zig, usando JavaScriptCore (engine do Safari). Seu package manager é incrivelmente rápido — benchmarks mostram 10-25x mais veloz que npm — pois a resolução e extração são implementadas em nível nativo.',
    philosophy: 'All-in-one: Bun substitui Node.js (runtime), npm/yarn/pnpm (package manager), Webpack/esbuild (bundler) e Jest (test runner). A aposta é reduzir a complexidade do tooling moderno a uma única ferramenta.',
    pros: [
      'O mais rápido package manager em benchmarks',
      'Runtime + bundler + testes em uma ferramenta',
      'TypeScript nativo (sem transpilação separada)',
      'Hot reload nativo (Bun.serve)',
      'Compatibilidade parcial com npm packages',
    ],
    cons: [
      'Ainda não 100% compatível com Node.js',
      'APIs específicas do Bun não portáveis para Node.js',
      'Ecossistema mais jovem (2022)',
      'JavaScriptCore vs V8: diferenças de comportamento',
    ],
    lockfile: 'bun.lock',
    commands: [
      { label: 'Instalar deps',    cmd: 'bun install' },
      { label: 'Adicionar pacote', cmd: 'bun add express' },
      { label: 'Remover pacote',   cmd: 'bun remove express' },
      { label: 'Rodar script',     cmd: 'bun dev' },
      { label: 'Publicar',         cmd: 'bun publish' },
      { label: 'Executar (npx)',   cmd: 'bunx create-react-app' },
      { label: 'Rodar arquivo',    cmd: 'bun run src/index.ts' },
    ],
  },
  {
    id: 'deno',
    name: 'Deno',
    year: 2018,
    author: 'Ryan Dahl (criador do Node.js)',
    tagline: 'Segurança primeiro, sem node_modules, TypeScript nativo',
    color: 'text-[#29e0a9]',
    border: 'border-[#29e0a9]/40',
    bg: 'bg-[#29e0a9]/10',
    description: 'Criado pelo próprio autor do Node.js como um "arrependimento corrigido", o Deno não usa node_modules nem package.json por padrão. Módulos são importados via URL ou pelo novo registry JSR (jsr.io), e o runtime exige permissões explícitas para I/O, rede e ambiente.',
    philosophy: 'Security by default: nada tem permissão sem consentimento explícito (--allow-read, --allow-net...). Web standards first: Deno implementa APIs do browser (fetch, Request, Response, crypto) diretamente no runtime, em vez de versões Node.js-específicas.',
    pros: [
      'Sem node_modules — imports por URL ou JSR',
      'TypeScript e JSX nativos, sem tsconfig',
      'Modelo de segurança: permissões explícitas',
      'Web standards: fetch, WebSockets, Web Crypto nativos',
      'deno compile gera executável único',
    ],
    cons: [
      'Incompatível com parte do ecossistema npm',
      'Curva de aprendizado: modelo de módulos diferente',
      'Menor adoção corporativa que Node.js',
      'Compat layer (deno npm:) adiciona overhead',
    ],
    lockfile: 'deno.lock',
    commands: [
      { label: 'Instalar deps',    cmd: 'deno install' },
      { label: 'Adicionar pacote', cmd: 'deno add npm:express' },
      { label: 'Remover pacote',   cmd: 'deno remove npm:express' },
      { label: 'Rodar script',     cmd: 'deno run --allow-net src/main.ts' },
      { label: 'Publicar (JSR)',   cmd: 'deno publish' },
      { label: 'Compilar exe',     cmd: 'deno compile --allow-net src/main.ts' },
      { label: 'Rodar testes',     cmd: 'deno test' },
    ],
  },
]

type FeatureValue = 'yes' | 'no' | 'partial'

interface FeatureRow {
  label: string
  Icon: LucideIcon
  npm: FeatureValue | string
  yarn: FeatureValue | string
  pnpm: FeatureValue | string
  bun: FeatureValue | string
  deno: FeatureValue | string
}

const FEATURE_MATRIX: FeatureRow[] = [
  { label: 'Velocidade de install', Icon: Zap,          npm: 'partial', yarn: 'partial', pnpm: 'yes',  bun: 'yes',  deno: 'partial' },
  { label: 'Uso de disco',          Icon: HardDrive,    npm: 'partial', yarn: 'partial', pnpm: 'yes',  bun: 'partial', deno: 'yes' },
  { label: 'Workspaces/Monorepo',   Icon: GitBranch,    npm: 'yes',     yarn: 'yes',     pnpm: 'yes',  bun: 'yes',  deno: 'yes' },
  { label: 'Sem phantom deps',      Icon: Shield,       npm: 'no',      yarn: 'partial', pnpm: 'yes',  bun: 'no',   deno: 'yes' },
  { label: 'TypeScript nativo',     Icon: Code2,        npm: 'no',      yarn: 'no',      pnpm: 'no',   bun: 'yes',  deno: 'yes' },
  { label: 'Bundler embutido',      Icon: Package,      npm: 'no',      yarn: 'no',      pnpm: 'no',   bun: 'yes',  deno: 'yes' },
  { label: 'Sem node_modules',      Icon: Box,          npm: 'no',      yarn: 'partial', pnpm: 'no',   bun: 'no',   deno: 'yes' },
  { label: 'Security/Permissions',  Icon: Lock,         npm: 'partial', yarn: 'partial', pnpm: 'partial', bun: 'partial', deno: 'yes' },
  { label: 'Compat. Node.js 100%',  Icon: Database,     npm: 'yes',     yarn: 'yes',     pnpm: 'yes',  bun: 'partial', deno: 'partial' },
  { label: 'Zero-installs',         Icon: Clock,        npm: 'no',      yarn: 'yes',     pnpm: 'no',   bun: 'no',   deno: 'no' },
]

const TOOL_COLS: ToolId[] = ['npm', 'yarn', 'pnpm', 'bun', 'deno']

// ─── sub-components ───────────────────────────────────────────────────────────

function FeatureCell({ value }: { value: FeatureValue | string }) {
  if (value === 'yes')     return <CheckCircle2 className="w-4 h-4 text-[#29e0a9] mx-auto" />
  if (value === 'no')      return <XCircle className="w-4 h-4 text-[#505059] mx-auto" />
  if (value === 'partial') return <Minus className="w-4 h-4 text-amber-400 mx-auto" />
  return <span className="text-[10px] text-[#7c7c8a] text-center block">{value}</span>
}

function PkgJsonExplorer() {
  const [active, setActive] = useState<string | null>(null)
  const field = PKG_FIELDS.find((f) => f.key === active)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-[#0d0d0f] border border-[#29292e] rounded-xl p-5 font-mono text-sm">
        <p className="text-[#505059] text-xs mb-3">package.json — clique em um campo para explorar</p>
        <p className="text-[#505059]">{'{'}</p>
        {PKG_FIELDS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive((prev) => (prev === f.key ? null : f.key))}
            className={`
              w-full text-left px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer group
              ${active === f.key ? 'bg-[#202024]' : 'hover:bg-[#1a1a1e]'}
            `}
          >
            <span className={`${f.color} font-semibold`}>{f.key}</span>
            <span className="text-[#505059]">: </span>
            <span className="text-[#7c7c8a]">{f.value}</span>
            <span className="text-[#323238]">,</span>
            {active === f.key && (
              <span className="ml-3 text-[10px] text-[#505059] font-sans">← {f.description}</span>
            )}
          </button>
        ))}
        <p className="text-[#505059]">{'}'}</p>
      </div>

      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {field ? (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-[#121214] border border-[#29292e] rounded-xl p-5 h-full"
            >
              <p className={`font-mono text-sm font-bold mb-2 ${field.color}`}>{field.key}</p>
              <p className="text-[#505059] text-xs uppercase tracking-widest mb-3">{field.description}</p>
              <p className="text-[#a8a8b3] text-sm leading-relaxed">{field.detail}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#121214] border border-[#29292e] border-dashed rounded-xl p-5 h-full flex items-center justify-center"
            >
              <div className="text-center">
                <Info className="w-6 h-6 text-[#323238] mx-auto mb-2" />
                <p className="text-[#323238] text-xs">Clique em um campo para ver detalhes</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ToolDetail({ tool }: { tool: Tool }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="space-y-5"
      >
        {/* header */}
        <div className={`rounded-xl border p-5 ${tool.bg} ${tool.border}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className={`text-xl font-bold ${tool.color}`}>{tool.name}</h3>
              <p className="text-[#505059] text-xs mt-0.5">{tool.tagline}</p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-xs font-bold ${tool.color}`}>{tool.year}</span>
              <p className="text-[#505059] text-[10px]">{tool.author}</p>
            </div>
          </div>
          <p className="text-[#a8a8b3] text-sm leading-relaxed">{tool.description}</p>
        </div>

        {/* philosophy */}
        <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5">
          <p className="text-[#505059] text-xs uppercase tracking-widest mb-2">Filosofia</p>
          <p className="text-[#a8a8b3] text-sm leading-relaxed">{tool.philosophy}</p>
        </div>

        {/* pros / cons + commands */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#121214] border border-[#29292e] rounded-xl p-5 space-y-3">
            <div>
              <p className="text-[#29e0a9] text-xs font-bold uppercase tracking-widest mb-2">Vantagens</p>
              <ul className="space-y-1.5">
                {tool.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#29e0a9] shrink-0 mt-0.5" />
                    <span className="text-[#7c7c8a] text-xs leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[#29292e] pt-3">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Desvantagens</p>
              <ul className="space-y-1.5">
                {tool.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500/70 shrink-0 mt-0.5" />
                    <span className="text-[#7c7c8a] text-xs leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#0d0d0f] border border-[#29292e] rounded-xl p-5">
            <p className="text-[#505059] text-xs uppercase tracking-widest mb-3">
              Comandos — lockfile: <span className={`font-mono ${tool.color}`}>{tool.lockfile}</span>
            </p>
            <div className="space-y-2">
              {tool.commands.map((cmd) => (
                <div key={cmd.cmd} className="flex items-center gap-2">
                  <span className="text-[#323238] text-[10px] w-24 shrink-0 leading-tight">{cmd.label}</span>
                  <code className={`text-xs font-mono ${tool.color} bg-[#121214] px-2 py-0.5 rounded truncate`}>
                    {cmd.cmd}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function PackageManagerPage() {
  const [activeConcept, setActiveConcept] = useState<ConceptId>('registry')
  const [activeTool, setActiveTool] = useState<ToolId>('npm')
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const concept = CONCEPT_CONTENT[activeConcept]
  const tool = TOOLS.find((t) => t.id === activeTool)!

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
            Package Managers
          </h1>
          <Link to="/" className="text-xs text-[#505059] hover:text-[#a8a8b3] transition hidden sm:block">
            ← Início
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* hero */}
        <motion.div
          className="text-center space-y-3 pb-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 mb-2">
            <Package className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-xs font-semibold">npm · yarn · pnpm · bun · deno</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 via-amber-400 to-[#29e0a9] bg-clip-text text-transparent">
            Como os Package Managers funcionam?
          </h2>
          <p className="text-[#7c7c8a] text-sm max-w-2xl mx-auto leading-relaxed">
            Do registry ao node_modules, entenda como o npm resolve dependências, o que é semver e como os principais gerenciadores de pacotes se comparam.
          </p>
        </motion.div>

        {/* ── SECTION 1: npm fundamentals ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">npm Fundamentos</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          {/* concept tabs */}
          <div className="flex flex-wrap gap-2">
            {CONCEPT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveConcept(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer
                  ${activeConcept === tab.id
                    ? 'bg-red-500/15 border-red-500/40 text-red-300'
                    : 'bg-[#121214] border-[#29292e] text-[#505059] hover:text-[#7c7c8a] hover:border-[#323238]'
                  }
                `}
              >
                <tab.Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* concept content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeConcept}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4"
            >
              <div className="lg:col-span-2 bg-[#121214] border border-[#29292e] rounded-xl p-5 space-y-3">
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
                  <span className="text-red-400 text-xs font-bold">{concept.highlight}</span>
                </div>
                <h3 className="text-white font-bold text-base">{concept.title}</h3>
                <p className="text-[#7c7c8a] text-sm leading-relaxed">{concept.body}</p>
              </div>
              {concept.code && (
                <div className="lg:col-span-3 bg-[#0d0d0f] border border-[#29292e] rounded-xl p-5">
                  <p className="text-[#323238] text-xs font-mono mb-3">exemplo</p>
                  <pre className="text-xs font-mono text-[#7c7c8a] leading-6 overflow-x-auto whitespace-pre-wrap">{concept.code}</pre>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── SECTION 2: package.json anatomy ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b585fb]">Anatomia do package.json</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>
          <PkgJsonExplorer />
        </section>

        {/* ── SECTION 3: how npm install works ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">Como o npm install Funciona</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INSTALL_STEPS.map((step, i) => (
              <motion.button
                key={step.title}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer
                  ${activeStep === i ? `${step.bg} ${step.border}` : 'bg-[#121214] border-[#29292e] hover:border-[#323238]'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${activeStep === i ? step.bg : 'bg-[#202024]'} border ${activeStep === i ? step.border : 'border-[#29292e]'} flex items-center justify-center shrink-0`}>
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${activeStep === i ? step.color : 'text-[#7c7c8a]'}`}>
                    {step.title}
                  </span>
                </div>
                <AnimatePresence>
                  {activeStep === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[#7c7c8a] text-xs leading-relaxed overflow-hidden"
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
                {activeStep !== i && (
                  <p className="text-[#323238] text-xs leading-relaxed line-clamp-2">{step.desc}</p>
                )}
              </motion.button>
            ))}
          </div>

          {/* npm cache note */}
          <div className="flex items-start gap-3 bg-[#121214] border border-[#29292e] rounded-xl p-4">
            <HardDrive className="w-4 h-4 text-[#505059] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#7c7c8a] text-xs leading-relaxed">
                <span className="text-white font-semibold">Cache local:</span> O npm mantém um cache em{' '}
                <code className="text-[#b585fb] font-mono">~/.npm/</code>. Se um pacote já foi baixado, ele é reutilizado sem consultar o registry.
                Use <code className="text-[#b585fb] font-mono">npm cache clean --force</code> para limpar.
                A flag <code className="text-[#b585fb] font-mono">--prefer-offline</code> força o uso do cache.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: tool comparison ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Comparação de Package Managers</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          {/* tool tabs */}
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-bold border transition-all duration-200 cursor-pointer
                  ${activeTool === t.id
                    ? `${t.bg} ${t.border} ${t.color}`
                    : 'bg-[#121214] border-[#29292e] text-[#505059] hover:text-[#7c7c8a] hover:border-[#323238]'
                  }
                `}
              >
                {t.name}
              </button>
            ))}
          </div>

          <ToolDetail tool={tool} />
        </section>

        {/* ── SECTION 5: feature matrix ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Matriz de Funcionalidades</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="bg-[#121214] border border-[#29292e] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#29292e]">
                    <th className="text-left px-5 py-3 text-[#505059] font-semibold uppercase tracking-widest w-48">
                      Recurso
                    </th>
                    {TOOLS.map((t) => (
                      <th key={t.id} className={`px-4 py-3 text-center font-bold ${t.color}`}>
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_MATRIX.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-[#29292e]/60 transition-colors hover:bg-[#1a1a1e] ${i % 2 === 0 ? '' : 'bg-[#0f0f11]'}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <row.Icon className="w-3.5 h-3.5 text-[#505059] shrink-0" />
                          <span className="text-[#7c7c8a] font-medium">{row.label}</span>
                        </div>
                      </td>
                      {TOOL_COLS.map((id) => (
                        <td key={id} className="px-4 py-3 text-center">
                          <FeatureCell value={row[id] as FeatureValue} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* legend */}
            <div className="px-5 py-3 border-t border-[#29292e] flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#29e0a9]" />
                <span className="text-[#505059] text-xs">Suporte completo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[#505059] text-xs">Suporte parcial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-[#505059]" />
                <span className="text-[#505059] text-xs">Não suportado</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: when to use what ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#29e0a9]">Quando usar cada um?</span>
            <div className="flex-1 h-px bg-[#29292e]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {[
              { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5',     title: 'npm', when: 'Projetos simples, aprendizado, quando não há preferência no time. É o padrão: qualquer desenvolvedor Node.js já sabe usar.' },
              { color: 'text-sky-300', border: 'border-sky-500/20', bg: 'bg-sky-500/5',      title: 'Yarn', when: 'Times que já usam Yarn v1 em projetos legados. Para novos projetos, prefira Yarn Berry apenas se quiser Zero-Installs e PnP.' },
              { color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', title: 'pnpm', when: 'Monorepos, CI com cache compartilhado, equipes que querem menor uso de disco e instalações estritamente corretas (sem phantom deps).' },
              { color: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/5',   title: 'Bun', when: 'Projetos novos que precisam de velocidade máxima, TypeScript nativo e runtime tudo-em-um. Atenção à compatibilidade com Node.js.' },
              { color: 'text-[#29e0a9]', border: 'border-[#29e0a9]/20', bg: 'bg-[#29e0a9]/5', title: 'Deno', when: 'Projetos que valorizam segurança por padrão, TypeScript sem config e APIs web-standard. Ideal para CLIs, servidores e scripts seguros.' },
              { color: 'text-[#7c7c8a]', border: 'border-[#29292e]', bg: 'bg-[#121214]',    title: 'Resumo prático', when: 'Em 2026, pnpm é o favorito para monorepos. Bun ganha em velocidade. Deno para projetos novos com segurança first. npm para máxima compatibilidade.' },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border ${item.border} ${item.bg} p-5`}>
                <h4 className={`font-bold text-sm mb-2 ${item.color}`}>{item.title}</h4>
                <p className="text-[#7c7c8a] text-xs leading-5">{item.when}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
