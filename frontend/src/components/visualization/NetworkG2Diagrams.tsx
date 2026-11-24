import type { AreaDiagram } from '../../lib/network-area-types'

/** Network G2: fixed protocol examples with spatial structure instead of generic flow boxes. */
const Text = ({x,y,children,muted=false,anchor='middle'}:{
  x:number;y:number;children:string;muted?:boolean;anchor?:'start'|'middle'
}) => <text x={x} y={y} textAnchor={anchor} className={muted?'network-area__muted network-area__small':'network-area__text network-area__body'}>{children}</text>

function Block({x,y,w,h=42,label,kind='normal'}:{
  x:number;y:number;w:number;h?:number;label:string;kind?:'normal'|'selected'|'missing'
}) {
  return <g><rect x={x} y={y} width={w} height={h}
    className={kind==='selected'?'network-area__cell network-area__cell--selected':'network-area__rect'}
    strokeDasharray={kind==='missing'?'5 4':undefined}/>
    <Text x={x+w/2} y={y+h/2+5} muted={kind==='missing'}>{label}</Text></g>
}

type G2Spec=Extract<AreaDiagram,{layout:'packet-envelope'|'ipv4-prefix'|'frame-interleave'|'byte-gap'|'cookie-conditions'}>

export function drawNetworkG2(spec:G2Spec,marker:string) {
  const arrow=(x1:number,y1:number,x2:number,y2:number)=><line x1={x1} y1={y1} x2={x2} y2={y2}
    className="network-area__arrow" markerEnd={'url(#'+marker+')'}/>
  switch(spec.layout) {
    case 'packet-envelope': {
      const send=spec.direction==='send'
      const stages=send?[0,1,2,3]:[3,2,1,0]
      const labels=['응용 데이터 일부','TCP 세그먼트','IPv4 패킷','이더넷 프레임']
      const actions=send?['TCP 헤더 추가','IP 헤더 추가','링크 헤더·FCS 추가']:
        ['링크 검증 후 IP 추출','목적지·IP 헤더 확인','TCP 순서 복원 후 전달']
      return {height:350,content:<g data-g2-layout="packet-envelope">
        <Text x={450} y={24} muted>{send?'송신: 헤더를 추가하는 방향 ↓':'수신: 검증을 통과한 데이터가 올라가는 방향 ↓'}</Text>
        {stages.map((stage,i)=>{
          const y=42+i*78
          return <g key={stage}>
            <Text x={12} y={y+26} anchor="start">{labels[stage]}</Text>
            {stage===3&&<Block x={210} y={y} w={105} label="링크 헤더"/>}
            {stage>=2&&<Block x={315} y={y} w={85} label="IP 헤더"/>}
            {stage>=1&&<Block x={400} y={y} w={100} label="TCP 헤더"/>}
            <Block x={500} y={y} w={280} label="응용 데이터 바이트" kind="selected"/>
            {stage===3&&<Block x={780} y={y} w={80} label="FCS"/>}
            {i<3&&<g>{arrow(640,y+43,640,y+75)}
              <Text x={490} y={y+63} muted>{actions[i]}</Text></g>}
          </g>
        })}
      </g>}
    }
    case 'ipv4-prefix': {
      const addresses=[[192,0,2,10],[192,0,2,30],[192,0,3,30]]
      const mask=[255,255,255,0]
      const bits=(n:number)=>n.toString(2).padStart(8,'0')
      return {height:366,content:<g data-g2-layout="ipv4-prefix">
        <Text x={445} y={26}>192.0.2.0/24</Text>
        <Text x={405} y={54} muted>앞 24비트 · prefix</Text>
        <Text x={735} y={54} muted>나머지 8비트</Text>
        {[mask,...addresses].map((octets,row)=>{
          const y=75+row*58
          return <g key={row}><Text x={12} y={y+26} anchor="start">{row===0?'서브넷 마스크':octets.join('.')}</Text>
            {octets.map((n,i)=><Block key={i} x={180+i*172} y={y} w={172}
              label={bits(n)} kind={row===0&&i<3?'selected':row===3&&i===2?'missing':'normal'}/>)}
          </g>
        })}
        <line x1={696} y1={62} x2={696} y2={294} className="network-area__separator"/>
        <Text x={450} y={326}>192.0.2.10 / 192.0.2.30: 일치 · 192.0.3.30: 불일치</Text>
        <Text x={450} y={351} muted>포함 범위 192.0.2.0 ~ 192.0.2.255</Text>
      </g>}
    }
    case 'frame-interleave': {
      const frames=[{id:1,kind:'HEADERS'},{id:3,kind:'HEADERS'},{id:1,kind:'DATA'},{id:3,kind:'DATA'},{id:1,kind:'DATA'},{id:3,kind:'DATA'}]
      return {height:346,content:<g data-g2-layout="frame-interleave">
        <Text x={450} y={24}>서버 → 클라이언트 · 한 HTTP/2 연결</Text>
        {arrow(25,51,870,51)}
        <Text x={450} y={43} muted>같은 방향의 전송 순서</Text>
        {frames.map((f,i)=>{
          const x=24+i*142,cy=f.id===1?194:266
          return <g key={i}><Block x={x} y={70} w={138} label={f.kind+' · '+f.id} kind={f.id===1?'selected':'normal'}/>
            <path d={'M'+(x+69)+' 113 V'+(cy-8)} className="network-area__separator"/>
            <Block x={x} y={cy} w={138} label={f.kind} kind={f.id===1?'selected':'normal'}/>
          </g>
        })}
        <Text x={80} y={165} anchor="start">Stream 1</Text>
        <Text x={80} y={254} anchor="start">Stream 3</Text>
        <Text x={450} y={334} muted>각 스트림 내부 프레임 순서는 유지 · 서로 다른 스트림 사이에는 고정 순서 없음</Text>
      </g>}
    }
    case 'byte-gap': {
      const ranges=['1000–1499','1500–1999','2000–2499']
      const ack=spec.focus==='ack'
      return {height:334,content:<g data-g2-layout="byte-gap">
        <Text x={450} y={27}>수신 측의 바이트 범위 (각 500B)</Text>
        {ranges.map((range,i)=><Text key={range} x={365+i*197} y={62} muted>{range}</Text>)}
        <Text x={12} y={112} anchor="start">누락 발생</Text>
        {['연속 수신','누락','선도착'].map((label,i)=><Block key={i} x={267+i*197} y={85} w={197} label={label}
          kind={i===1?'missing':i===0?'selected':'normal'}/>)}
        <line x1={464} y1={78} x2={464} y2={139} className="network-area__separator"/>
        <Text x={450} y={162}>{ack?'누적 ACK = 1500 (다음 기대 바이트)':'1000–1499까지 전달 가능 · 이후 바이트 대기'}</Text>
        {arrow(450,177,450,206)}
        <Text x={12} y={240} anchor="start">공백 복구</Text>
        {['수신 완료','재전송 수신','수신 완료'].map((label,i)=><Block key={i} x={267+i*197} y={213} w={197} label={label} kind="selected"/>)}
        <Text x={450} y={288}>{ack?'누적 ACK = 2500':'2500 이전까지 순서대로 전달 가능'}</Text>
        <Text x={450} y={316} muted>{ack?'ACK는 뒤쪽 수신량의 합이 아니라 연속 수신 경계를 나타냅니다.':'선도착 바이트가 버퍼에 남아 있다는 가정입니다.'}</Text>
      </g>}
    }
    case 'cookie-conditions': {
      const rows=[['Domain / host','api.example.com이 호스트 범위에 해당'],['Path','/api/orders가 Path=/api에 해당'],['Secure','HTTPS 연결에서 전송'],['SameSite','동일 사이트 요청이라는 가정'],['만료·추가 정책','아직 유효하며 브라우저가 허용']]
      return {height:402,content:<g data-g2-layout="cookie-conditions">
        <Text x={450} y={24}>저장된 Secure 쿠키 → HTTPS api.example.com/api/orders</Text>
        {rows.map(([label,detail],i)=><g key={label}>
          <Block x={25} y={49+i*54} w={190} label={label}/>
          <Block x={215} y={49+i*54} w={425} label={detail}/>
          <Block x={640} y={49+i*54} w={110} label="충족" kind="selected"/>
          {arrow(750,70+i*54,780,70+i*54)}
        </g>)}
        <line x1={780} y1={70} x2={780} y2={317} className="network-area__arrow"/>
        {arrow(780,317,450,317)}
        {arrow(450,317,450,339)}
        <Block x={230} y={342} w={440} label="모든 적용 조건 충족 → Cookie 전송" kind="selected"/>
        <Text x={450} y={399} muted>조건 하나라도 충족하지 못하면 해당 쿠키를 전송하지 않음</Text>
      </g>}
    }
  }
}
