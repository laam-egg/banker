import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";

const Home = React.lazy(() => import('./pages/home'));
const Banker = React.lazy(() => import('./pages/banker'));
const PageReplacement = React.lazy(() => import('./pages/page_replacement'));
const HDDScheduling = React.lazy(() => import('./pages/hdd_scheduling'));
const VirtualMemory = React.lazy(() => import('./pages/virtual_memory'));
const UFS = React.lazy(() => import('./pages/ufs'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/banker" element={<Banker />} />
        <Route path="/page_replacement" element={<PageReplacement />} />
        <Route path="/hdd_scheduling" element={<HDDScheduling />} />
        <Route path="/virtual_memory_mapping" element={<VirtualMemory />} />
        <Route path="/ufs" element={<UFS />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
