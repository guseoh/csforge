let nextRevision = 0
const latestRevisionByKey = new Map<string, number>()
const pendingSaves = new Map<string, Promise<unknown>>()

export function beginNoteSaveRevision(key: string) {
  const revision = ++nextRevision
  latestRevisionByKey.set(key, revision)
  return revision
}

export function isLatestNoteSaveRevision(key: string, revision: number) {
  return latestRevisionByKey.get(key) === revision
}

export function hasPendingNoteSave(key: string) {
  return pendingSaves.has(key)
}

export type NoteSaveResult<T> =
  | { status: 'saved'; value: T }
  | { status: 'superseded' }

export function enqueueLatestNoteSave<T>(
  key: string,
  revision: number,
  save: () => Promise<T>,
): Promise<NoteSaveResult<T>> {
  const run = async (): Promise<NoteSaveResult<T>> => {
    if (!isLatestNoteSaveRevision(key, revision)) return { status: 'superseded' }
    const value = await save()
    if (!isLatestNoteSaveRevision(key, revision)) return { status: 'superseded' }
    return { status: 'saved', value }
  }
  const previous = pendingSaves.get(key)
  const task = previous ? previous.catch(() => {}).then(run) : run()
  pendingSaves.set(key, task)
  const clear = () => {
    if (pendingSaves.get(key) === task) pendingSaves.delete(key)
  }
  void task.then(clear, clear)
  return task
}
