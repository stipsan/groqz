import { execSync } from 'child_process'
import * as fs from 'fs'
import * as minimatch from 'minimatch'
import * as path from 'path'
import { describe, it } from 'vitest'

describe('typegen', () => {
  const examplesPath = path.resolve(__dirname, '__examples__')
  const examplesFiles = fs.readdirSync(examplesPath)

  minimatch
    .match(examplesFiles, '*.typegen.ts')
    .map((file) => fs.unlinkSync(path.join(examplesPath, file)))

  execSync('pnpm build', {
    cwd: __dirname,
    stdio: 'ignore',
  })
  execSync('node ../../bin/groqz.cjs typegen "./__examples__/*.ts"', {
    cwd: __dirname,
  })
  it('Should pass tsc', async () => {
    try {
      execSync(`tsc`, {
        cwd: examplesPath,
      })
    } catch (e: any) {
      throw new Error(e.stdout.toString())
    }
  })
})
