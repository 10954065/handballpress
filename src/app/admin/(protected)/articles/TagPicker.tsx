'use client'

import { useState } from 'react'

interface Tag {
  id: string
  name: string
}

interface TagPickerProps {
  tags: Tag[]
  defaultSelectedIds?: string[]
}

// Native checkboxes named "tagIds" — the server action reads them via
// `formData.getAll('tagIds')`, so this stays a plain form field under the
// hood and needs no client-to-server wiring beyond the search filter itself.
export function TagPicker({ tags, defaultSelectedIds = [] }: TagPickerProps) {
  const [query, setQuery] = useState('')
  const selectedSet = new Set(defaultSelectedIds)

  const filtered = query.trim()
    ? tags.filter((tag) => tag.name.toLowerCase().includes(query.trim().toLowerCase()))
    : tags

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Filter ${tags.length} tags…`}
        className="border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-2 text-sm outline-none focus-visible:ring-2"
      />
      <div className="border-line max-h-64 overflow-y-auto rounded-sm border p-2">
        {filtered.length === 0 ? (
          <p className="text-muted px-1 py-2 text-sm">No tags match &ldquo;{query}&rdquo;.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((tag) => (
              <label
                key={tag.id}
                className="hover:bg-ink/[0.03] flex items-center gap-2 rounded-sm px-1.5 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedSet.has(tag.id)}
                  className="accent-blue"
                />
                {tag.name}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
