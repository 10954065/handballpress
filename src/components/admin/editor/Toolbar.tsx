'use client'

import { useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { uploadEditorImage } from '@/lib/media/actions'

interface ToolbarProps {
  editor: Editor | null
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      data-active={isActive}
      className="hover:bg-ink/[0.06] data-[active=true]:bg-blue-tint data-[active=true]:text-blue-dark rounded-sm px-2 py-1 text-sm disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Toolbar({ editor }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  if (!editor) return null

  async function handleImageFile(file: File) {
    if (!editor) return
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.set('file', file)
      const result = await uploadEditorImage(formData)
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'articleImage',
          attrs: {
            src: result.url,
            alt: result.altText,
            caption: null,
            credit: null,
            align: 'center',
          },
        })
        .run()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Image upload failed.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  function addYoutube() {
    const url = window.prompt('YouTube URL')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }

  function addLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previousUrl ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="border-line flex flex-wrap items-center gap-1 border-b p-2"
    >
      <ToolbarButton
        label="Heading 2"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        label="Bold"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Link" isActive={editor.isActive('link')} onClick={addLink}>
        Link
      </ToolbarButton>
      <ToolbarButton
        label="Bullet list"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Quote
      </ToolbarButton>
      <ToolbarButton
        label="Pull quote"
        isActive={editor.isActive('pullQuote')}
        onClick={() => editor.commands.setPullQuote()}
      >
        Pull quote
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ―
      </ToolbarButton>
      <ToolbarButton
        label="Insert image"
        disabled={isUploadingImage}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploadingImage ? 'Uploading…' : 'Image'}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImageFile(file)
          event.target.value = ''
        }}
      />
      <ToolbarButton label="Insert YouTube video" onClick={addYoutube}>
        YouTube
      </ToolbarButton>
      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        Table
      </ToolbarButton>
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </ToolbarButton>
    </div>
  )
}
