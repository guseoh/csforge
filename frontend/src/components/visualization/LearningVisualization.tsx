import { Component, type ReactNode } from 'react'
import { parseVisualization, type Visualization, type VisualizationOf } from '../../lib/learning-visualization'
import { DiagramArrow, DiagramCanvas, DiagramNode } from './DiagramPrimitives'
import { TcpHandshakeDiagram } from './StepDiagram'
import { HeapDiagram } from './InteractiveDiagram'
import { LanguageValueDiagram } from './LanguageValueDiagram'
import { ArrayStoreDiagram } from './ArrayStoreDiagram'
import { DefiniteAssignmentDiagram } from './DefiniteAssignmentDiagram'
import { ObjectModelDiagram } from './ObjectModelDiagram'
import { JavaApiDiagram } from './JavaApiDiagram'
import { JavaHashLookupDiagram, JavaPassByValueEditorial } from './JavaEditorialDiagrams'
import { JavaHappensBeforeEditorial, JavaCasEditorial, JavaGcReachabilityEditorial, JavaSelectorEditorial, JavaVolatileHandoffEditorial } from './JavaSemanticDiagrams'
import { JavaBytecodeStackEditorial, JavaClassInitializationEditorial, JavaProcessMemoryEditorial, JavaVirtualCarrierEditorial } from './JavaRuntimeEditorial'
import { JavaPecsEditorial, JavaListLayoutEditorial, JavaBufferEditorial, JavaStreamLazinessEditorial } from './JavaCollectionEditorial'
import { JavaLostUpdateEditorial, JavaSafePublicationEditorial, JavaReferenceStrengthEditorial, JavaHeapPollutionEditorial } from './JavaStateEditorial'
import { JavaRuntimeAreasEditorial, JavaJitProfileEditorial, JavaLoaderIdentityEditorial, JavaRetainedPathEditorial } from './JavaRuntimeStructureEditorial'
import { JavaInvarianceEditorial } from './JavaGenericsEditorial'
import { JavaHashContractEditorial, JavaComparatorEditorial, JavaDequeEndsEditorial, JavaIteratorRemoveEditorial, JavaLambdaCaptureEditorial, JavaStreamShapesEditorial } from './JavaContractEditorial'
import { JavaParallelCostsEditorial, JavaClassfileBoundaryEditorial, JavaCollectorIntervalsEditorial, JavaInstantZonesEditorial, JavaDurationPeriodEditorial, JavaExceptionCauseEditorial } from './JavaBoundaryEditorial'
import { JavaConditionAwaitEditorial, JavaBoundedQueueEditorial, JavaThreadLifecycleEditorial, JavaSuppressedExceptionsEditorial } from './JavaCoordinationEditorial'
import { JavaExecutorAdmissionEditorial, JavaThreadLocalReuseEditorial, JavaFailureAtomicityEditorial, JavaZoneDstEditorial, JavaScopedBindingEditorial, JavaDynamicProxyEditorial } from './JavaAdvancedReviewEditorial'
import { JavaDecoratorEditorial, JavaProxyBoundaryEditorial, JavaObserverEditorial, JavaStatePatternEditorial } from './JavaPatternEditorial'
import { JavaLatchGateEditorial, JavaSemaphoreEditorial, JavaFutureCompletionEditorial, JavaDeadlockProgressEditorial } from './JavaCoordinationRelationsEditorial'
import { JavaDependencyInjectionEditorial, JavaStrategyPolicyEditorial, JavaAdapterContractEditorial } from './JavaCollaborationBoundaryEditorial'
import { JavaThrowableClassificationEditorial, JavaExceptionBoundaryEditorial, JavaResourceOwnershipEditorial, JavaProcessingReflectionEditorial, JavaModuleBoundaryEditorial, JavaBinaryEvolutionEditorial, JavaSerializationBoundaryEditorial } from './JavaLanguageBoundaryEditorial'
import { JavaViewCopyEditorial, JavaMapViewsEditorial } from './JavaCollectionStructureEditorial'

