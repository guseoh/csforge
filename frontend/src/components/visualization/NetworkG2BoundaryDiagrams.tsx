import type { ReactNode } from 'react'
import type { AreaDiagram } from '../../lib/network-area-types'

type Spec = Extract<AreaDiagram, {layout:'boundary'}>
const Label=({x,y,children,muted=false,anchor='middle'}:{x:number;y:number;children:string;muted?:boolean;anchor?:'middle'|'start'})=>
  <text x={x} y={y} textAnchor={anchor} className={muted?'network-area__muted network-area__small':'network-area__text network-area__body'}>{children}</text>

function Cell({x,y,w,label,active=false,missing=false}:{x:number;y:number;w:number;label:string;active?:boolean;missing?:boolean}) {
  return <g><rect x={x} y={y} width={w} height={44}
    className={active?'network-area__cell network-area__cell--selected':'network-area__rect'}
    strokeDasharray={missing?'5 4':undefined}/>
    <Label x={x+w/2} y={y+27} muted={missing}>{label}</Label></g>
}

/** Fixed examples; no arbitrary nodes or user-provided geometry. */
export function drawNetworkG2Boundary(spec:Spec,marker:string) {
  const arrow=(x1:number,y1:number,x2:number,y2:number,dashed=false)=><line x1={x1} y1={y1} x2={x2} y2={y2}
    className="network-area__arrow" strokeDasharray={dashed?'5 4':undefined} markerEnd={'url(#'+marker+')'}/>
  const heading=(text:string,y=24)=><Label x={450} y={y}>{text}</Label>
  const hint=(text:string,y:number)=><Label x={450} y={y} muted>{text}</Label>
  const wrap=(height:number,content:ReactNode)=>({height,content:<g data-g2-layout="boundary" data-g2-example={spec.example}>{content}</g>})
  switch(spec.example) {
    case 'switch':return wrap(344,<>
      {heading('같은 VLAN · 입력 프레임 A → B')}
      <Cell x={20} y={60} w={160} label="호스트 A"/>
      <Cell x={20} y={137} w={160} label="호스트 B"/>
      <Cell x={20} y={214} w={160} label="호스트 C"/>
      <rect x={290} y={36} width={200} height={242} className="network-area__rect"/>
      <Label x={390} y={27}>스위치</Label>
      {[82,159,236].map((y,i)=><g key={i}><Cell x={305} y={y-22} w={170} label={'포트 '+(i+1)} active={i<2}/></g>)}
      {arrow(180,82,302,82)}{arrow(302,159,180,159)}
      <line x1={180} y1={236} x2={305} y2={236} className="network-area__separator"/>
      <Label x={240} y={72} muted>입력</Label><Label x={240} y={149} muted>출력</Label>
      <Label x={695} y={48}>FDB (MAC 테이블)</Label>
      <Cell x={535} y={60} w={180} label="MAC"/><Cell x={715} y={60} w={160} label="포트"/>
      <Cell x={535} y={104} w={180} label="A · 학습" active/><Cell x={715} y={104} w={160} label="1" active/>
      <Cell x={535} y={148} w={180} label="B · 조회" active/><Cell x={715} y={148} w={160} label="2" active/>
      <Label x={705} y={223} muted>① A의 입력 포트 갱신</Label><Label x={705} y={252} muted>② B의 출력 포트 선택</Label>
      {hint('B 미등록: 수신 포트 외 같은 VLAN의 전달 가능 포트로 flood',310)}
    </>)
    case 'arp':return wrap(334,<>
      {heading('ARP 캐시 미스 · 192.0.2.10의 MAC 조회')}
      {['송신 호스트','대상 192.0.2.10','다른 호스트'].map((name,i)=><g key={name}><Cell x={30+i*300} y={50} w={240} label={name} active={i===1}/>
        <line x1={150+i*300} x2={150+i*300} y1={94} y2={260} className="network-area__lifeline"/></g>)}
      {hint('ARP Request · Who has 192.0.2.10?',122)}
      {arrow(150,135,450,135)}{arrow(150,160,750,160,true)}
      <Label x={750} y={190} muted>대상 아님</Label>
      {arrow(450,220,150,220)}<Label x={300} y={210} muted>ARP Reply · aa:bb:cc:dd:ee:ff</Label>
      <Cell x={100} y={265} w={700} label="이웃 캐시: 192.0.2.10 → aa:bb:cc:dd:ee:ff" active/>
      {hint('요청은 링크 브로드캐스트 · 정상 응답은 요청자에게 전달',328)}
    </>)
    case 'router':return wrap(330,<>
      {heading('IPv4 패킷의 한 홉 전달 (NAT 없음)')}
      <Label x={20} y={64} anchor="start">입력 프레임</Label>
      <Cell x={180} y={40} w={250} label="MAC A → R1"/>
      <Cell x={430} y={40} w={440} label="IP A → B · TTL 64" active/>
      {arrow(650,86,650,111)}
      <Cell x={180} y={117} w={690} label="라우팅 조회 → 출력 인터페이스 / 다음 홉 결정"/>
      <Label x={525} y={190} muted>TTL 64 → 63 · IPv4 헤더 체크섬 갱신</Label>
      {arrow(650,201,650,226)}
      <Label x={20} y={253} anchor="start">출력 프레임</Label>
      <Cell x={180} y={230} w={250} label="MAC R2 → N"/>
      <Cell x={430} y={230} w={440} label="IP A → B · TTL 63" active/>
      {hint('R1/R2: 라우터의 입력/출력 인터페이스 · N: 다음 홉',310)}
    </>)
    case 'nat':return wrap(354,<>
      {heading('TCP 출발지 NAPT · 내부와 외부 패킷 비교')}
      <Label x={235} y={54}>내부 인터페이스</Label><Label x={665} y={54}>외부 인터페이스</Label>
      <line x1={450} x2={450} y1={65} y2={306} className="network-area__separator"/>
      <Cell x={30} y={77} w={400} label="Src 10.0.0.5:40000" active/>
      <Cell x={470} y={77} w={400} label="Src 203.0.113.9:62000" active/>
      <Cell x={30} y={121} w={400} label="Dst 198.51.100.20:443"/>
      <Cell x={470} y={121} w={400} label="Dst 198.51.100.20:443"/>
      {arrow(340,186,560,186)}{hint('나가는 요청 · 출발지 변환',177)}
      <Cell x={30} y={216} w={400} label="Src 198.51.100.20:443"/>
      <Cell x={470} y={216} w={400} label="Src 198.51.100.20:443"/>
      <Cell x={30} y={260} w={400} label="Dst 10.0.0.5:40000" active/>
      <Cell x={470} y={260} w={400} label="Dst 203.0.113.9:62000" active/>
      {arrow(560,331,340,331)}{hint('돌아오는 응답 · 목적지 역변환',322)}
    </>)
    case 'mapping':return wrap(340,<>
      {heading('NAPT 매핑 수명 (TCP 예시)')}
      {arrow(30,55,870,55)}{hint('시간 →',46)}
      {['생성','응답 조회','만료 이후'].map((name,i)=><g key={name}>
        <Label x={155+i*295} y={86}>{name}</Label>
        <Cell x={20+i*295} y={103} w={270} label={i===2?'매핑 없음':'10.0.0.5:40000'} missing={i===2}/>
        {i<2&&arrow(155+i*295,150,155+i*295,174)}
        <Cell x={20+i*295} y={178} w={270} label={i===2?'이전 외부 포트': '203.0.113.9:62000'} active={i<2} missing={i===2}/>
        <Label x={155+i*295} y={255} muted>{['매핑 등록','내부 목적지 복원','이전 흐름 확인 불가'][i]}</Label>
      </g>)}
      {hint('만료 이후 동일 포트를 재사용해도 이전 앱 세션의 연속성을 보장하지 않음',310)}
    </>)
    case 'pki':return wrap(342,<>
      {heading('접속 대상: api.example.com')}
      <Label x={220} y={62}>발급 경로 (로컬 기준점 포함)</Label><Label x={670} y={62}>클라이언트의 로컬 검증</Label>
      <Cell x={35} y={82} w={370} label="Leaf · SAN api.example.com" active/>
      <Cell x={35} y={164} w={370} label="Intermediate CA"/>
      <Cell x={35} y={246} w={370} label="로컬 trust anchor"/>
      {arrow(220,127,220,161)}{arrow(220,209,220,243)}
      <Label x={330} y={150} muted>발급자 관계</Label><Label x={330} y={232} muted>신뢰 기준점까지</Label>
      <Cell x={495} y={100} w={370} label="경로 검증 · 서명·기간·제약"/>
      <Cell x={495} y={174} w={370} label="이름 검증 · SAN 일치"/>
      {arrow(680,221,680,255)}
      <Cell x={495} y={260} w={370} label="두 검증 모두 성공 필요" active/>
      {hint('경로가 유효해도 other.example.net이면 이름 검증 실패',330)}
    </>)
    case 'hol':return wrap(368,<>
      {heading('앞 구간 손실 이후 도착한 데이터 비교')}
      <Label x={20} y={70} anchor="start">HTTP/2 · TCP 공통 바이트 순서</Label>
      <Cell x={240} y={81} w={200} label="A · 수신" active/><Cell x={440} y={81} w={200} label="A · 누락" missing/><Cell x={640} y={81} w={230} label="B · 선도착"/>
      <Label x={555} y={151} muted>공통 바이트 공백 → B도 전달 대기</Label>
      <line x1={20} x2={880} y1={176} y2={176} className="network-area__separator"/>
      <Label x={20} y={211} anchor="start">HTTP/3 · QUIC</Label>
      <Label x={20} y={255} anchor="start">Stream A</Label>
      <Cell x={240} y={228} w={200} label="offset 0~99" active/><Cell x={440} y={228} w={200} label="100~199 누락" missing/><Cell x={640} y={228} w={230} label="A 전달 대기"/>
      <Label x={20} y={311} anchor="start">Stream B</Label>
      <Cell x={240} y={284} w={200} label="offset 0~99" active/><Cell x={440} y={284} w={200} label="100~199 수신" active/><Cell x={640} y={284} w={230} label="B 전달 가능" active/>
      {hint('각 스트림의 offset은 독립 · 연결 수준 혼잡 제어는 공유',352)}
    </>)
    case 'proxy':return wrap(304,<>
      {heading('신뢰 경계에서 외부 주장과 관찰값 분리')}
      <Cell x={20} y={52} w={250} label="외부 클라이언트"/>
      <Cell x={325} y={52} w={250} label="신뢰 Edge 프록시" active/>
      <Cell x={630} y={52} w={250} label="백엔드"/>
      {arrow(270,74,325,74)}{arrow(575,74,630,74)}
      <line x1={295} x2={295} y1={35} y2={249} className="network-area__separator"/>
      <Label x={145} y={137} muted>외부 입력 XFF</Label><Cell x={20} y={153} w={250} label="198.51.100.77 (주장)"/>
      <Label x={450} y={137} muted>연결 상대 관찰</Label><Cell x={325} y={153} w={250} label="192.0.2.10 (관찰)" active/>
      <Label x={755} y={137} muted>허용 프록시인지 검사</Label><Cell x={630} y={153} w={250} label="192.0.2.10 (재작성)" active/>
      {arrow(575,175,630,175)}
      <Label x={450} y={227}>외부 XFF 제거 후 관찰값으로 재작성</Label>
      {hint('프록시를 우회한 직접 연결에서는 전달 헤더를 신뢰하지 않음',277)}
    </>)
  }
}
