/**
 * TEMPORARY DIAGNOSTIC PAGE - not for production.
 *
 * Uses @zos/utils's `log` (the official Zepp OS logging API) instead of
 * raw console.log, since zeus dev's own build messages ([ROLLUP],
 * [RESIZE], etc.) appear directly in the terminal - `log` is more likely
 * to be piped to that same terminal than an unofficial console.log call
 * would be.
 *
 * How to use:
 * 1. Already wired as the first page for target
 *    "416x416-amazfit-gtr-mini" - no manual edits needed.
 * 2. Run `npm run dev`, pick that target, then copy the ENTIRE terminal
 *    output (same as every bugZSR.txt so far) - look for six lines
 *    starting with "CAPABILITY TEST:".
 * 3. Remove "page/capabilityTest" from app.json's page list and delete
 *    this file afterward.
 */
import { log } from '@zos/utils'
import { writeFileSync } from '@zos/fs'

Page({
  build() {
    const checks = [
      ['WebAssembly', typeof WebAssembly !== 'undefined'],
      ['Worker', typeof Worker !== 'undefined'],
      ['AudioContext', typeof AudioContext !== 'undefined'],
      ['ArrayBuffer', typeof ArrayBuffer !== 'undefined'],
      ['Float32Array', typeof Float32Array !== 'undefined'],
      ['fs.writeFileSync', typeof writeFileSync === 'function']
    ]

    checks.forEach(([name, pass]) => {
      log.info(`CAPABILITY TEST: ${name}: ${pass ? 'PASS' : 'FAIL'}`)
    })
  }
})
