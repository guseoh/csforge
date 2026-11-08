import type { AreaDiagram } from './network-area-types'
import { linkRouteDiagrams } from './network-area-link-routing'
import { protocolDiagrams } from './network-area-protocol'
import { httpSemanticsDiagrams } from './network-area-http-semantics'
import { httpTransportCacheDiagrams } from './network-area-http-transport'

/** Forty-nine curated diagrams; no HTML/SVG/graph nodes are accepted from Markdown. */
export const networkAreaSpecs = {
  ...linkRouteDiagrams,
  ...protocolDiagrams,
  ...httpSemanticsDiagrams,
  ...httpTransportCacheDiagrams,
} satisfies Record<string, AreaDiagram>

export type NetworkAreaExample = keyof typeof networkAreaSpecs
export const networkAreaExamples = Object.keys(networkAreaSpecs) as [NetworkAreaExample, ...NetworkAreaExample[]]
