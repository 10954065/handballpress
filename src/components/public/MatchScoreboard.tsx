import { formatDate } from '@/lib/format'

interface MatchScoreboardProps {
  competition: string | null
  teamAName: string
  teamAScore: number | null
  teamBName: string
  teamBScore: number | null
  venue: string | null
  matchDate: Date | null
}

function TeamRow({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-serif text-lg font-semibold">{name}</span>
      <span className="font-serif text-2xl font-bold tabular-nums">{score ?? '–'}</span>
    </div>
  )
}

export function MatchScoreboard({
  competition,
  teamAName,
  teamAScore,
  teamBName,
  teamBScore,
  venue,
  matchDate,
}: MatchScoreboardProps) {
  return (
    <div className="bg-paper-raised border-line my-8 rounded-sm border">
      <div className="bg-ink flex items-center justify-between rounded-t-sm px-4 py-2 text-white">
        <span className="text-xs font-bold tracking-[0.12em] uppercase">
          {competition ?? 'Match Report'}
        </span>
        {matchDate && <span className="text-xs text-white/70">{formatDate(matchDate)}</span>}
      </div>
      <div className="divide-line divide-y px-4">
        <TeamRow name={teamAName} score={teamAScore} />
        <TeamRow name={teamBName} score={teamBScore} />
      </div>
      {venue && (
        <p className="border-line text-muted border-t px-4 py-2 text-xs">Venue: {venue}</p>
      )}
    </div>
  )
}
