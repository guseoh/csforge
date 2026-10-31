import { javaApiScenes } from '../../lib/java-api-models'
import './java-editorial.css'

/** Assembly chooses concrete collaborators; the service only uses the declared interface. */
export function JavaDependencyInjectionEditorial() {
  const scene=javaApiScenes['dependency-injection'][0]
  return <section className="java-ed-boundary" aria-label="객체 조립 책임과 서비스 협력 참조">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-assembly">
      <span className="java-editorial-kicker">조립 코드 · 구현 선택 및 객체 생성</span>
      <code>EmailSender sender = new SmtpEmailSender(config);</code>
      <code>OrderService service = new OrderService(sender);</code>
    </div>
    <div className="java-ed-boundary-collaboration">
      <div><strong>OrderService</strong><span>생성자로 EmailSender 계약 수신</span></div>
      <span aria-hidden="true">→</span>
      <div><strong>EmailSender</strong><span>선택된 SmtpEmailSender 구현으로 위임</span></div>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">구현을 누가 생성하는지와 서비스를 누가 사용하는지는 서로 다른 책임입니다. DI는 Spring 컨테이너 없이 일반 Java 조립 코드에서도 가능합니다.</p>
  </section>
}

/** Contract dispatch does not require a runtime setter or reflection. */
export function JavaStrategyPolicyEditorial() {
  const scene=javaApiScenes.strategy[0]
  return <section className="java-ed-boundary" aria-label="Strategy 계약과 선택된 구현의 호출 관계">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <span className="java-editorial-kicker">계산을 사용하는 쪽</span>
    <div className="java-ed-boundary-collaboration">
      <div><strong>PriceCalculator</strong><span>주입된 정책으로 할인 계산 위임</span></div>
      <span aria-hidden="true">→</span>
      <div><strong>DiscountPolicy</strong><span>공통 discount(price) 계약</span></div>
    </div>
    <div className="java-ed-boundary-implementation">
      <strong>RateDiscountPolicy</strong>
      <span>DiscountPolicy를 구현하는 선택된 전략 · 정률 할인 예시</span>
    </div>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">정책은 생성할 때 선택해도 됩니다. 런타임 setter를 추가해야만 Strategy가 되는 것은 아니며, 구체 정책의 계산식은 계약을 사용하는 객체와 분리됩니다.</p>
  </section>
}

/** The adapter boundary translates units and failure types without stealing domain policy. */
export function JavaAdapterContractEditorial() {
  const scene=javaApiScenes.adapter[0]
  return <section className="java-ed-boundary" aria-label="내부 결제 계약과 외부 Vendor API 사이 Adapter">
    <h4 className="java-ed-scene-title">{scene.title}</h4>
    <div className="java-ed-boundary-steps" role="list">
      <div role="listitem"><strong>내부 서비스</strong><code>PaymentGateway.pay(Money)</code><span>업무 정책은 내부에서 결정</span></div>
      <div role="listitem"><strong>VendorPaymentAdapter</strong><code>Money → cents</code><span>요청·응답 타입과 예외를 변환</span></div>
      <div role="listitem"><strong>외부 Vendor API</strong><code>charge(int cents)</code><span>VendorResponse 또는 VendorDeclinedException</span></div>
    </div>
    <p className="java-ed-boundary-feedback">반환 경로에서는 VendorResponse를 PaymentResult로, 외부 거절 예외를 내부 PaymentDeclinedException으로 변환합니다.</p>
    <p className="java-ed-note">{scene.note}</p>
    <p className="java-editorial-qualification">화면의 순서는 호출 방향입니다. Adapter는 기술 계약을 번역하지만 할인·주문 승인 같은 비즈니스 정책을 결정하는 층이 아닙니다.</p>
  </section>
}
