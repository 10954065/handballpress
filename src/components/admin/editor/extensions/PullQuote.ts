import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      setPullQuote: () => ReturnType
    }
  }
}

// A visually distinct pull quote, editorially separate from a regular
// blockquote (which is used for attributed/sourced quotes).
export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  content: 'inline*',
  marks: 'bold italic',

  parseHTML() {
    return [{ tag: 'aside[data-type="pull-quote"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-type': 'pull-quote' }), 0]
  },

  addCommands() {
    return {
      setPullQuote:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
    }
  },
})
