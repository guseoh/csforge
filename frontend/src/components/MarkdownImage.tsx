import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

type MarkdownImageProps = ImgHTMLAttributes<HTMLImageElement>

/** 확대 이미지는 브라우저 기본 modal dialog로 열어 ESC·포커스·배경 스크롤을 관리한다. */
export function MarkdownImage({ alt = '', src, ...props }: MarkdownImageProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!open) return
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
          <img src={src} alt={alt} />
          <p>{alt}</p>
        </div>
      </dialog>
    </>
  )
}
