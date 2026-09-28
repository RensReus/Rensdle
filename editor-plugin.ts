import { readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Dev-server endpoints for the puzzle editor (/editor). Only active in `npm run dev`.
 * GET  /__editor/puzzles -> [{ file, puzzle }] for every readable puzzles/*.json
 * POST /__editor/save    { puzzle, originalFile } -> writes puzzles/<name>.json (renames when the name changed)
 */
const dir = path.resolve('puzzles')
const validName = /^[a-z0-9_-]+$/i
const fileOf = (name: string) => path.join(dir, `${name}.json`)

async function readAll(): Promise<{ file: string; puzzle: { id?: unknown; name?: unknown } }[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  const entries = await Promise.all(
    files.map(async (f) => {
      try {
        return { file: f.slice(0, -'.json'.length), puzzle: JSON.parse(await readFile(path.join(dir, f), 'utf8')) }
      } catch {
        return null
      }
    }),
  )
  return entries.filter((e) => e !== null && typeof e.puzzle === 'object' && !Array.isArray(e.puzzle)) as never
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readBody(req: IncomingMessage): Promise<string> {
  let body = ''
  for await (const chunk of req) body += chunk
  return body
}

async function save(req: IncomingMessage, res: ServerResponse) {
  const { puzzle, originalFile } = JSON.parse(await readBody(req))
  const name: unknown = puzzle?.name
  if (typeof name !== 'string' || !validName.test(name)) return send(res, 400, { error: 'Invalid name' })
  if (originalFile != null && (typeof originalFile !== 'string' || !validName.test(originalFile))) {
    return send(res, 400, { error: 'Invalid original file' })
  }

  const others = (await readAll()).filter((p) => p.file !== originalFile)
  const lower = name.toLowerCase()
  const sameName = others.find((p) => p.file.toLowerCase() === lower || String(p.puzzle.name).toLowerCase() === lower)
  if (sameName) return send(res, 409, { error: `Name "${name}" is already used by puzzles/${sameName.file}.json` })
  const sameId = others.find((p) => p.puzzle.id === puzzle.id)
  if (sameId) return send(res, 409, { error: `Id ${puzzle.id} is already used by puzzles/${sameId.file}.json` })

  const renamed = originalFile != null && originalFile !== name
  // Case-only rename: on a case-insensitive file system both names are the same file.
  const caseOnly = renamed && originalFile.toLowerCase() === lower
  if (caseOnly) await rename(fileOf(originalFile), fileOf(name))
  await writeFile(fileOf(name), JSON.stringify(puzzle, null, 4) + '\n')
  if (renamed && !caseOnly) await unlink(fileOf(originalFile))
  send(res, 200, {})
}

export function puzzleEditor(): Plugin {
  return {
    name: 'rensdle-puzzle-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__editor/puzzles', (req, res) => {
        if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' })
        readAll().then(
          (list) => send(res, 200, list),
          (e) => send(res, 500, { error: String(e) }),
        )
      })
      server.middlewares.use('/__editor/save', (req, res) => {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
        save(req, res).catch((e) => send(res, 500, { error: String(e) }))
      })
    },
  }
}
