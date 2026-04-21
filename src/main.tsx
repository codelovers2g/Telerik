import React from 'react'
import ReactDOM from 'react-dom/client'
import ProductManagement from './features/products/ProductManagement'
import './assets/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductManagement />
  </React.StrictMode>,
)
