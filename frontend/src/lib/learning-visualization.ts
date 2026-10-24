import { z } from 'zod'

export const MAX_VISUALIZATION_LENGTH = 12_000
export const MAX_HEAP_SIZE = 15
const plainText = (max: number) => z.string().min(1).max(max)
  .refine((value) => value.trim().length > 0 && !/[<>\u0000-\u001f]|javascript:|data:/i.test(value), '일반 텍스트만 사용할 수 있습니다.')
const common = { version: z.literal(1), title: plainText(100), description: plainText(600) }
const integer = z.number().int().min(-99).max(99)
const sequenceNumber = z.number().int().min(0).max(4_294_967_295)
const memberName = z.string().regex(/^[가-힣A-Za-z0-9 _.-]{1,12}$/).refine((value) => value.trim().length > 0)

export const visualizationSchema = z.discriminatedUnion('type', [
  z.object({ ...common, type: z.literal('static-flow'), labels: z.array(plainText(40)).min(2).max(6) }).strict(),
  z.object({ ...common, type: z.literal('java-pass-by-value'), initialName: memberName, replacementName: memberName }).strict(),
  z.object({ ...common, type: z.literal('min-heap'), initialValues: z.array(integer).max(MAX_HEAP_SIZE) }).strict(),
  z.object({ ...common, type: z.literal('tcp-handshake'), clientIsn: sequenceNumber, serverIsn: sequenceNumber }).strict(),
  z.object({ ...common, type: z.literal('java-value-reference'), example: z.enum(['assignment-copy', 'final-list', 'string-intern']) }).strict(),
  z.object({ ...common, type: z.literal('java-array-store') }).strict(),
  z.object({ ...common, type: z.literal('java-definite-assignment') }).strict(),
  z.object({ ...common, type: z.literal('java-object-model'), example: z.enum(['static-members', 'initialization', 'inheritance', 'composition', 'dispatch', 'casting', 'defensive-copy']) }).strict(),
])

export type Visualization = z.infer<typeof visualizationSchema>
export type VisualizationOf<T extends Visualization['type']> = Extract<Visualization, { type: T }>

export function parseVisualization(source: string): Visualization | null {
  if (source.length > MAX_VISUALIZATION_LENGTH) return null
  try {
    const result = visualizationSchema.safeParse(JSON.parse(source))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
