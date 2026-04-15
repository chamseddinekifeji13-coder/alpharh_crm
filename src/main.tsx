import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { seedDatabase } from './utils/mockData'
import { seedCrmDatabase } from './utils/crmMockData'

seedDatabase();
seedCrmDatabase();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
