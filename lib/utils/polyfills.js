/**
 * Standard-library features newer than ES6, added only where the watch's engine lacks them.
 *
 * The build tool lowers SYNTAX to ES2015 (async/await, `?.`, `??`, spread), but it does not
 * add library functions. Zepp OS documents device apps as ES6, so the few later functions the
 * code uses are provided here: `globalThis` (ES2020), `Array.prototype.includes` (ES2016),
 * `Object.entries` / `Object.values` (ES2017) and `Promise.prototype.finally` (ES2018),
 * `Object.fromEntries` (ES2019). Each is defined only when missing.
 *
 * This file is written in ES6 and is the FIRST import of every entry point (app, pages,
 * widgets), so it runs before any module that reads `globalThis` while loading.
 */

/** @returns {any} the global object, whatever the engine calls it */
export function findGlobalObject() {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  try {
    return new Function('return this')()
  } catch (_e) {
    return {}
  }
}

/**
 * @param {any} target
 * @param {string} name
 * @param {any} value
 */
function define(target, name, value) {
  Object.defineProperty(target, name, { value, writable: true, configurable: true })
}

/** Install whatever is missing. Safe to call more than once. */
export function installPolyfills() {
  const root = findGlobalObject()
  if (typeof globalThis === 'undefined') define(root, 'globalThis', root)

  if (!Array.prototype.includes) {
    define(Array.prototype, 'includes', function (search, fromIndex) {
      const list = Object(this)
      const length = list.length >>> 0
      let index = Number(fromIndex) || 0
      if (index < 0) index = Math.max(length + index, 0)
      for (; index < length; index++) {
        const item = list[index]
        // SameValueZero: NaN equals NaN
        if (item === search || (item !== item && search !== search)) return true
      }
      return false
    })
  }

  if (!Object.entries) {
    define(Object, 'entries', function (object) {
      return Object.keys(Object(object)).map(function (key) {
        return [key, object[key]]
      })
    })
  }

  if (!Object.values) {
    define(Object, 'values', function (object) {
      return Object.keys(Object(object)).map(function (key) {
        return object[key]
      })
    })
  }

  if (!Object.fromEntries) {
    define(Object, 'fromEntries', function (entries) {
      const result = {}
      for (const pair of entries) result[pair[0]] = pair[1]
      return result
    })
  }

  if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
    define(Promise.prototype, 'finally', function (onFinally) {
      if (typeof onFinally !== 'function') return this.then(onFinally, onFinally)
      const P = this.constructor || Promise
      return this.then(
        function (value) {
          return P.resolve(onFinally()).then(function () {
            return value
          })
        },
        function (reason) {
          return P.resolve(onFinally()).then(function () {
            throw reason
          })
        }
      )
    })
  }
}

installPolyfills()
