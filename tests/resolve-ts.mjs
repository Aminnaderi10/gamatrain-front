// Lets node:test load the app's TypeScript utils, which import each other without
// a file extension (the way Vite resolves them). Node strips the types itself.
// Run: node --import ./tests/resolve-ts.mjs --test tests/subject-directory.test.mjs
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    }
    catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !/^\.{1,2}\//.test(specifier)) throw error
      return nextResolve(`${specifier}.ts`, context)
    }
  },
})
