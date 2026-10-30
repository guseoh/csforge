import { DiagramArrow, DiagramCanvas, DiagramNode } from './DiagramPrimitives'

export function DefiniteAssignmentDiagram() {
  return <DiagramCanvas label="score 조건의 두 분기에서 result를 대입한 뒤 합류하므로 println에서 읽을 수 있습니다." width={600} height={410}>
    <DiagramNode x={168} y={20} width={264} lines={['int result;', 'score >= 60 ?']} />
    <DiagramArrow x1={216} y1={88} x2={144} y2={174} />
    <DiagramArrow x1={384} y1={88} x2={456} y2={174} />
    <text x={154} y={124}>참</text><text x={428} y={124}>거짓</text>
    <DiagramNode x={34} y={174} width={220} lines={['result = 1;', '대입됨']} />
    <DiagramNode x={346} y={174} width={220} lines={['result = 0;', '대입됨']} />
    <DiagramArrow x1={144} y1={242} x2={244} y2={310} />
    <DiagramArrow x1={456} y1={242} x2={356} y2={310} />
    <DiagramNode x={168} y={310} width={264} height={82} lines={['println(result)', '합류하는 두 경로 모두 대입됨', '컴파일 가능']} />
  </DiagramCanvas>
}
