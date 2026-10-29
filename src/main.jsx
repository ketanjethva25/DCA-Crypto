// Entry point: loads the styles and shows the App inside the #root div of index.html.
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
