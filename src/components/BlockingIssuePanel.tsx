import { cn, compactPanelClass, getPillClass } from '../lib/ui'
import type { ValidationIssue } from '../types'

type BlockingIssuePanelProps = {
  issue: ValidationIssue
}

export function BlockingIssuePanel({ issue }: BlockingIssuePanelProps) {
  const helperMessage = getHelperMessage(issue)

  return (
    <section className={cn(compactPanelClass, 'relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-ozone-warning')}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className={getPillClass('warning')}>Attention</span>
        <strong className="text-technical text-ozone-text">Current Status</strong>
      </div>
      <p className="text-sm text-ozone-text">{issue.message}</p>
      {helperMessage ? (
        <p className="mt-2 text-[0.7rem] text-technical text-ozone-text-muted">
          {helperMessage}
        </p>
      ) : null}
    </section>
  )
}

function getHelperMessage(issue: ValidationIssue) {
  switch (issue.code) {
    case 'unsupported-format':
      return 'Select a supported MP4 or MOV file.'
    case 'file-too-large':
      return 'Select a file under the current size limit.'
    case 'video-too-long':
      return 'Use a shorter video or trim it before importing.'
    case 'missing-audio':
      return 'Select a video that contains an audio track.'
    case 'analysis-failed':
      return 'Try importing the file again.'
    case 'export-failed':
      return 'Adjust the settings or try exporting again.'
    case 'unsupported-video-codec':
      return 'Processing cannot continue with this file in this version.'
    default:
      return issue.canRecover ? 'Try another file or import this one again.' : null
  }
}
