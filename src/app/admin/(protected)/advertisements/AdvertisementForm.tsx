'use client'

import { useActionState, useRef } from 'react'
import {
  createAdvertisement,
  updateAdvertisement,
  type AdvertisementActionState,
} from '@/lib/advertisements/actions'
import { AdPlacement } from '@/generated/prisma/enums'

interface AdvertisementFormProps {
  advertisement?: {
    id: string
    name: string
    placement: AdPlacement
    imageUrl: string | null
    linkUrl: string | null
    embedHtml: string | null
    startDate: Date
    endDate: Date
    isActive: boolean
  }
  onDone?: () => void
}

const initialState: AdvertisementActionState = {}

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AdvertisementForm({ advertisement, onDone }: AdvertisementFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = advertisement ? updateAdvertisement : createAdvertisement
  const [state, formAction, isPending] = useActionState(
    async (prevState: AdvertisementActionState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) {
        formRef.current?.reset()
        onDone?.()
      }
      return result
    },
    initialState
  )

  const idSuffix = advertisement?.id ?? 'new'
  const inputClass =
    'border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-1.5 text-sm outline-none focus-visible:ring-2'

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {advertisement && <input type="hidden" name="id" value={advertisement.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-ink text-sm font-semibold" htmlFor={`name-${idSuffix}`}>
            Name
          </label>
          <input
            id={`name-${idSuffix}`}
            name="name"
            defaultValue={advertisement?.name}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-ink text-sm font-semibold" htmlFor={`placement-${idSuffix}`}>
            Placement
          </label>
          <select
            id={`placement-${idSuffix}`}
            name="placement"
            defaultValue={advertisement?.placement ?? AdPlacement.HEADER}
            className={inputClass}
          >
            {Object.values(AdPlacement).map((placement) => (
              <option key={placement} value={placement}>
                {placement.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-ink text-sm font-semibold" htmlFor={`imageUrl-${idSuffix}`}>
          Image URL
        </label>
        <input
          id={`imageUrl-${idSuffix}`}
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={advertisement?.imageUrl ?? ''}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-ink text-sm font-semibold" htmlFor={`linkUrl-${idSuffix}`}>
          Link URL (where a click goes)
        </label>
        <input
          id={`linkUrl-${idSuffix}`}
          name="linkUrl"
          type="url"
          placeholder="https://…"
          defaultValue={advertisement?.linkUrl ?? ''}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-ink text-sm font-semibold" htmlFor={`embedHtml-${idSuffix}`}>
          Embed HTML (advanced — admin-only, renders as raw HTML)
        </label>
        <textarea
          id={`embedHtml-${idSuffix}`}
          name="embedHtml"
          rows={3}
          placeholder="<script>…</script> — leave blank for a plain image/link ad"
          defaultValue={advertisement?.embedHtml ?? ''}
          className={`${inputClass} font-mono`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-ink text-sm font-semibold" htmlFor={`startDate-${idSuffix}`}>
            Start
          </label>
          <input
            id={`startDate-${idSuffix}`}
            name="startDate"
            type="datetime-local"
            required
            defaultValue={advertisement ? toDateTimeLocal(advertisement.startDate) : undefined}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-ink text-sm font-semibold" htmlFor={`endDate-${idSuffix}`}>
            End
          </label>
          <input
            id={`endDate-${idSuffix}`}
            name="endDate"
            type="datetime-local"
            required
            defaultValue={advertisement ? toDateTimeLocal(advertisement.endDate) : undefined}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={advertisement?.isActive ?? true}
          className="accent-blue size-4"
        />
        Active
      </label>

      {state.error && <p className="text-error text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-navy hover:bg-blue-dark w-fit rounded-sm px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saving…' : advertisement ? 'Save' : 'Add advertisement'}
      </button>
    </form>
  )
}
