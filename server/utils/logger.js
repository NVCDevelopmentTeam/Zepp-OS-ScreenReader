/**
 * Logger for the standalone server/ Express backend.
 *
 * IMPORTANT: server/ runs as a plain Node.js process, completely separate
 * from the Zepp OS device app/app-side/setting bundles - it must never
 * import anything from lib/, setting/, or GrantPermission/ that pulls in
 * a `@zos/*` module, since those don't exist outside the Zepp OS
 * runtime and would crash this server immediately on import.
 * (lib/utils/logger.js imports `log` from `@zos/utils` - do not reuse it
 * here, even though the name is similar.)
 */
export const logger = {
  error: (message, error) => {
    console.error(`[Error] ${message}`, error?.message || error || '')
  },
  warn: (message) => {
    console.warn(`[Warn] ${message}`)
  },
  info: (message) => {
    console.log(`[Info] ${message}`)
  }
}
