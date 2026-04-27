import { cn, compactPanelClass, getPillClass } from '../lib/ui'
import type { ValidationIssue } from '../types'

type BlockingIssuePanelProps = {
  issue: ValidationIssue
}

export function BlockingIssuePanel({ issue }: BlockingIssuePanelProps) {
  return (
    <section className={cn(compactPanelClass, 'relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-ozone-warning')}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className={getPillClass('warning')}>Attention</span>
        <strong className="text-technical text-ozone-text">Current Status</strong>
      </div>
      <p className="text-sm text-ozone-text">{issue.message}</p>
      <p className="mt-2 text-[0.7rem] text-technical text-ozone-text-muted">
        {issue.canRecover
          ? 'You can fix the file or try again.'
          : 'Processing cannot continue with this file in this version.'}
      </p>
    </section>
  )
}

