type IconProps = { className?: string }

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.54-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.2 3.57c-2.5 0-4.2 1.5-4.2 4.3v2.03H7.3v3.1h2.7V21h3.5Z" />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 3.5h3.6l4 5.5 4.5-5.5H19l-6.4 7.7L19.5 20.5h-3.6l-4.3-5.9-4.9 5.9H3.5l6.8-8.2L4 3.5Z" />
    </svg>
  )
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.5 7.8a2.8 2.8 0 0 0-2-2C17.8 5.3 12 5.3 12 5.3s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2C2 9.5 2 12 2 12s0 2.5.5 4.2a2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.2.5-4.2s0-2.5-.5-4.2ZM10 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  )
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5A9.5 9.5 0 0 0 3.6 17l-1.1 4.5 4.6-1.2A9.5 9.5 0 1 0 12 2.5Zm0 1.8a7.7 7.7 0 0 1 6.4 12l-.2.4.6 2.5-2.6-.7-.4.2A7.7 7.7 0 1 1 12 4.3Zm-2.9 3.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.6 1.1 2.8c.2.2 2 3 4.7 4.2 2.2 1 2.7.8 3.2.8.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-2-1c-.3-.1-.5-.1-.6.1l-.6.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.5-2.2-1.5-.8-.8-1.4-1.7-1.5-2-.1-.3 0-.4.2-.6l.5-.5c.1-.2.2-.3.1-.5l-.9-2.2c-.1-.3-.3-.3-.5-.3h-.4Z" />
    </svg>
  )
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.5 3.5 2.7 11c-1 .4-1 1.5.1 1.8l4.6 1.4 1.8 5.6c.2.7 1.1.9 1.6.3l2.5-2.7 4.7 3.5c.7.5 1.7.1 1.9-.7l2.9-14.2c.2-1-.7-1.7-1.3-1.5ZM8.7 13.6l9-5.6c.3-.2.6.2.3.4l-7.3 6.6-.3 3.1-1.4-3.5Z" />
    </svg>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.5 14.5 14.5 9.5M8 17l-1.5 1.5a3.5 3.5 0 0 1-5-5L3 12M16 7l1.5-1.5a3.5 3.5 0 0 1 5 5L21 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.7 2.3h2.6c.2 1.3.9 2.5 2 3.3 1 .8 2.2 1.2 3.5 1.2v2.7c-1.6 0-3.1-.5-4.4-1.4v6.7c0 3.4-2.7 6.1-6.1 6.1S6.2 18.3 6.2 14.9c0-3.3 2.6-6 5.9-6.1v2.8c-1.8.1-3.2 1.6-3.2 3.3 0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4V2.3Z" />
    </svg>
  )
}
