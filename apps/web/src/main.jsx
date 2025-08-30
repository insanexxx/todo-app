import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import Login from './pages/Login'
import Tasks from './pages/Tasks'
import './styles/global.scss'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Tasks /> }
  ]},
  { path: '/login', element: <Login /> }
])

const quertclient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={quertclient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