export function DiagramFallback({ description }: { description?: string }) {
  return <div className="diagram-fallback" role="note"><p>학습 도식을 표시할 수 없습니다. 본문 설명을 계속 읽어주세요.</p>{description && <p>{description}</p>}</div>
}

class DiagramErrorBoundary extends Component<{ children: ReactNode; description: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <DiagramFallback description={this.props.description} /> : this.props.children }
}

export function StaticDiagram({ data }: { data: VisualizationOf<'static-flow'> }) {
  return <DiagramCanvas label={data.description} width={480} height={data.labels.length * 114 + 12}>
    {data.labels.map((label, index) => <g key={index}>
      <DiagramNode x={100} y={index * 114 + 12} width={280} height={86} lines={Array.from(label.matchAll(/.{1,16}/gu), (m) => m[0])} />
      {index > 0 && <DiagramArrow x1={240} y1={index * 114 - 16} x2={240} y2={index * 114 + 12} />}
    </g>)}
  </DiagramCanvas>
}

const renderers = {
  'static-flow': (data: VisualizationOf<'static-flow'>) => <StaticDiagram data={data} />,
  'java-pass-by-value': (data: VisualizationOf<'java-pass-by-value'>) => <JavaPassByValueEditorial data={data} />,
  'min-heap': (data: VisualizationOf<'min-heap'>) => <HeapDiagram data={data} />,
  'tcp-handshake': (data: VisualizationOf<'tcp-handshake'>) => <TcpHandshakeDiagram data={data} />,
  'java-value-reference': (data: VisualizationOf<'java-value-reference'>) => <LanguageValueDiagram data={data} />,
  'java-array-store': () => <ArrayStoreDiagram />,
  'java-definite-assignment': () => <DefiniteAssignmentDiagram />,
  'java-object-model': (data: VisualizationOf<'java-object-model'>) => <ObjectModelDiagram data={data} />,
}

