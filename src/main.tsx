import { StrictMode, } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import routes from './routes.ts'
import AppProvider from './components/AppProvider/index.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {routes.map((route) => <Route path={route.path} element={<route.element />} />)}
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode >,
)
