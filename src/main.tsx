import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { HomePage } from './pages/HomePage'
import { NodeVsBrowserPage } from './pages/NodeVsBrowserPage'
import { NodeSingleVsMultiThreadPage } from './pages/NodeSingleVsMultiThreadPage'
import { NodeArchitecturePage } from './pages/NodeArchitecturePage'
import { PackageManagerPage } from './pages/PackageManagerPage'
import { EventLoopPage } from './pages/EventLoopPage'
import { CallbackHellPage } from './pages/CallbackHellPage'
import { PromisesPage } from './pages/PromisesPage'
import { AsyncAwaitPage } from './pages/AsyncAwaitPage'
import { PromiseApiPage } from './pages/PromiseApiPage'
import { ModuleSystemPage } from './pages/ModuleSystemPage'
import { EventsModulePage } from './pages/EventsModulePage'
import { NativeModulesPage } from './pages/NativeModulesPage'
import { BuffersPage } from './pages/BuffersPage'
import { StreamsPage } from './pages/StreamsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Módulo 1 — Ecossistema */}
        <Route path="/node-vs-browser" element={<NodeVsBrowserPage />} />
        <Route path="/node-single-vs-multi-thread" element={<NodeSingleVsMultiThreadPage />} />
        <Route path="/node-architecture" element={<NodeArchitecturePage />} />
        <Route path="/package-manager" element={<PackageManagerPage />} />
        {/* Módulo 2 — Assincronismo */}
        <Route path="/node-event-loop-call-stack" element={<EventLoopPage />} />
        <Route path="/callback-hell" element={<CallbackHellPage />} />
        <Route path="/promises" element={<PromisesPage />} />
        <Route path="/async-await" element={<AsyncAwaitPage />} />
        <Route path="/promise-api" element={<PromiseApiPage />} />
        {/* Módulo 3 — Módulos Nativos */}
        <Route path="/module-system" element={<ModuleSystemPage />} />
        <Route path="/events-module" element={<EventsModulePage />} />
        <Route path="/native-modules" element={<NativeModulesPage />} />
        <Route path="/buffers" element={<BuffersPage />} />
        <Route path="/streams" element={<StreamsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
