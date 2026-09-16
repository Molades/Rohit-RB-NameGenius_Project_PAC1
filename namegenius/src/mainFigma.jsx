import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CardPreviewFigma from './CardPreviewFigma.jsx'

// Dedicated entry for the Figma-faithful card preview (served at
// /preview-figma.html), kept separate from src/main.jsx so this build and the
// parallel session's build don't collide.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CardPreviewFigma />
  </StrictMode>,
)
