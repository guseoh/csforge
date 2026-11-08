/** Authored diagrams: content selects a fixed example ID only; never arbitrary SVG/HTML/nodes. */
export type Step = { readonly head: string; readonly detail: string }
export type Side = { readonly heading: string; readonly lines: readonly string[] }
export type Message = { readonly from: 'left'|'right'; readonly text: string; readonly detail: string }
type Base = { readonly title: string; readonly lead: string; readonly note: string }
export type AreaDiagram =
  | (Base & {readonly layout:'stack'; readonly layers:readonly Step[]})
  | (Base & {readonly layout:'path'; readonly steps:readonly Step[]})
  | (Base & {readonly layout:'compare'; readonly left:Side; readonly right:Side})
  | (Base & {readonly layout:'branch'; readonly question:string; readonly arms:readonly Step[]})
  | (Base & {readonly layout:'matrix'; readonly columns:readonly [string,string,string];readonly rows:readonly (readonly [string,string,string])[];readonly focusRow?:number})
  | (Base & {readonly layout:'sequence'; readonly parties:readonly [string,string];readonly messages:readonly Message[]})
