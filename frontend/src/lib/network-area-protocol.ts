import type { AreaDiagram } from './network-area-types'
/** Domain names, reliable byte streams, datagrams and TLS trust boundaries. */
export const protocolDiagrams = {
'domain-hierarchy': {
 layout:'stack',title:'www.example.com. 이름 공간의 계층',lead:'DNS 이름은 오른쪽부터 루트, TLD, 하위 레이블 순으로 해석됩니다.',
 layers:[{head:'루트 · .',detail:'DNS 이름 공간의 공통 최상위'},{head:'com',detail:'최상위 도메인(TLD)'},{head:'example.com',detail:'위임될 수 있는 관리 이름'},{head:'www.example.com',detail:'호스트 이름 · 최종 조회 이름'}],
 note:'DNS 레이블 계층과 실제 권한 zone의 분리 위치는 일치하지 않을 수 있습니다.'
},
cname: {
 layout:'path',title:'CNAME 별칭에서 최종 A 레코드까지',lead:'CNAME은 IP 주소 자체가 아니라 다른 정식 DNS 이름을 가리킵니다.',
 steps:[{head:'service.example.',detail:'요청 이름'},{head:'CNAME 레코드',detail:'service.example. → edge.example.'},{head:'edge.example. 조회',detail:'필요하다면 추가 DNS 조회 수행'},{head:'A = 192.0.2.20',detail:'정식 이름의 최종 IPv4 응답'}],
 note:'추가 질의 여부는 캐시와 DNS 응답 구성에 따라 달라집니다. 순환 CNAME은 정상 해석이 아닙니다.'
},
'dns-failure': {
 layout:'branch',title:'DNS 부정 응답과 조회 실패를 구분',lead:'DNS에서 주소를 얻지 못했다는 결과에는 서로 다른 원인이 있습니다.',
 question:'DNS 질의 결과로 어떤 응답을 관찰했는가?',
 arms:[{head:'NXDOMAIN / NODATA',detail:'이름 없음 / 이름은 있으나 해당 유형 레코드 없음'},{head:'SERVFAIL / REFUSED',detail:'서버 오류 · 응답 거절 / 정책 판단'},{head:'응답 시간 초과',detail:'정해진 시간 안에 유효한 DNS 응답 없음'}],
 note:'명시적 부정 응답은 부정 캐시 대상이 될 수 있으나 timeout과 같은 방식으로 무한 재시도하면 안 됩니다.'
},
acknowledgement: {
 layout:'compare',title:'누적 ACK는 다음 기대 바이트',lead:'먼저 도착한 비연속 바이트가 있어도 빈 구간은 누적 확인되지 않습니다.',
 left:{heading:'연속 수신',lines:['1000~1499 B 수신','다음 기대 바이트 = 1500','누적 ACK = 1500']},
 right:{heading:'빈 구간 발생',lines:['1000~1499 B 수신','1500~1999 B 누락 / 2000~2499 B 도착','누적 ACK는 여전히 1500']},
 note:'SACK는 협상된 경우 비연속 수신 범위를 추가로 알릴 수 있습니다. TCP ACK는 업무 처리 완료가 아닙니다.'
},
'congestion-control': {
 layout:'compare',title:'수신 흐름 제어와 경로 혼잡 제어',lead:'송신 가능한 미확인 데이터 양은 수신 윈도와 혼잡 윈도 양쪽 조건을 받아야 합니다.',
 left:{heading:'rwnd · 흐름 제어',lines:['수신자 버퍼 수용 가능량','수신 측이 광고','수신 버퍼를 과도하게 채우지 않음']},
 right:{heading:'cwnd · 혼잡 제어',lines:['공유 네트워크 경로의 여유','송신 측이 관리','혼잡·손실·ACK 등 신호에 따라 변경']},
 note:'실제 미확인 데이터 상한을 min(rwnd, cwnd) 관점으로 이해하되 CUBIC 등 알고리즘별 변화량은 다릅니다.'
},
'tcp-head-of-line': {
 layout:'path',title:'앞선 TCP 바이트 손실이 만드는 HOL 차단',lead:'뒤 바이트가 도착해도 앞의 누락 구간이 복구되어야 스트림을 순서대로 전달합니다.',
 steps:[{head:'1000~1499 수신',detail:'연속 수신 구간'},{head:'1500~1999 누락',detail:'TCP 스트림의 빈 구간'},{head:'2000~2499 선도착',detail:'수신 버퍼에 보관, 애플리케이션 전달 대기'},{head:'누락 바이트 재전송',detail:'1500~1999가 채워짐'},{head:'연속 전달 재개',detail:'이후 받은 데이터까지 순서대로 전달 가능'}],
 note:'HTTP/2의 다중 스트림도 한 TCP 바이트 순서를 공유합니다. QUIC은 스트림별 수신 순서를 분리합니다.'
},
'delivery-order-guarantee': {
 layout:'compare',title:'UDP 송신 순서와 가능한 수신 관찰',lead:'UDP 데이터그램은 전송·도착·정렬·중복 제거를 자체 상태로 보장하지 않습니다.',
 left:{heading:'송신 측',lines:['D1 → D2 → D3 → D4','순서대로 전송','UDP ACK·재전송 상태 없음']},
 right:{heading:'수신 측의 가능한 결과',lines:['D1 → D3 → D2 → D2','D4 손실 / D2 중복 가능','항상 이런 결과가 발생하는 것은 아님']},
 note:'UDP 계약은 손실률이나 지연을 정하지 않습니다. 필요한 복구는 상위 프로토콜이 선택합니다.'
},
'application-reliability': {
 layout:'sequence',title:'ACK 유실과 애플리케이션 중복 처리',lead:'UDP 위에 자체 재전송을 구현하면 수신 성공과 ACK 수신 실패를 구별해야 합니다.',
 parties:['상위 송신 프로토콜','상위 수신 프로토콜'],
 messages:[{from:'left',text:'메시지 #17 전송',detail:'수신 측이 작업을 정상 처리함'},{from:'right',text:'ACK #17 전송, 도중 유실',detail:'송신자는 확인 응답을 받지 못함'},{from:'left',text:'timeout → 메시지 #17 재전송',detail:'처리 완료 여부를 모르는 상태'},{from:'right',text:'ID #17 중복 감지',detail:'중복 업무 효과 방지 후 확인 응답'}],
 note:'이 ACK는 UDP의 내장 기능이 아니라 상위 프로토콜이 직접 정의한 메시지입니다.'
},
pki: {
 layout:'stack',title:'PKI 인증서 경로와 신뢰 기준점',lead:'서버 인증서를 받았다고 즉시 신뢰하지 않고 경로·제약·호스트 이름을 검증합니다.',
 layers:[{head:'서버(leaf) 인증서',detail:'서버가 제시 · 서비스 이름의 신원 주장'},{head:'중간 CA 인증서',detail:'발급자 서명·CA 제약을 확인'},{head:'클라이언트 신뢰 기준점',detail:'로컬 trust store에 미리 신뢰된 발급자'}],
 note:'서버가 루트 인증서를 보내야만 신뢰가 생기는 것은 아닙니다. 경로 검증과 호스트 이름 검증은 모두 필요합니다.'
},
'tls-handshake': {
 layout:'sequence',title:'TLS 1.3 서버 인증 핸드셰이크',lead:'키 합의, 서버 인증서 검증, Finished 확인 후 보호된 HTTP 데이터를 전달합니다.',
 parties:['클라이언트','서버'],
 messages:[{from:'left',text:'ClientHello',detail:'버전·암호군·key_share 제안'},{from:'right',text:'ServerHello',detail:'선택값·key_share 응답'},{from:'right',text:'암호화된 서버 handshake flight',detail:'EncryptedExtensions · Certificate · CertificateVerify · Finished'},{from:'left',text:'Finished',detail:'핸드셰이크 transcript·키 상태 확인'},{from:'left',text:'보호된 애플리케이션 데이터',detail:'TLS 레코드로 HTTP 등 상위 데이터 전달'}],
 note:'0-RTT 재개와 클라이언트 인증은 제외한 일반적인 TLS 1.3 흐름입니다. CertificateVerify와 Finished는 다른 검증입니다.'
},
'tls-termination': {
 layout:'compare',title:'TLS 연결 A와 별도 백엔드 연결 B',lead:'리버스 프록시가 TLS를 종료하면 클라이언트 TLS 보호 구간은 프록시에서 끝납니다.',
 left:{heading:'연결 A · 외부 TLS',lines:['클라이언트 ↔ 프록시','클라이언트가 프록시 인증서 검증','프록시에서 HTTP 데이터 복호화']},
 right:{heading:'연결 B · 내부 구간',lines:['프록시 ↔ 백엔드','평문 HTTP 또는 별도 TLS','백엔드 인증은 별도 필요']},
 note:'Forwarded / X-Forwarded-* 값은 중개자가 작성하는 메타데이터입니다. 신뢰 프록시 경계 없이 사용자 신원으로 삼지 않습니다.'
},
} as const satisfies Record<string, AreaDiagram>
