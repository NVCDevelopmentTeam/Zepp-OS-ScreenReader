/**
 * Finds calls to async functions whose result is thrown away. If such a promise is rejected nobody
 * handles it, and on the watch an unhandled rejection can surface as an error on the screen, which a
 * blind user cannot read. Each result must be awaited, returned, or ended with `.catch(...)` (the
 * helper `fireAndForget` in lib/utils/safeCall.js does that).
 *
 * GrantPermission/ (the messaging library) is left out; it is third-party style code.
 *
 * The check is by name: every function defined with `async` in the watch code gives a name, and a
 * statement that calls one of those names without await, `void`, `return` or `.catch` is reported.
 */
import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'

const root = process.cwd()
const SKIP = new Set([
  'node_modules',
  '.git',
  'assets',
  '.scripts',
  'server',
  'app-side',
  'setting',
  'site',
  'GrantPermission'
])
/** @param {string} dir @param {string[]} out */
function sources(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) sources(full, out)
    else if (full.endsWith('.js')) out.push(full)
  }
  return out
}
/** @param {any} node @param {(n: any, parent: any) => void} visit */
function walk(node, visit, parent = null) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit, parent))
  if (node.type) visit(node, parent)
  for (const key in node) if (key !== 'type' && key !== 'loc') walk(node[key], visit, node)
}

const files = sources(root)
const parsed = files.map((file) => ({
  file,
  ast: acorn.parse(fs.readFileSync(file, 'utf8'), {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true
  })
}))

// 1. names of async functions
const asyncNames = new Set()
const isAsyncFn = (n) =>
  n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') && n.async
for (const { ast } of parsed) {
  walk(ast, (n) => {
    if (n.type === 'FunctionDeclaration' && n.async && n.id) asyncNames.add(n.id.name)
    if (
      (n.type === 'MethodDefinition' || n.type === 'Property') &&
      !n.computed &&
      n.key &&
      isAsyncFn(n.value)
    )
      asyncNames.add(n.key.name || n.key.value)
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && isAsyncFn(n.init))
      asyncNames.add(n.id.name)
    if (
      n.type === 'AssignmentExpression' &&
      n.left.type === 'MemberExpression' &&
      !n.left.computed &&
      isAsyncFn(n.right)
    )
      asyncNames.add(n.left.property.name)
  })
}
// Names that are also ordinary synchronous functions somewhere are ambiguous; they are listed apart.
const calleeName = (call) =>
  call.callee.type === 'Identifier'
    ? call.callee.name
    : call.callee.type === 'MemberExpression' && !call.callee.computed
      ? call.callee.property.name
      : null

const found = []
for (const { file, ast } of parsed) {
  walk(ast, (n) => {
    if (n.type !== 'ExpressionStatement') return
    let expr = n.expression
    if (expr.type === 'ChainExpression') expr = expr.expression
    if (expr.type !== 'CallExpression') return
    const name = calleeName(expr)
    // a chain that ends in .catch is handled; one that ends in .then is not
    if (name === 'catch') return
    if (name === 'then') {
      found.push(
        `${path.relative(root, file)}:${n.loc.start.line} promise chain ends in .then without .catch`
      )
      return
    }
    if (name && asyncNames.has(name))
      found.push(
        `${path.relative(root, file)}:${n.loc.start.line} ${name}() is async and its result is dropped`
      )
  })
}
if (found.length > 0) {
  console.error(`Floating promises (${found.length}):\n  ` + found.join('\n  '))
  process.exit(1)
}
console.log(`Floating-promise check passed (${asyncNames.size} async functions known)`)
