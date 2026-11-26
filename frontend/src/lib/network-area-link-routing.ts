import type { AreaDiagram } from './network-area-types'
/** Network links, routing and address transformation: local, deterministic examples. */
export const linkRouteDiagrams = {
'link-network-transport-application': {
 layout:'stack',title:'계층별 책임과 관찰 정보',lead:'계층별 전달 성공의 의미는 서로 다릅니다.',
 layers:[{head:'애플리케이션',detail:'HTTP 메서드·헤더·상태 의미'},{head:'전송',detail:'TCP 바이트 순서 / UDP 데이터그램 / 포트'},{head:'네트워크',detail:'IP 목적지 주소와 다음 홉 경로'},{head:'링크',detail:'MAC 주소와 현재 링크의 프레임'}],
 note:'TCP 연결이 성공해도 HTTP 처리나 업무 트랜잭션 성공을 뜻하지 않습니다.'
},
encapsulation: {
 layout:'packet-envelope',direction:'send',title:'송신 측 캡슐화',lead:'같은 응용 데이터 바이트를 TCP·IP·이더넷이 각각 자신의 전달 단위로 감쌉니다.',
 note:'TCP 데이터 일부를 담은 IPv4/Ethernet 예시입니다. 헤더 폭은 실제 바이트 길이에 비례하지 않으며 HTTP 메시지와 세그먼트는 일대일이 아닙니다.'
},
decapsulation: {
 layout:'packet-envelope',direction:'receive',title:'수신 측 역캡슐화',lead:'최종 목적지 호스트에서 검증을 통과한 데이터만 상위 계층으로 넘어갑니다.',
 note:'TCP는 순서 있는 바이트 스트림을 복원한 뒤 애플리케이션에 전달합니다. 중간 라우터는 일반적으로 IP 전달까지만 수행합니다.'
},
'switch-forwarding': {
 layout:'boundary',example:'switch',title:"스위치의 학습과 목적지 조회",lead:"출발지 MAC을 입력 포트에 학습한 뒤 목적지 MAC으로 출력 포트를 찾습니다.",
 note:"같은 VLAN의 전달 가능한 포트만 고려합니다. 미등록 목적지는 수신 포트를 제외한 해당 VLAN 포트로 플러딩할 수 있습니다."
},
'broadcast-domain': {
 layout:'compare',title:'논리적 VLAN 경계와 브로드캐스트',lead:'같은 물리 스위치에서도 다른 VLAN으로 브로드캐스트가 직접 전달되지 않습니다.',
 left:{heading:'VLAN 10',lines:['호스트 A · 호스트 B','A의 ARP 브로드캐스트 전달 가능','같은 링크 계층 브로드캐스트 범위']},
 right:{heading:'VLAN 20',lines:['호스트 C','VLAN 10 프레임 직접 수신 안 함','다른 논리적 브로드캐스트 도메인']},
 note:'IPv6 이웃 탐색은 ARP 대신 ICMPv6 멀티캐스트를 사용합니다.'
},
arp: {
 layout:'boundary',example:'arp',title:"ARP 브로드캐스트와 응답",lead:"라우팅이 선택한 다음 홉 IPv4 주소를 로컬 링크에서 MAC 주소로 해석합니다.",
 note:"일반적인 ARP 요청·응답 예시입니다. 프록시 ARP 등은 제외하며 ARP 자체는 신원을 인증하지 않습니다."
},
'default-gateway': {
 layout:'branch',title:'최종 IP와 다음 홉 링크 주소',lead:'목적지와 일치하는 경로가 직접 연결인지, 원격 네트워크인지 판단합니다.',
 question:'목적지 IP가 직접 연결된 경로에 속하는가?',
 arms:[{head:'직접 연결',detail:'목적지 호스트의 ARP/NDP 매핑 사용'},{head:'원격 + 기본 경로',detail:'게이트웨이 IP의 ARP/NDP 매핑 사용'}],
 note:'IP 목적지는 최종 서버로 유지되고, 현재 링크의 프레임 목적지 MAC만 게이트웨이가 될 수 있습니다.'
},
'prefix-subnet': {
 layout:'ipv4-prefix',title:'CIDR 192.0.2.0/24의 비트 경계',lead:'첫 24비트와 마지막 8비트를 나누어 어느 주소가 같은 prefix에 포함되는지 판단합니다.',
 note:'192.0.2.0~192.0.2.255는 256개 주소를 포함하는 범위이며 모두 할당 가능한 호스트 주소라는 뜻은 아닙니다. 같은 범위라도 도달성을 보장하지 않습니다.'
},
'routing-table': {
 layout:'matrix',title:'10.1.2.30의 최장 접두사 일치',lead:'세 경로에 모두 일치해도 가장 구체적인 /24가 선택됩니다.',
 columns:['접두사','다음 홉','대상 일치'],rows:[['0.0.0.0/0','기본 게이트웨이','일치'],['10.0.0.0/8','라우터 A','일치'],['10.1.2.0/24','라우터 B','선택: /24']],focusRow:2,
 note:'동일 접두사 길이 경로끼리의 metric·ECMP 정책은 별도입니다.'
},
'router-forwarding': {
 layout:'boundary',example:'router',title:"라우터 전후 링크 프레임",lead:"일반 IPv4 전달에서는 IP 출발지·목적지가 유지되고 링크 헤더는 다음 홉에 맞게 교체됩니다.",
 note:"NAT 없는 예시입니다. TTL 감소와 IPv4 헤더 체크섬 갱신을 수행하며 전달 불가능한 패킷은 폐기될 수 있습니다."
},
'connection-tuple': {
 layout:'matrix',title:'같은 서버 포트 아래의 서로 다른 연결',lead:'TCP 연결은 로컬·원격 IP와 포트의 조합으로 구분할 수 있습니다.',
 columns:['원격 IP:포트','로컬 IP:포트','TCP 연결'],rows:[['192.0.2.10:53124','198.51.100.20:443','A'],['192.0.2.11:60431','198.51.100.20:443','B'],['192.0.2.12:49100','198.51.100.20:443','C']],
 note:'서버 관점의 예시입니다. IP 주소와 포트 네 값이 연결을 구분하며 HTTP 요청 ID·사용자 세션과는 별개입니다.'
},
nat: {
 layout:'boundary',example:'nat',title:"NAPT의 출발지 변환과 응답 역변환",lead:"주소와 포트를 변환한 뒤 응답의 목적지를 내부 종단점으로 복원합니다.",
 note:"TCP 출발지 NAPT 예시이며 기본 NAT는 주소만 변환할 수 있습니다. 라우팅과 방화벽은 별도 책임입니다."
},
'nat-mapping': {
 layout:'boundary',example:'mapping',title:"NAPT 상태의 생성·조회·만료",lead:"같은 외부 주소·포트로 돌아오는 응답도 매핑 상태가 남아 있어야 내부 흐름으로 전달할 수 있습니다.",
 note:"실제 만료 시간은 구현·프로토콜·트래픽 활동에 따라 다릅니다. 앱 세션 수명과 독립적입니다."
},
} as const satisfies Record<string, AreaDiagram>
