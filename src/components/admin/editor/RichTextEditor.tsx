'use client'

import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { ArticleImageWithView } from './extensions/ArticleImageView'
import { PullQuote } from './extensions/PullQuote'
import { Toolbar } from './Toolbar'
import './editor.css'

interface RichTextEditorProps {
  content?: JSONContent
  onChange: (json: JSONContent) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    // Required with SSR frameworks (Next.js App Router) to avoid a
    // hydration mismatch — TipTap otherwise renders once on the server
    // with different content than the client's first render.
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing the article…' }),
      Youtube.configure({ nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ArticleImageWithView,
      PullQuote,
    ],
    content: content ?? '',
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON()),
    editorProps: {
      attributes: {
        class: 'article-editor-content',
      },
    },
  })

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
