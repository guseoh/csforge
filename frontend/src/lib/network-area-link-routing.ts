import type { AreaDiagram } from './network-area-types'
/** Network links, routing and address transformation: local, deterministic examples. */
export const linkRouteDiagrams = {
'link-network-transport-application': {
 layout:'stack',title:'계층별 책임과 관찰 정보',lead:'계층별 전달 성공의 의미는 서로 다릅니다.',
 layers:[{head:'애플리케이션',detail:'HTTP 메서드·헤더·상태 의미'},{head:'전송',detail:'TCP 바이트 순서 / UDP 데이터그램 / 포트'},{head:'네트워크',detail:'IP 목적지 주소와 다음 홉 경로'},{head:'링크',detail:'MAC 주소와 현재 링크의 프레임'}],
 note:'TCP 연결이 성공해도 HTTP 처리나 업무 트랜잭션 성공을 뜻하지 않습니다.'
},
encapsulation: {
 layout:'stack',title:'송신 측 캡슐화',lead:'각 하위 계층이 상위 데이터를 페이로드로 감싸 전달 정보를 추가합니다.',
 layers:[{head:'HTTP 메시지',detail:'애플리케이션 데이터'},{head:'TCP 세그먼트',detail:'TCP 헤더 + 응용 데이터 바이트'},{head:'IP 패킷',detail:'IP 헤더 + 전송 데이터'},{head:'이더넷 프레임',detail:'링크 헤더 + IP 패킷 + 트레일러'}],
 note:'포함 관계를 단순화한 예시입니다. HTTP 메시지 하나가 항상 세그먼트 하나인 것은 아닙니다.'
},
decapsulation: {
 layout:'stack',title:'수신 측 역캡슐화',lead:'최종 수신 호스트는 계층마다 헤더와 상태를 검증한 뒤 상위로 전달합니다.',
 layers:[{head:'링크 프레임',detail:'링크 주소·프레임 검증'},{head:'IP 패킷',detail:'목적지·IP 헤더 검증'},{head:'TCP/UDP',detail:'포트·TCP 순서 복원 또는 UDP 데이터그램'},{head:'애플리케이션',detail:'HTTP 메시지 경계와 의미 해석'}],
 note:'중간 라우터는 일반적으로 HTTP까지 해석하지 않고 다음 링크에 맞는 프레임을 새로 만듭니다.'
},
'switch-forwarding': {
 layout:'branch',title:'스위치 MAC 학습과 전달',lead:'출발지 MAC A를 수신 포트 1에 연결해 학습한 뒤 목적지 MAC B를 조회합니다.',
 question:'목적지 MAC B가 같은 VLAN의 MAC 테이블에 있는가?',
 arms:[{head:'알고 있음',detail:'해당 출력 포트로 유니캐스트 전달'},{head:'모름',detail:'수신 포트 외 같은 VLAN의 허용 포트로 flood'}],
 note:'MAC 항목은 에이징에 따라 만료될 수 있습니다. 스위치와 IP 라우터의 전달 정보는 다릅니다.'
},
'broadcast-domain': {
 layout:'compare',title:'논리적 VLAN 경계와 브로드캐스트',lead:'같은 물리 스위치에서도 다른 VLAN으로 브로드캐스트가 직접 전달되지 않습니다.',
 left:{heading:'VLAN 10',lines:['호스트 A · 호스트 B','A의 ARP 브로드캐스트 전달 가능','같은 링크 계층 브로드캐스트 범위']},
 right:{heading:'VLAN 20',lines:['호스트 C','VLAN 10 프레임 직접 수신 안 함','다른 논리적 브로드캐스트 도메인']},
 note:'IPv6 이웃 탐색은 ARP 대신 ICMPv6 멀티캐스트를 사용합니다.'
},
arp: {
 layout:'sequence',title:'ARP로 다음 홉 MAC 결정',lead:'라우팅이 다음 홉 IP를 먼저 고르고 ARP는 해당 IPv4 주소의 로컬 MAC을 찾습니다.',
 parties:['송신 호스트','다음 홉 장비'],
 messages:[{from:'left',text:'ARP Request · Who has 192.0.2.10?',detail:'로컬 링크 브로드캐스트'},{from:'right',text:'ARP Reply · aa:bb:cc:dd:ee:ff',detail:'IPv4 → MAC 매핑 응답'},{from:'left',text:'다음 홉 MAC으로 프레임 전송',detail:'IP 최종 목적지는 원격 서버'}],
 note:'ARP는 경로 선택이나 서버 신원 인증을 수행하지 않습니다.'
},
'default-gateway': {
 layout:'branch',title:'최종 IP와 다음 홉 링크 주소',lead:'목적지와 일치하는 경로가 직접 연결인지, 원격 네트워크인지 판단합니다.',
 question:'목적지 IP가 직접 연결된 경로에 속하는가?',
 arms:[{head:'직접 연결',detail:'목적지 호스트의 ARP/NDP 매핑 사용'},{head:'원격 + 기본 경로',detail:'게이트웨이 IP의 ARP/NDP 매핑 사용'}],
 note:'IP 목적지는 최종 서버로 유지되고, 현재 링크의 프레임 목적지 MAC만 게이트웨이가 될 수 있습니다.'
},
'prefix-subnet': {
 layout:'compare',title:'CIDR 192.0.2.0/24의 범위',lead:'앞의 24비트가 일치하는 주소를 같은 prefix로 묶습니다.',
 left:{heading:'같은 /24',lines:['192.0.2.10','192.0.2.30','상위 24비트 동일']},
 right:{heading:'다른 /24',lines:['192.0.3.30','상위 24비트 차이','별도 경로가 필요할 수 있음']},
 note:'같은 주소 범위라고 해서 링크 도달이나 방화벽 통과가 자동 보장되지는 않습니다.'
},
'routing-table': {
 layout:'matrix',title:'10.1.2.30의 최장 접두사 일치',lead:'세 경로에 모두 일치해도 가장 구체적인 /24가 선택됩니다.',
 columns:['접두사','다음 홉','대상 일치'],rows:[['0.0.0.0/0','기본 게이트웨이','일치'],['10.0.0.0/8','라우터 A','일치'],['10.1.2.0/24','라우터 B','선택: /24']],focusRow:2,
 note:'동일 접두사 길이 경로끼리의 metric·ECMP 정책은 별도입니다.'
},
'router-forwarding': {
 layout:'path',title:'라우터가 한 홉을 전달하는 과정',lead:'IP 패킷을 확인해 경로를 정하고 다음 링크의 새로운 프레임으로 캡슐화합니다.',
 steps:[{head:'현재 링크 프레임 수신',detail:'링크 헤더 확인·제거'},{head:'IP 목적지 확인',detail:'IP 헤더와 전달 가능 조건'},{head:'라우팅 조회',detail:'최장 일치 접두사로 다음 홉 선택'},{head:'TTL/Hop Limit 처리',detail:'패킷 수명을 감소시킴'},{head:'새 프레임 송신',detail:'다음 링크 주소로 재캡슐화'}],
 note:'일반적인 라우팅에서 최종 목적지 IP는 유지됩니다. NAT는 별개 기능입니다.'
},
'connection-tuple': {
 layout:'matrix',title:'같은 서버 포트 아래의 서로 다른 연결',lead:'TCP 연결은 로컬·원격 IP와 포트의 조합으로 구분할 수 있습니다.',
 columns:['클라이언트 IP:포트','서버 IP:포트','연결'],rows:[['192.0.2.10:53124','198.51.100.20:443','A'],['192.0.2.11:60431','198.51.100.20:443','B'],['192.0.2.12:49100','198.51.100.20:443','C']],
 note:'TCP 4-tuple과 HTTP 요청 식별자·사용자 세션은 다른 개념입니다.'
},
nat: {
 layout:'compare',title:'NAT 전후 출발지 IP 변환',lead:'출발지 NAT 예시에서 내부 호스트가 보내는 패킷의 출발지 주소가 달라집니다.',
 left:{heading:'내부 인터페이스',lines:['출발지 10.0.0.5','목적지 원격 서버','사설 IPv4 주소']},
 right:{heading:'외부 인터페이스',lines:['출발지 203.0.113.9','목적지 같은 서버','변환된 외부 IPv4 주소']},
 note:'PAT를 사용하는 경우 포트도 바뀔 수 있습니다. 라우팅과 방화벽 허용은 다른 책임입니다.'
},
'nat-mapping': {
 layout:'path',title:'PAT 매핑 생성·응답·만료',lead:'변환 관계는 NAT 장치의 유한 수명 상태로 유지됩니다.',
 steps:[{head:'내부에서 패킷 송신',detail:'10.0.0.5:40000'},{head:'외부 매핑 생성',detail:'203.0.113.9:62000에 대응'},{head:'응답 도착',detail:'매핑을 조회해 내부 종단점으로 되돌림'},{head:'매핑 만료',detail:'늦은 패킷을 원래 종단점에 연결 못 할 수 있음'}],
 note:'NAT 매핑이 살아 있다는 사실은 애플리케이션 로그인 세션이 살아 있다는 뜻이 아닙니다.'
},
} as const satisfies Record<string, AreaDiagram>
