import { StrictMode, } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import routes from './routes.tsx'
import AppProvider from './components/AppProvider/index.tsx'
import ProtectedRoute from './components/protectedRoute/index.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {routes.map((route) => <Route path={route.path} element={<ProtectedRoute permission={route.permission}>{route.element}</ProtectedRoute>} />)}
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode >
)
