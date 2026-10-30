import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'

type MarkdownImageProps = ImgHTMLAttributes<HTMLImageElement>

/** 확대 이미지는 브라우저 기본 modal dialog로 열어 ESC·포커스·배경 스크롤을 관리한다. */
export function MarkdownImage({ alt = '', src, ...props }: MarkdownImageProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open || !mounted) return
    const dialog = dialogRef.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
      triggerRef.current?.focus()
    }
  }, [open])

  // 장식용 이미지나 출처 없는 이미지는 불필요한 대화상자 동작을 만들지 않는다.
  if (!src || !alt) return <img {...props} src={src} alt={alt} loading="lazy" />

  return (
    <>
      <button
        ref={triggerRef}
        className="markdown-image-trigger"
        type="button"
        aria-label={alt + ' 이미지 확대'}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <img {...props} src={src} alt={alt} loading="lazy" decoding="async" />
      </button>
{mounted ? createPortal(
        <dialog
          ref={dialogRef}
          className="markdown-image-dialog"
          aria-label={alt + ' 이미지 확대'}
          onCancel={() => setOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="markdown-image-dialog-content">
            <button className="markdown-image-close" type="button" onClick={() => setOpen(false)} autoFocus>
              닫기
            </button>
            <p className="markdown-image-pan-hint">확대된 그림은 좌우로 스크롤해 세부 내용을 확인할 수 있습니다.</p>
            <div className="markdown-image-dialog-pan" role="region" aria-label={alt + ' 확대 이미지, 가로 스크롤 가능'} tabIndex={0}>
              <img src={src} alt={alt} />
            </div>
            <p>{alt}</p>
          </div>
        </dialog>,
        document.body,
      ) : null}
    </>
  )
}
