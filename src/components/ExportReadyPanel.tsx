import { formatBytes, formatDb, formatFileNameMiddle } from '../lib/formatters'
import { cn, getPillClass, panelClass } from '../lib/ui'
import type { GeneratedAsset } from '../types'

type ExportReadyPanelProps = {
  exportAsset: GeneratedAsset
  gainDb: number
}

export function ExportReadyPanel({ exportAsset, gainDb }: ExportReadyPanelProps) {
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
      value: formatDb(gainDb),
    },
  ]

  return (
    <section className={cn(panelClass, 'relative overflow-hidden border-ozone-safe/30')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={cn(getPillClass('success'), 'glow-cyan')}>
          SUCCESS
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
    </section>
  )
}

