import { useId } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import type { AreaDiagram } from '../../lib/network-area-types'
import { networkAreaSpecs } from '../../lib/network-area-model'
import './network-area-editorial.css'

function displayLength(value: string): number {
  return Array.from(value).reduce((n, c) => n + (c.charCodeAt(0) > 255 ? 1.75 : 1), 0)
}

/** Break authored labels at word boundaries; do not delegate wrapping to foreignObject. */
function wrap(value: string, limit: number): string[] {
  const words = value.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? line + ' ' + word : word
    if (displayLength(next) > limit && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function Copy({ value, x, y, color = 'text', size = 'body', anchor = 'middle', limit = 38 }: {
  value: string; x: number; y: number; color?: 'text'|'muted'|'label';
  size?: 'body'|'small'|'heading'; anchor?: 'middle'|'start'|'end'; limit?: number
}) {
  return <text className={'network-area__' + color + ' network-area__' + size}
    x={x} y={y} textAnchor={anchor}>{wrap(value, limit).map((line, i) =>
    <tspan key={i} x={x} dy={i===0 ? 0 : size==='small' ? 17 : 21}>{line}</tspan>)}</text>
}
function TextBox({ x, y, width, height, head, detail, selected=false }: {
  x:number;y:number;width:number;height:number;head:string;detail?:string;selected?:boolean
}) {
  return <g className="network-area__box">
    <rect className={selected ? 'network-area__rect network-area__rect--selected' : 'network-area__rect'}
      x={x} y={y} width={width} height={height} />
    <Copy value={head} x={x+width/2} y={y+23} color="text" size="body" limit={Math.floor(width/13)} />
    {detail && <Copy value={detail} x={x+width/2}
      y={y+(height>=110 && wrap(head,Math.floor(width/13)).length>1 ? 70 : 45)}
      color="muted" size="small" limit={Math.floor(width/12)} />}
  </g>
}

function draw(spec: AreaDiagram, marker: string) {
  switch (spec.layout) {
    case 'stack': {
      const height = 65 + spec.layers.length * 92
      return { height, content: <g>
        <Copy value="상위 의미와 하위 전달 경계" x={450} y={29} color="label" size="small" />
        {spec.layers.map((layer,i) => <g key={i}>
          <TextBox x={125} y={45+i*92} width={650} height={65} head={layer.head} detail={layer.detail} selected={i===0} />
          {i<spec.layers.length-1 && <path className="network-area__arrow" markerEnd={'url(#'+marker+')'}
            d={'M450 '+(110+i*92)+' V'+(133+i*92)} />}
        </g>)}
      </g> }
    }
    case 'path': {
      const height = 40+spec.steps.length*94
      return { height, content:<g>
        {spec.steps.map((step,i)=><g key={i}>
          <TextBox x={123} y={30+i*94} width={654} height={70} head={String(i+1)+'. '+step.head}
            detail={step.detail} selected={i===0 || i===spec.steps.length-1} />
          {i<spec.steps.length-1 && <path className="network-area__arrow"
            markerEnd={'url(#'+marker+')'} d={'M450 '+(100+i*94)+' V'+(122+i*94)}/>}
        </g>)}
      </g> }
    }
    case 'compare': {
      const height=308
      return { height, content:<g>
        <TextBox x={20} y={20} width={417} height={56} head={spec.left.heading} selected/>
        <TextBox x={463} y={20} width={417} height={56} head={spec.right.heading} />
        <line x1={450} x2={450} y1={21} y2={281} className="network-area__separator" />
        {[spec.left,spec.right].map((side,sideNo)=><g key={sideNo}>
          {side.lines.map((line,i)=><g key={i}>
            <circle cx={sideNo===0?43:486} cy={112+i*60} r={3} className="network-area__dot"/>
            <Copy value={line} x={sideNo===0?60:503} y={117+i*60}
              color="text" size="small" anchor="start" limit={42}/>
          </g>)}
        </g>)}
      </g>}
    }
    case 'branch': {
      const width=spec.arms.length===3?264:392
      const gap=spec.arms.length===3?28:38
      const start=(900-(width*spec.arms.length+gap*(spec.arms.length-1)))/2
      return { height:326, content:<g>
        <TextBox x={95} y={16} width={710} height={64} head={spec.question} selected />
        {spec.arms.map((step,i)=>{
          const x=start+i*(width+gap),cx=x+width/2
          return <g key={i}>
            <path d={'M450 80 V113 H'+cx+' V146'} className="network-area__arrow"
              markerEnd={'url(#'+marker+')'} />
            <TextBox x={x} y={153} width={width} height={132} head={step.head} detail={step.detail}/>
          </g>
        })}
      </g>}
    }
    case 'matrix': {
      const height=110+spec.rows.length*66
      const starts=[24,295,585],widths=[271,290,291]
      return {height,content:<g>
        {starts.map((x,i)=><g key={i}>
          <rect className="network-area__header" x={x} y={18} width={widths[i]} height={57}/>
          <Copy value={spec.columns[i]} x={x+widths[i]/2} y={51} color="text" size="body" limit={26}/>
        </g>)}
        {spec.rows.map((row,r)=><g key={r}>
          {row.map((cell,c)=><g key={c}>
            <rect className={r===spec.focusRow?'network-area__cell network-area__cell--selected':'network-area__cell'}
              x={starts[c]} y={75+r*66} width={widths[c]} height={66} />
            <Copy value={cell} x={starts[c]+widths[c]/2} y={110+r*66} color="text" size="small" limit={33} />
          </g>)}
        </g>)}
      </g>}
    }
    case 'sequence': {
      const height=145+spec.messages.length*108
      return {height, content:<g>
        <Copy value={spec.parties[0]} x={152} y={37} color="text" size="heading"/>
        <Copy value={spec.parties[1]} x={748} y={37} color="text" size="heading"/>
        <line className="network-area__lifeline" x1={152} x2={152} y1={66} y2={height-22}/>
        <line className="network-area__lifeline" x1={748} x2={748} y1={66} y2={height-22}/>
        {spec.messages.map((msg,i)=>{
          const y=121+i*108,from=msg.from==='left'?165:735,to=msg.from==='left'?735:165
          return <g key={i}>
            <Copy value={msg.text} x={450} y={y-23} color="text" size="body" limit={52}/>
            <line className="network-area__arrow" x1={from} x2={to} y1={y} y2={y}
              markerEnd={'url(#'+marker+')'} />
            <Copy value={msg.detail} x={450} y={y+22} color="muted" size="small" limit={62}/>
          </g>
        })}
      </g>}
    }
  }
}

/** One of 49 authored Network diagrams; renderers are format-specific, not a free-form graph engine. */
export function NetworkAreaVisualization({ data }: {data:VisualizationOf<'network-area'>}) {
  const { title, lead, note }=networkAreaSpecs[data.example]
  const diagram:AreaDiagram=networkAreaSpecs[data.example]
  const marker=useId().replace(/:/g,'')+'-arrow'
  const titleId=useId(),descId=useId()
  const figure=draw(diagram,marker)
  return <section className="network-area" data-network-area={data.example} data-network-layout={diagram.layout}>
    <p className="network-area__lead">{lead}</p>
    <div className="network-area__scroll" role="region" tabIndex={0} aria-label={title+' 시각화, 좁은 화면에서 가로 스크롤 가능'}>
      <svg className="network-area__svg" viewBox={'0 0 900 '+figure.height} role="img"
        aria-labelledby={titleId+' '+descId}>
        <title id={titleId}>{title}</title>
        <desc id={descId}>{lead} {note}</desc>
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="network-area__tip"/>
          </marker>
        </defs>
        {figure.content}
      </svg>
    </div>
    <p className="network-area__note">{note}</p>
  </section>
}
