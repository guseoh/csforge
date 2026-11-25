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
 parties:['클라이언트','서버'],messages:[{from:'left',text:'R1 요청',detail:'요청 송신 순서 1'},{from:'left',text:'R2 요청',detail:'S1 응답을 기다리지 않음'},{from:'left',text:'R3 요청',detail:'연속된 요청'},{from:'right',text:'S1 응답',detail:'R1이 느리면 첫 응답 대기'},{from:'right',text:'S2 응답',detail:'R2 처리 완료가 더 빨라도 S1 뒤'},{from:'right',text:'S3 응답',detail:'S2 이후 전송'}],
 note:'서버는 안전한 메서드의 파이프라인 요청을 병렬 처리할 수 있지만 응답 순서는 유지해야 합니다. 연결 단절 후 재시도는 멱등성과 처리 불확실성을 고려합니다.'
},
'http2-stream': {
 layout:'frame-interleave',title:'HTTP/2 한 연결에서 교차 전송되는 프레임',lead:'같은 방향의 프레임 열을 스트림 ID로 분리하면 각 스트림의 메시지를 재구성할 수 있습니다.',
 note:'HEADERS 예시는 END_HEADERS로 끝난 단일 프레임입니다. CONTINUATION이 필요한 필드 블록은 중간에 다른 프레임을 끼워 넣을 수 없습니다. TCP 순서 제약은 남습니다.'
},
quic: {
 layout:'compare',title:'QUIC의 스트림별 순서 전달',lead:'UDP 위의 QUIC은 신뢰성·암호화·연결 상태와 독립적인 전송 스트림을 제공합니다.',
 left:{heading:'QUIC Stream A',lines:['스트림 A 일부 데이터 손실','A는 해당 구간 복구 대기','A의 누락 offset 이후 전달 대기']},
 right:{heading:'QUIC Stream B',lines:['독립적 바이트 스트림 순서','B의 필요한 데이터 도착 시 전달 가능','연결 수준 혼잡·대역폭은 공유']},
 note:'UDP 자체의 보장을 바꾸는 것이 아닙니다. QUIC은 스트림별 순서를 유지하지만 연결 수준 혼잡 제어와 대역폭을 공유합니다.'
},
'transport-head-of-line': {
 layout:'boundary',example:'hol',title:"TCP 공통 순서와 QUIC 스트림별 순서",lead:"TCP 바이트 공백은 뒤에 도착한 여러 HTTP/2 스트림을 막을 수 있지만 QUIC은 스트림별 전달 순서를 유지합니다.",
 note:"QUIC 예시는 B의 필요한 데이터와 제어 정보가 모두 도착했다고 가정합니다. 연결 혼잡 제어·대역폭은 공유됩니다."
},
'if-none-match': {
 layout:'branch',title:'GET에서 If-None-Match의 ETag 비교',lead:'저장한 표현의 ETag를 서버가 현재 선택한 표현의 검증자와 비교합니다.',
 question:'GET/HEAD · 현재 ETag W/"v7"와 "v7"의 약한 비교',
 arms:[{head:'일치',detail:'조건 실패 → 304, 저장 표현이 있으면 재사용'},{head:'불일치',detail:'조건 통과 → 일반 요청 처리'}],
 note:'If-None-Match는 약한 비교를 사용합니다. 일치 시 GET/HEAD는 304, 다른 메서드는 412입니다(일반적인 정상 요청 평가 조건). 불일치 자체가 200을 보장하지 않습니다.'
},
'304': {
 layout:'compare',title:'304 전후 동일 본문과 갱신 메타데이터',lead:'304 응답은 새 표현 본문을 싣지 않고 검증 결과와 갱신 가능한 메타데이터를 전달합니다.',
 left:{heading:'검증 전 저장 응답',lines:['본문 A · ETag "v7"','Cache-Control: max-age=60','현재 나이 70초 → 재검증']}, right:{heading:'304 처리 후 저장 응답',lines:['본문 A · ETag "v7" 유지','304의 Cache-Control: max-age=120 반영','갱신된 메타데이터로 신선도 재평가']},
 note:'If-None-Match: "v7"에 대한 304 예시입니다. 일치하는 저장 응답의 메타데이터를 갱신하되 새 본문은 없습니다. 저장 본문이 없으면 전체 표현을 다시 얻어야 합니다.'
},
'intermediary-cache': {
 layout:'branch',title:'공유 HTTP 캐시의 세 경로',lead:'재사용 가능성은 저장 상태·신선도·요청 조건·캐시 정책을 함께 평가합니다.',
 question:'공유 캐시 사용 자격·키·Vary를 확인한 뒤 상태 판단',
 arms:[{head:'Fresh hit',detail:'원본을 거치지 않고 저장 응답 반환'},{head:'Stale + validator',detail:'원본 조건부 재검증 · 304면 본문 재사용'},{head:'Miss / 사용 불가',detail:'원본 요청 · 저장 허용 시에만 저장'}],
 note:'공유 캐시 재사용 자격을 신선도와 먼저 구분합니다. Vary·Authorization·Cache-Control 조건을 평가하며, stale 허용 예외와 검증자 없는 일반 조회도 있습니다.'
},
'cookie-scope': {
 layout:'cookie-conditions',title:'쿠키 전송을 결정하는 독립 조건',lead:'저장된 쿠키마다 호스트, 경로, 보안 전송, 사이트 문맥과 만료 여부를 함께 판단합니다.',
 note:'Path는 보안 접근 경계가 아닙니다. HttpOnly는 스크립트 접근 제한이며 쿠키 적용 범위에 포트는 보통 포함되지 않습니다. 브라우저의 추가 정책도 영향을 줍니다.'
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
 layout:'boundary',example:'proxy',title:"외부 전달 헤더와 신뢰 프록시 경계",lead:"외부에서 주장한 주소를 경계에서 정리하고 실제 연결 상대를 검증한 백엔드만 전달 메타데이터를 사용합니다.",
 note:"단일 신뢰 프록시의 정책 예시입니다. 다중 홉에서는 허용 프록시 체인 규칙이 필요하며 전달 IP는 사용자 인증이 아닙니다."
},
'cdn-http-intermediary': {
 layout:'branch',title:'CDN Edge가 응답을 만드는 두 경로',lead:'CDN 엣지는 원본 앞의 HTTP 중개자이며 재사용 가능하면 캐시 응답을 직접 보냅니다.',
 question:'엣지 캐시가 현재 요청에 사용할 신선한 응답을 갖고 있는가?',
 arms:[{head:'Cache hit',detail:'엣지 → 클라이언트, 원본에 새 요청 없음'},{head:'Miss / 재검증 필요',detail:'엣지 → 원본 서버, 별도 요청 후 응답 전달'}],
 note:'엣지와 원본의 HTTP 연결은 서로 다른 홉입니다. 캐시의 내용이 항상 최신 원본과 같은 시점이라는 뜻은 아닙니다.'
},
} as const satisfies Record<string, AreaDiagram>
