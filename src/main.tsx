import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Al estar ambos en src, se usa './'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)