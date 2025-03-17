import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";

const Home = React.lazy(() => import('./pages/home'));

const Banker = React.lazy(() => import('./pages/banker'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/banker" element={<Banker />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
