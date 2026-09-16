import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CardPreview from './CardPreview.jsx'

// Isolated component preview — visit /?preview=cards to see the S3 result card
// on its own. Temporary this phase; the normal app renders otherwise.
const Root = window.location.search.includes('preview') ? CardPreview : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
