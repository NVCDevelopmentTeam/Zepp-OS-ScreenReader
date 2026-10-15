// @ts-nocheck - messaging library (ZML): its JSDoc is not valid TypeScript. It is still linted and formatted.
import './es6-promise'
ES6Promise.polyfill()

Promise._setScheduler(function (flush) {
  flush && flush()
})
