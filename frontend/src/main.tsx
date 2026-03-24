import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource-variable/geist/index.css"
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
