import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { javaApiScenes } from './java-api-models'
import { parseVisualization } from './learning-visualization'

let observed: Record<string, string>
beforeAll(() => {
  const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java'
  const source = fileURLToPath(new URL('../../../docs/content-corrections/issue-278/java-final/JavaFinalExamples.java', import.meta.url))
  const result = spawnSync(java, ['--enable-preview', '--source', '25', source], { encoding: 'utf8', timeout: 30_000 })
  expect(result.error, result.stderr).toBeUndefined()
  expect(result.status, result.stderr).toBe(0)
  observed = Object.fromEntries(result.stdout.trim().split(/\r?\n/).map((line) => {
    const delimiter = line.indexOf('=')
    return [line.slice(0, delimiter), line.slice(delimiter + 1)]
  }))
}, 35_000)

describe('actual Java 25 results against fixed diagram snapshots', () => {
  it('matches reverse close and partial mutation values', () => {
    expect(observed['resource.primary']).toBe('work')
    expect(observed['resource.suppressed']).toBe('second,first')
    const failure = javaApiScenes['failure-atomicity']
    expect(failure[1].graph!.nodes[0].lines[1]).toContain(observed['partial.source'])
    expect(failure[1].graph!.nodes[1].lines[1]).toContain(observed['partial.target'])
    expect(failure[3].graph!.nodes[0].lines[1]).toContain(observed['money.failed'])
    expect(failure[4].graph!.nodes[0].lines[1]).toContain(observed['money.success'])
  })

  it('matches real javac/javap instructions and the return value', () => {
    expect(observed['bytecode.operations']).toBe('iload_1,iload_2,iadd,ireturn')
    expect(observed['bytecode.result']).toBe('7')
    expect(javaApiScenes['bytecode-stack'][3].graph!.nodes[1].lines[1]).toBe(`[${observed['bytecode.result']}]`)
    expect(observed['initialization.literalAndConstant']).toBe('true')
    expect(observed['initialization.parentValue']).toBe('7')
    expect(observed['initialization.events']).toBe('P')
  })

  it('matches dated DST offsets and elapsed time', () => {
    expect(observed['gap.offsets']).toBe('0')
    expect(observed['gap.adjusted']).toBe('2026-03-29T03:30+02:00')
    expect(observed['overlap.offsets']).toBe('2')
    expect(observed['overlap.earlier']).toBe('2026-10-25T00:30:00Z')
    expect(observed['overlap.later']).toBe('2026-10-25T01:30:00Z')
    expect(observed['duration.local']).toBe('2026-03-29T10:00+02:00')
    expect(observed['period.local']).toBe('2026-03-29T09:00+02:00')
    expect(javaApiScenes['duration-period'][0].graph!.nodes[2].lines[2]).toBe(`경과 ${observed['period.elapsedHours']}시간`)
    expect(observed['instant.seoul']).toBe('2026-08-31T14:00+09:00')
    expect(observed['instant.newYork']).toBe('2026-08-31T01:00-04:00')
  })

  it('matches CAS, gates and completion boundaries without scheduler timing assumptions', () => {
    expect(observed['cas.first']).toBe('true')
    expect(observed['cas.stale']).toBe('false')
    expect(observed['cas.retry']).toBe('true')
    expect(javaApiScenes['cas-retry'][2].graph!.nodes[1].lines[1]).toBe(`current = ${observed['cas.current']}`)
    expect(observed['allOf.afterFirstFailure']).toBe('false')
    expect(observed['allOf.afterAllComplete']).toBe('true')
    expect(observed['timedJoin.workerAlive']).toBe('true')
    expect(observed['join.workerAlive']).toBe('false')
    expect(observed['callerRuns.shutdownFutureDone']).toBe('false')
    expect(observed['latch.beforeLast']).toBe('1')
    expect(observed['latch.open']).toBe('0')
    expect(observed['semaphore.full']).toBe('0')
    expect(observed['semaphore.released']).toBe('1')
    expect(observed['queue.offerWhenFull']).toBe('false')
    expect(observed['queue.received']).toBe('A')
    expect(observed['stream.ordered']).toBe('true')
    expect(observed['partition.keys']).toBe('2')
    expect(observed['optional.mapNull']).toBe('true')
    expect(observed['scoped.outer']).toBe('outer')
    expect(observed['scoped.inner']).toBe('inner')
    expect(observed['scoped.restored']).toBe('outer')
    expect(observed['scoped.child']).toBe('outer')
    expect(observed['scoped.boundAfterExit']).toBe('false')
    expect(javaApiScenes['scoped-binding'][2].graph!.nodes[0].lines[1]).toContain(observed['scoped.restored'])
  })

  it('covers every audited Java visualization at its approved interaction tier', () => {
    const audit = JSON.parse(readFileSync(new URL('../../../docs/content-audit/issue-277/java.json', import.meta.url), 'utf8')) as { concepts: { sourcePath: string; targetTier: string; visualizationNeed: string }[] }
    for (const row of audit.concepts.filter((entry) => entry.visualizationNeed !== 'NONE')) {
      const markdown = readFileSync(new URL(`../../../${row.sourcePath}`, import.meta.url), 'utf8')
      const declarations = [...markdown.matchAll(/```csforge-viz\r?\n([\s\S]*?)\r?\n```/g)]
      expect(declarations.length, row.sourcePath).toBeGreaterThan(0)
      for (const declaration of declarations) {
        const specification = parseVisualization(declaration[1])
        expect(specification, row.sourcePath).not.toBeNull()
        if (specification?.type === 'java-api-contract') {
          expect(javaApiScenes[specification.example].length > 1, row.sourcePath).toBe(row.targetTier === 'V2')
        }
      }
    }
  })
})
