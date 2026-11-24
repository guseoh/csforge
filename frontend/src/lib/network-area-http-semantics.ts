import type { AreaDiagram } from './network-area-types'
/** Request resolution and HTTP method/status semantics: authored protocol cases. */
export const httpSemanticsDiagrams = {
'url-components': {
 layout:'matrix',title:'URL 요소와 전송 위치의 차이',lead:'하나의 URL 문자열도 연결 대상과 HTTP 메시지에서 서로 다른 역할을 합니다.',
 columns:['구성 요소','예시','사용 목적'],rows:[['scheme','https','보호 전송 규칙'],['authority','api.example.com:8443','호스트·포트'],['path','/users/42','HTTP 요청 대상'],['query','detail=true','요청 대상의 조건'],['fragment','#profile','클라이언트 측 위치']],
 note:'프래그먼트는 HTTP 요청 대상에 보내지 않습니다. DNS는 host를 주소 후보로 해석할 수 있습니다.'
},
'dns-to-route': {
 layout:'path',title:'DNS 주소 후보와 IP 라우팅의 독립 경계',lead:'DNS에서 IP 주소를 알아낸 뒤에도 해당 목적지로 전송할 경로가 필요합니다.',
 steps:[{head:'api.example.com',detail:'연결 대상 호스트 이름'},{head:'DNS 조회',detail:'203.0.113.10 또는 2001:db8::10 같은 주소 후보'},{head:'목적지 IP 선택',detail:'주소 패밀리·연결 정책·연결 성공 고려'},{head:'라우팅 테이블 조회',detail:'다음 홉 · 출력 인터페이스 선택'},{head:'현재 링크 전달',detail:'ARP/NDP로 다음 홉의 링크 주소 결정 가능'}],
 note:'DNS 성공이 실제 경로의 존재나 TCP 연결 성공을 보장하지 않습니다. 연결 재사용 시 모든 단계를 반복하지 않습니다.'
},
'tls-before-http': {
 layout:'compare',title:'HTTPS 전송 준비: TCP/TLS와 QUIC',lead:'보호된 HTTP 데이터에는 인증과 암호 상태가 필요하지만 HTTP 버전에 따라 전송 경로가 다릅니다.',
 left:{heading:'HTTP/1.1·2',lines:['TCP 연결 수립','TLS 1.3 핸드셰이크','보호된 HTTP 데이터']},
 right:{heading:'HTTP/3',lines:['UDP 위 QUIC 연결','QUIC에 통합된 TLS 1.3 키 협상','HTTP/3 스트림 전송']},
 note:'기존 보안 연결 재사용 시 모든 핸드셰이크를 반복하지 않습니다. TLS 0-RTT는 replay 위험이 있는 예외입니다.'
},
'http-request-delivery': {
 layout:'branch',title:'HTTP 중개자가 만드는 응답 경로',lead:'클라이언트 요청이 항상 원본 애플리케이션 서버에 전달되는 것은 아닙니다.',
 question:'CDN/프록시가 재사용 가능한 신선한 응답을 갖고 있는가?',
 arms:[{head:'캐시 적중',detail:'중개자가 저장 응답을 클라이언트에 직접 반환'},{head:'캐시 미스·재검증',detail:'원본 서버로 별도 HTTP 연결과 요청을 생성'}],
 note:'중개자는 헤더·TLS·연결을 홉별로 처리할 수 있으며, 원본 서버의 업무 처리 성공과 응답 수신은 구별해야 합니다.'
},
'proxy-gateway-path': {
 layout:'compare',title:'정방향과 역방향 프록시의 배치',lead:'둘 다 HTTP 중개자지만 어느 쪽의 경계에서 연결을 대신 받는지가 다릅니다.',
 left:{heading:'정방향 프록시',lines:['클라이언트 → 프록시 → 외부 원본','클라이언트 쪽 출구 제어','CONNECT라면 TLS 내용이 보이지 않을 수 있음']},
 right:{heading:'역방향 프록시',lines:['외부 클라이언트 → 프록시 → 내부 서버','서버 쪽 진입점','TLS 종료·라우팅·캐시는 선택적 기능']},
 note:'각 홉은 별도의 전송 연결입니다. 프록시를 통과했다고 원래 요청 바이트가 항상 동일하게 유지되지는 않습니다.'
},
'header-body': {
 layout:'compare',title:'HTTP 필드와 콘텐츠 바이트의 역할',lead:'헤더 필드의 메타데이터와 메시지 콘텐츠는 서로 다른 정보입니다.',
 left:{heading:'HTTP 필드',lines:['Content-Type: application/json','Cache-Control / Authorization','메시지 의미·조건·정책 정보']},
 right:{heading:'HTTP 콘텐츠',lines:['{"name":"kim"}','표현 데이터의 바이트','Java DTO는 애플리케이션이 역직렬화']},
 note:'HTTP/1.1 메시지 본문 경계는 별도의 프레이밍 규칙이 결정합니다. Content-Type만으로 길이를 알 수 없습니다.'
},
'content-negotiation': {
 layout:'matrix',title:'콘텐츠 협상과 표현 선택',lead:'클라이언트 선호와 서버가 제공하는 표현을 맞춰 하나의 응답 변형을 선택합니다.',
 columns:['협상 조건','클라이언트 선호','예제 서버 선택'],rows:[['Accept','application/json','JSON'],['Accept-Language','ko','한국어'],['Accept-Encoding','gzip','지원 시 gzip']],
 note:'캐시는 Vary: Accept-Language 등 표현 선택에 영향을 준 요청 필드를 고려해야 합니다. 406도 가능한 결과입니다.'
},
put: {
 layout:'compare',title:'PUT 한 번과 같은 PUT 반복의 의도된 효과',lead:'동일한 표현 상태를 반복 요청해도 의도된 자원 상태 효과는 누적되지 않습니다.',
 left:{heading:'첫 PUT',lines:['/profiles/42', '{"nickname":"new"} 적용 요청', '목표 상태 nickname = new']},
 right:{heading:'동일 PUT 재시도',lines:['/profiles/42에 같은 요청', '목표 상태 nickname = new 유지', '서버 로그는 추가될 수 있음']},
 note:'PUT은 원하는 자원 표현 상태의 생성·대체이며 DB 행의 모든 내부 필드를 그대로 덮으라는 구현 규칙은 아닙니다.'
},
'protocol-idempotency-boundary': {
 layout:'compare',title:'HTTP 멱등성 vs 업무 중복 방지',lead:'프로토콜이 정의한 의도된 HTTP 효과와 실제 업무의 중복 처리 방지는 별개의 계약입니다.',
 left:{heading:'HTTP 메서드 의미',lines:['PUT / DELETE 등 의도된 효과가 멱등','네트워크는 요청을 중복 전달할 수 있음','부수 효과 실행 횟수까지 보장하지 않음']},
 right:{heading:'애플리케이션 멱등성',lines:['POST + Idempotency-Key 등 작업 식별','동일 작업의 저장 상태·결과 확인','결제·주문·외부 효과 중복 제어']},
 note:'키 범위·TTL·서로 다른 payload 처리·동시 실행 정책이 필요합니다. 정확히 한 번 실행 보장을 뜻하지 않습니다.'
},
'redirect-status': {
 layout:'matrix',title:'리다이렉트의 메서드 유지 규칙',lead:'Location을 따라갈 때 상태 코드별 후속 HTTP 요청 의미가 달라질 수 있습니다.',
 columns:['상태','URI 이동 의미','POST 후속 요청'],rows:[['301 / 302','영구 / 임시','GET 전환 가능'],['303','다른 조회 URI','GET 또는 HEAD 사용'],['307 / 308','임시 / 영구','원래 메서드·콘텐츠 유지']],
 note:'307·308은 자동 리다이렉트 시 메서드·콘텐츠 변경을 허용하지 않습니다.'
},
'429': {
 layout:'path',title:'요청 제한과 지연된 재시도',lead:'429는 전송 실패가 아니라 서버의 요청률 정책에 따른 HTTP 거절 결과입니다.',
 steps:[{head:'클라이언트 요청',detail:'어떤 주체·자원·시간 범위의 정책인지 확인'},{head:'요청률 제한 정책 초과',detail:'서버가 정한 임계치와 식별 범위'},{head:'429 Too Many Requests',detail:'Retry-After는 포함될 수도 있고 없을 수도 있음'},{head:'제한된 재시도',detail:'시간 예산 · 지터 · 백오프 고려'}],
 note:'429는 특정 정책을 자동으로 증명하지 않습니다. 503과 달리 요청률 제한 의미이고 캐시 저장도 피해야 합니다.'
},
'500-502-503-504': {
 layout:'matrix',title:'5xx 실패를 반환한 홉과 원인',lead:'5xx를 단순한 서버 오류 하나로 합치지 않고 응답을 만든 지점을 구분합니다.',
 columns:['코드','응답 주체','의미'],rows:[['500','현재 서버','예기치 못한 내부 처리 조건'],['502','게이트웨이·프록시','상위 서버의 유효하지 않은 응답'],['503','요청 처리 서버','일시적인 과부하·점검 등'],['504','게이트웨이·프록시','상위 서버 응답 대기 시간 초과']],
 note:'504라도 상위 서버가 업무를 이미 처리했을 수 있습니다. 재시도 시 멱등성과 중복 효과를 함께 확인합니다.'
},
} as const satisfies Record<string, AreaDiagram>
