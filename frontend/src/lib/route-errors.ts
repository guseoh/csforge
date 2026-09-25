export function isStaleLazyChunkError(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  return /chunkloaderror|loading chunk .+ failed|failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(message)
}
