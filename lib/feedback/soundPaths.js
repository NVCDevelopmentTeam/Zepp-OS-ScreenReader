/**
 * Where bundled feedback sounds live.
 *
 * Sounds are shipped as tiny Opus files in assets/raw/audio (see
 * tools/generate_earcons.py). Zepp OS 3.0 addresses the read-only resource
 * folder with the `assets://` prefix and `raw/` is copied into it at build
 * time; older path styles are tried as fallbacks because firmware differs.
 */

/**
 * @param {string} file e.g. 'click.opus'
 * @param {string | null} [theme] sound theme folder, or null for the default
 * @returns {string[]} candidate paths, most likely first
 */
export function soundCandidates(file, theme = null) {
  const rel = theme ? `raw/audio/${theme}/${file}` : `raw/audio/${file}`
  return [`assets://${rel}`, rel]
}
