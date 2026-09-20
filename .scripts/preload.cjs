/**
 * Preload hook for Zeus CLI and @zeppos toolchain.
 * Resolves upstream toolchain issues:
 * 1. Prevents @zeppos/zpm from scanning the 'site/' directory and attempting to bundle
 *    unrelated SvelteKit / web files during production builds.
 * 2. Prevents zeus dev watcher (chokidar) from watching 'site/', '.site/', and nested node_modules.
 * 3. Prevents concurrent rebuild race conditions in zeus dev by guarding refreshSimulator execution.
 * 4. Prevents zeus dev from overwriting .gitignore due to parse-gitignore v2 object return type.
 */
const Module = require('module')
const origCompile = Module.prototype._compile

Module.prototype._compile = function (content, filename) {
  // 1. Patch @zeppos/zpm to ignore site directory when discovering project source files
  if (filename.includes('zpm') && content.includes('function y(A)')) {
    content = content.replace(
      'ignore:[',
      'ignore:["**/site/**","site/**",".site/**","**/.site/**",'
    )
  }

  // 2. Patch zeppos-app-utils/dist/modules/build.js
  if (
    (filename.includes('zeppos-app-utils') || filename.includes('zeppos_app_utils')) &&
    filename.endsWith('build.js')
  ) {
    // a) Fix .gitignore overwrite bug
    if (content.includes('if (!gitignore.length) {')) {
      content = content.replace(
        'if (!gitignore.length) {',
        'if (Array.isArray(gitignore) && !gitignore.length) {'
      )
    }

    // b) Add site and node_modules patterns to chokidar ignored list
    if (content.includes('ignored = (0, lodash_1.union)([')) {
      content = content.replace(
        'ignored = (0, lodash_1.union)([',
        "ignored = (0, lodash_1.union)(['site/**', 'site', '.site/**', '.site', '**/node_modules/**', '**/.pnpm/**', '.scripts/**', '.vscode/**', '**/*.md', '**/*.log', "
      )
    }

    // c) Guard refreshSimulator against concurrent async execution race conditions
    const targetDebounceStr = 'refreshSimulator = (0, lodash_1.debounce)(function () {'
    const replacementStr = 'var __rawRefresh = (0, lodash_1.debounce)(function () {'
    const endDebounceStr = '}); }, 150, { maxWait: 1000 });\n        refreshSimulator();'
    const replacementEndStr = `}); }, 150, { maxWait: 1000 });
        var __isBuilding = false;
        var __needsRebuild = false;
        refreshSimulator = function () {
            if (__isBuilding) {
                __needsRebuild = true;
                return;
            }
            __isBuilding = true;
            Promise.resolve(__rawRefresh()).finally(function () {
                __isBuilding = false;
                if (__needsRebuild) {
                    __needsRebuild = false;
                    refreshSimulator();
                }
            });
        };
        refreshSimulator();`

    if (content.includes(targetDebounceStr) && content.includes(endDebounceStr)) {
      content = content.replace(targetDebounceStr, replacementStr)
      content = content.replace(endDebounceStr, replacementEndStr)
    }
  }

  return origCompile.call(this, content, filename)
}
