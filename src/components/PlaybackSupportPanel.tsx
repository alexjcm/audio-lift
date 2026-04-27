import { compactPanelClass, getPillClass } from '../lib/ui'
import type { BrowserPlaybackSupport } from '../types'

type PlaybackSupportPanelProps = {
  playbackSupport: BrowserPlaybackSupport
}

export function PlaybackSupportPanel({
  playbackSupport,
}: PlaybackSupportPanelProps) {
  if (playbackSupport.status !== 'unsupported') {
    return null
  }

  return (
    <section className={compactPanelClass}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className={getPillClass(getPlaybackPillTone(playbackSupport))}>
          Playback
        </span>
        <strong className="text-technical text-ozone-text">{playbackSupport.label}</strong>
      </div>
      <p className="mt-2 text-[0.7rem] text-technical text-ozone-text-muted">
        {playbackSupport.detail}
      </p>
      <p className="mt-2 text-[0.6rem] text-technical text-ozone-text-muted opacity-50">
        Tested MIME: {playbackSupport.mimeType}; canPlayType:{' '}
        {playbackSupport.canPlayType || 'no confirmation'}
      </p>
    </section>
  )
}


function getPlaybackPillTone(support: BrowserPlaybackSupport) {
  if (support.status === 'supported') {
    return 'success'
  }

  if (support.status === 'likely') {
    return 'adequate'
  }

  if (support.status === 'unsupported') {
    return 'warning'
  }

  return 'neutral'
}