function RegisteredDiagram({ data }: { data: Visualization }) {
  switch (data.type) {
    case 'java-api-contract': {
      switch (data.example) {
        case 'hash-lookup': return <JavaHashLookupDiagram />
        case 'happens-before': return <JavaHappensBeforeEditorial />
        case 'volatile-handoff': return <JavaVolatileHandoffEditorial />
        case 'lost-update': return <JavaLostUpdateEditorial />
        case 'safe-publication': return <JavaSafePublicationEditorial />
        case 'reference-strength': return <JavaReferenceStrengthEditorial />
        case 'heap-pollution': return <JavaHeapPollutionEditorial />
        case 'runtime-areas': return <JavaRuntimeAreasEditorial />
        case 'jit-profile': return <JavaJitProfileEditorial />
        case 'loader-identity': return <JavaLoaderIdentityEditorial />
        case 'view-copy': return <JavaViewCopyEditorial />
        case 'map-views': return <JavaMapViewsEditorial />
        case 'retained-path': return <JavaRetainedPathEditorial />
        case 'invariance': return <JavaInvarianceEditorial />
        case 'hash-contract': return <JavaHashContractEditorial />
        case 'comparator': return <JavaComparatorEditorial />
        case 'deque': return <JavaDequeEndsEditorial />
        case 'iterator': return <JavaIteratorRemoveEditorial />
        case 'lambda-capture': return <JavaLambdaCaptureEditorial />
        case 'stream-shapes': return <JavaStreamShapesEditorial />
        case 'parallel-costs': return <JavaParallelCostsEditorial />
        case 'jdk-classfile': return <JavaClassfileBoundaryEditorial />
        case 'collector-tradeoffs': return <JavaCollectorIntervalsEditorial />
        case 'instant-zones': return <JavaInstantZonesEditorial />
        case 'duration-period': return <JavaDurationPeriodEditorial />
        case 'exception-cause': return <JavaExceptionCauseEditorial />
        case 'condition-await': return <JavaConditionAwaitEditorial />
        case 'bounded-queue': return <JavaBoundedQueueEditorial />
        case 'thread-lifecycle': return <JavaThreadLifecycleEditorial />
        case 'resource-suppressed': return <JavaSuppressedExceptionsEditorial />
        case 'executor-admission': return <JavaExecutorAdmissionEditorial />
        case 'threadlocal-reuse': return <JavaThreadLocalReuseEditorial />
        case 'failure-atomicity': return <JavaFailureAtomicityEditorial />
        case 'zone-dst': return <JavaZoneDstEditorial />
        case 'scoped-binding': return <JavaScopedBindingEditorial />
        case 'dynamic-proxy': return <JavaDynamicProxyEditorial />
        case 'decorator': return <JavaDecoratorEditorial />
        case 'proxy': return <JavaProxyBoundaryEditorial />
        case 'observer': return <JavaObserverEditorial />
        case 'state': return <JavaStatePatternEditorial />
        case 'latch-gate': return <JavaLatchGateEditorial />
        case 'semaphore-permits': return <JavaSemaphoreEditorial />
        case 'future-completion': return <JavaFutureCompletionEditorial />
        case 'deadlock-progress': return <JavaDeadlockProgressEditorial />
        case 'dependency-injection': return <JavaDependencyInjectionEditorial />
        case 'strategy': return <JavaStrategyPolicyEditorial />
        case 'adapter': return <JavaAdapterContractEditorial />
        case 'throwable-tree': return <JavaThrowableClassificationEditorial />
        case 'exception-boundary': return <JavaExceptionBoundaryEditorial />
        case 'resource-ownership': return <JavaResourceOwnershipEditorial />
        case 'processing-reflection': return <JavaProcessingReflectionEditorial />
        case 'module-boundary': return <JavaModuleBoundaryEditorial />
        case 'binary-evolution': return <JavaBinaryEvolutionEditorial />
        case 'serialization-boundary': return <JavaSerializationBoundaryEditorial />
        case 'cas-retry': return <JavaCasEditorial />
        case 'gc-roots': return <JavaGcReachabilityEditorial />
        case 'selector': return <JavaSelectorEditorial />
        case 'bytecode-stack': return <JavaBytecodeStackEditorial />
        case 'class-initialization': return <JavaClassInitializationEditorial />
        case 'process-memory': return <JavaProcessMemoryEditorial />
        case 'virtual-carrier': return <JavaVirtualCarrierEditorial />
        case 'pecs': return <JavaPecsEditorial />
        case 'list-layout': return <JavaListLayoutEditorial />
        case 'buffer': return <JavaBufferEditorial />
        case 'stream-laziness': return <JavaStreamLazinessEditorial />
        default: return <JavaApiDiagram example={data.example} />
      }
    }
    case 'static-flow': return renderers[data.type](data)
    case 'java-pass-by-value': return renderers[data.type](data)
    case 'min-heap': return renderers[data.type](data)
    case 'tcp-handshake': return renderers[data.type](data)
    case 'java-value-reference': return renderers[data.type](data)
    case 'java-array-store': return renderers[data.type]()
    case 'java-definite-assignment': return renderers[data.type]()
    case 'java-object-model': return renderers[data.type](data)
  }
}

export function LearningVisualization({ source }: { source: string }) {
  const data = parseVisualization(source)
  if (!data) return <DiagramFallback />
  return <figure className={`learning-visualization${data.type.startsWith('java-') ? ' java-visualization' : ''}`} data-java-pass={data.type === 'java-pass-by-value' ? 'true' : undefined}>
    <figcaption><strong>{data.title}</strong><p>{data.description}</p></figcaption>
    <DiagramErrorBoundary key={source} description={data.description}><RegisteredDiagram key={source} data={data} /></DiagramErrorBoundary>
  </figure>
}
