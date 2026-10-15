/**
 * Checks lib/utils/polyfills.js: removes the standard functions it provides, loads it, and
 * compares every replacement with the native behaviour that was removed.
 */
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const native = {
  includes: Array.prototype.includes,
  entries: Object.entries,
  values: Object.values,
  fromEntries: Object.fromEntries,
  finally: Promise.prototype.finally
}
delete Array.prototype.includes
delete Object.entries
delete Object.values
delete Object.fromEntries
delete Promise.prototype.finally

await import(pathToFileURL(path.join(process.cwd(), 'lib/utils/polyfills.js')).href)

const sample = [1, 2, NaN, 'a']
for (const [search, from] of [[2], [NaN], ['b'], [1, 1], [1, -4], ['a', -1]]) {
  assert.equal(
    sample.includes(search, from),
    native.includes.call(sample, search, from),
    `includes ${String(search)}`
  )
}
const object = { a: 1, b: 2 }
assert.deepEqual(Object.entries(object), native.entries(object))
assert.deepEqual(Object.values(object), native.values(object))
assert.deepEqual(Object.fromEntries([['x', 1]]), native.fromEntries([['x', 1]]))

const order = []
await Promise.resolve(1).finally(() => order.push('ok'))
await Promise.reject(new Error('boom'))
  .finally(() => order.push('fail'))
  .catch((e) => order.push(e.message))
assert.deepEqual(order, ['ok', 'fail', 'boom'])
assert.equal(await Promise.resolve(7).finally(() => 99), 7)

console.log('polyfills ok')
