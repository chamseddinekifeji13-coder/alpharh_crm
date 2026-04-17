import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Seeding is no longer necessary as we are using Supabase Cloud Persistence
// seedDatabase();
// seedCrmDatabase();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
