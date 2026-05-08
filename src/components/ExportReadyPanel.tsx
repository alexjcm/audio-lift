import {
  formatBytes,
  formatDb,
  formatFileNameMiddle,
  formatTruePeak,
} from '../lib/formatters'
import { cn, getPillClass, panelClass } from '../lib/ui'
import type { GeneratedAsset } from '../types'

type ExportReadyPanelProps = {
  exportAsset: GeneratedAsset
}

export function ExportReadyPanel({ exportAsset }: ExportReadyPanelProps) {
  const exportItems = [
    {
      label: 'File',
      value: formatFileNameMiddle(exportAsset.name),
    },
    {
      label: 'Size',
      value: formatBytes(exportAsset.sizeBytes),
    },
    {
      label: 'Gain Applied',
      value: formatDb(exportAsset.appliedGainDb),
    },
    {
      label: 'Bass EQ',
      value: formatDb(exportAsset.appliedBassEqDb),
    },
    {
      label: 'Virtual Bass',
      value: formatDb(exportAsset.appliedVirtualBassDb),
    },
    {
      label: 'Rendered True Peak',
      value: exportAsset.outputAnalysis
        ? formatTruePeak(exportAsset.outputAnalysis.truePeakDbtp)
        : '---',
    },
  ]

  return (
    <section className={cn(panelClass, 'relative overflow-hidden border-ozone-safe/30')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={cn(
            getPillClass(exportAsset.warnings.length > 0 ? 'warning' : 'success'),
            exportAsset.warnings.length === 0 && 'glow-cyan',
          )}
        >
          {exportAsset.warnings.length > 0 ? 'WARNING' : 'SUCCESS'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
        {exportItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col"
          >
            <span className="text-[0.5rem] text-technical text-ozone-text-muted">
              {item.label}
            </span>
            <span className="text-[0.75rem] font-mono font-bold text-ozone-text">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {exportAsset.warnings.length > 0 ? (
        <div className="mt-4 rounded-sm border border-ozone-warning/20 bg-ozone-warning/8 p-3">
          <div className="mb-2 text-[0.58rem] font-mono uppercase tracking-[0.08em] text-ozone-warning">
            Rendered master warning
          </div>
          <ul className="grid gap-2">
            {exportAsset.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 text-[0.68rem] leading-snug text-ozone-warning"
              >
                <span className="mt-1.5 h-1 w-1 rounded-full bg-ozone-warning"></span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
