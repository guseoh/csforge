import type { AreaDiagram } from './network-area-types'
/** HTTP version transport, caching and intermediary boundaries. */
export const httpTransportCacheDiagrams = {
'http11-persistent': {
 layout:'sequence',title:'HTTP/1.1 지속 연결 재사용',lead:'TCP 연결 하나에서 여러 HTTP 요청·응답 교환을 순차적으로 수행할 수 있습니다.',
 parties:['클라이언트','서버'],messages:[{from:'left',text:'GET /a',detail:'기존 TCP 연결'},{from:'right',text:'HTTP/1.1 200 /a',detail:'첫 응답 완료'},{from:'left',text:'GET /b',detail:'같은 TCP 연결 재사용'},{from:'right',text:'HTTP/1.1 200 /b',detail:'두 번째 응답 완료'}],
 note:'HTTP/1.1의 지속 연결은 HTTP/2 멀티플렉싱이 아닙니다. 메시지의 정확한 길이와 Connection: close 규칙이 중요합니다.'
},
'http11-pipelining': {
 layout:'sequence',title:'HTTP/1.1 파이프라이닝의 응답 순서',lead:'응답을 기다리지 않고 요청을 여러 개 보낼 수 있어도 응답은 요청 순서를 지켜야 합니다.',
 parties:['클라이언트','서버'],messages:[{from:'left',text:'R1 요청',detail:'첫 응답을 기다리지 않음'},{from:'left',text:'R2 요청',detail:'순차로 계속 전송'},{from:'left',text:'R3 요청',detail:'연속된 요청'},{from:'right',text:'S1 응답',detail:'R1 처리 완료 필요'},{from:'right',text:'S2 응답',detail:'R2가 빨리 완료됐어도 S1 뒤'},{from:'right',text:'S3 응답',detail:'S2 이후 전송'}],
 note:'응답 순서 제약과 전송 재시도 불확실성 때문에 HTTP/2 스트림 다중화와 다릅니다.'
},
'http2-stream': {
 layout:'matrix',title:'HTTP/2 연결 안의 독립 스트림',lead:'하나의 연결에서 HEADERS·DATA 프레임을 스트림 ID별로 구분하여 교차 전송할 수 있습니다.',
 columns:['스트림 ID','논리 교환','프레임 예제'],rows:[['1','요청 A ↔ 응답 A','HEADERS / DATA'],['3','요청 B ↔ 응답 B','HEADERS / DATA'],['5','요청 C ↔ 응답 C','HEADERS / DATA']],
 note:'한 메시지가 한 프레임이라는 뜻은 아닙니다. 스트림 ID는 연결 안에서만 구분하는 값이고 TCP의 순서 제약은 남습니다.'
},
quic: {
 layout:'compare',title:'QUIC의 스트림별 순서 전달',lead:'UDP 위의 QUIC은 신뢰성·암호화·연결 상태와 독립적인 전송 스트림을 제공합니다.',
 left:{heading:'QUIC Stream A',lines:['스트림 A 일부 데이터 손실','A는 해당 구간 복구 대기','A의 바이트 순서만 차단']},
 right:{heading:'QUIC Stream B',lines:['독립적 바이트 스트림 순서','B에서 필요한 데이터가 도착하면 전달 가능','연결 수준 혼잡·대역폭은 공유']},
 note:'QUIC은 UDP 자체의 보장을 바꾼 것이 아니라 UDP 데이터그램 위에 별도의 전송 프로토콜을 구성합니다.'
},
'transport-head-of-line': {
 layout:'compare',title:'TCP 기반 HTTP/2 vs QUIC 기반 HTTP/3의 HOL',lead:'HTTP/2는 HTTP 프레임을 다중화하지만 TCP 바이트 순서를 공유합니다.',
 left:{heading:'HTTP/2 over TCP',lines:['여러 HTTP 스트림 프레임이 한 TCP 순서에 배치','앞 바이트 손실 시 TCP 전달 대기','다른 HTTP 스트림 바이트도 차단 가능']},
 right:{heading:'HTTP/3 over QUIC',lines:['QUIC 스트림별 순서 전달','한 스트림 손실로 다른 스트림이 동일 차단되지 않음','혼잡·대역폭 등 연결 자원은 공유']},
 note:'HTTP/1.1 응답 순서 HOL, TCP 바이트 HOL, QUIC 스트림별 순서는 서로 다른 계층의 문제입니다.'
},
'if-none-match': {
 layout:'branch',title:'GET에서 If-None-Match의 ETag 비교',lead:'저장한 표현의 ETag를 서버가 현재 선택한 표현의 검증자와 비교합니다.',
 question:'If-None-Match: "v7" 와 현재 표현의 ETag가 일치하는가?',
 arms:[{head:'일치',detail:'304 Not Modified · 기존 저장 본문 재사용'},{head:'불일치',detail:'200 OK · 현재 표현 콘텐츠 전달'}],
 note:'GET/HEAD 사례입니다. 상태 변경 메서드의 전제조건 실패는 412가 될 수 있고, 약한 비교 규칙도 고려해야 합니다.'
},
'304': {
 layout:'path',title:'304 뒤에도 기존 본문은 보관·재사용',lead:'304 응답은 새 표현 본문을 싣지 않고 검증 결과와 갱신 가능한 메타데이터를 전달합니다.',
 steps:[{head:'기존 저장 표현',detail:'본문 A + ETag "v7"'},{head:'조건부 GET',detail:'If-None-Match: "v7"'},{head:'304 Not Modified',detail:'새 표현 콘텐츠 없음'},{head:'메타데이터 갱신',detail:'Date·ETag·Cache-Control 등 반영'},{head:'저장된 본문 A 재사용',detail:'캐시가 갖고 있는 기존 콘텐츠 반환'}],
 note:'저장된 본문이 없다면 304만으로 표현을 복구할 수 없습니다.'
},
'intermediary-cache': {
 layout:'branch',title:'공유 HTTP 캐시의 세 경로',lead:'재사용 가능성은 저장 상태·신선도·요청 조건·캐시 정책을 함께 평가합니다.',
 question:'현재 캐시 항목은 재사용 조건을 만족하는가?',
 arms:[{head:'Fresh hit',detail:'원본을 거치지 않고 저장 응답 반환'},{head:'Stale + validator',detail:'원본 조건부 재검증 · 304면 본문 재사용'},{head:'Cache miss',detail:'원본에 요청 · 적합하면 새 응답 저장'}],
 note:'Vary·인증·캐시 제어가 허용한 경우에만 공유 캐시를 재사용합니다. 각 CDN/브라우저 캐시는 별도 상태입니다.'
},
'cookie-scope': {
 layout:'path',title:'쿠키를 붙이기 전의 전송 조건',lead:'저장된 쿠키라도 모든 HTTP 요청에 자동으로 포함되는 것은 아닙니다.',
 steps:[{head:'Domain/host 범위',detail:'요청 호스트와 도메인 속성 비교'},{head:'Path 범위',detail:'요청 경로가 쿠키 Path에 맞는지 검사'},{head:'Secure 전송 조건',detail:'보안 연결(예: HTTPS)인지 확인'},{head:'SameSite 문맥',detail:'동일 사이트/교차 사이트와 요청 문맥 고려'},{head:'Cookie 요청 필드',detail:'조건을 만족한 쿠키만 포함'}],
 note:'Path는 보안 접근 경계가 아닙니다. HttpOnly는 스크립트 접근 제한이며 쿠키 적용 범위에 포트는 보통 포함되지 않습니다.'
},
proxy: {
 layout:'path',title:'정방향 프록시는 클라이언트 측 중개자',lead:'클라이언트가 프록시에 요청하고 프록시는 원본을 향해 별도 구간을 만듭니다.',
 steps:[{head:'클라이언트',detail:'정방향 프록시를 요청 대상 중개자로 선택'},{head:'연결 A',detail:'클라이언트 → 프록시'},{head:'정방향 프록시',detail:'출구 정책 · 요청 중개 · 별도 전달'},{head:'연결 B',detail:'프록시 → 외부 원본'},{head:'원본 서버',detail:'연결 상대는 프록시일 수 있음'}],
 note:'HTTPS CONNECT 터널에서 프록시가 TLS를 종료하지 않으면 내부 HTTP 콘텐츠를 자동으로 읽을 수 없습니다.'
},
'reverse-proxy': {
 layout:'path',title:'역방향 프록시는 서버 측 진입점',lead:'클라이언트 연결을 받은 프록시는 백엔드에 독립된 요청 연결을 생성합니다.',
 steps:[{head:'외부 클라이언트',detail:'공개 프록시로 요청'},{head:'연결 A',detail:'클라이언트 ↔ 역방향 프록시'},{head:'역방향 프록시',detail:'선택적 TLS 종료 · 경로 선택'},{head:'연결 B',detail:'프록시 ↔ 선택된 백엔드'},{head:'백엔드 응답',detail:'프록시가 클라이언트에 별도 응답'}],
 note:'프록시가 원본과 동일한 TCP/TLS 연결을 공유하지는 않습니다. 캐싱·로드밸런싱은 선택적 기능입니다.'
},
'trusted-proxy-boundary': {
 layout:'compare',title:'Forwarded 헤더는 신뢰 경계 뒤에서 해석',lead:'클라이언트가 만든 전달 헤더를 그대로 서버 신원 근거로 사용하면 위조될 수 있습니다.',
 left:{heading:'외부 · 신뢰되지 않은 입력',lines:['X-Forwarded-For: 임의 IP 위조 가능','클라이언트가 직접 값 삽입 가능','주소·스킴·Host를 인증 정보처럼 믿지 않음']},
 right:{heading:'신뢰된 프록시 경계',lines:['기존 전달 값 제거 또는 정책에 따라 정리','관찰한 클라이언트 정보 재작성','백엔드는 허용된 프록시 연결에서만 사용']},
 note:'신뢰된 전달 IP도 사용자 인증·인가를 대신하지 않습니다. 프록시 체인의 첫/마지막 주소를 무조건 믿으면 안 됩니다.'
},
'cdn-http-intermediary': {
 layout:'branch',title:'CDN Edge가 응답을 만드는 두 경로',lead:'CDN 엣지는 원본 앞의 HTTP 중개자이며 재사용 가능하면 캐시 응답을 직접 보냅니다.',
 question:'엣지 캐시가 현재 요청에 사용할 신선한 응답을 갖고 있는가?',
 arms:[{head:'Cache hit',detail:'엣지 → 클라이언트, 원본에 새 요청 없음'},{head:'Miss / 재검증 필요',detail:'엣지 → 원본 서버, 별도 요청 후 응답 전달'}],
 note:'엣지와 원본의 HTTP 연결은 서로 다른 홉입니다. 캐시의 내용이 항상 최신 원본과 같은 시점이라는 뜻은 아닙니다.'
},
} as const satisfies Record<string, AreaDiagram>
