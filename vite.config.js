// Vite setup: React plugin for JSX, Tailwind plugin for styling.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local development helper.
// On Vercel, files in the /api folder run as serverless functions.
// Vite does not do this by itself, so this small plugin runs them
// during "npm run dev". It is used only on your computer, not after deploy.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      for (const name of ['history', 'coins']) {
        server.middlewares.use('/api/' + name, async (req, res) => {
          // Load the function file (for example /api/price.js)
          const { default: handler } = await server.ssrLoadModule('/api/' + name + '.js')

          // Make req and res look like Vercel's versions
          req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
          res.status = code => { res.statusCode = code; return res }
          res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }

          await handler(req, res)
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // Read the .env file so the local API function can use COINGECKO_API_KEY
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [react(), tailwindcss(), localApi()] }
})
