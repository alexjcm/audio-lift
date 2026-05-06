export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const panelClass =
  'ozone-panel p-5 max-[720px]:p-3 transition-all duration-300'

export const compactPanelClass = cn(panelClass, 'py-3 max-[720px]:py-2')

const pillBaseClass =
  'inline-flex items-center justify-center rounded-[2px] border border-white/5 px-2.5 py-1.5 font-mono text-[0.65rem] font-bold uppercase leading-none tracking-[0.1em] transition-all duration-200'

export function getPillClass(tone: string) {
  const base = pillBaseClass
  switch (tone) {
    case 'neutral':
      return cn(base, 'bg-white/5 text-[var(--text-muted)]')
    case 'low':
    case 'medium':
      return cn(base, 'bg-amber-400/10 text-amber-400 border-amber-400/20')
    case 'success':
    case 'adequate':
      return cn(base, 'bg-ozone-accent/10 text-ozone-accent border-ozone-accent/20 glow-cyan')
    case 'high':
    case 'warning':
    case 'critical':
      return cn(base, 'bg-ozone-warning/10 text-ozone-warning border-ozone-warning/20')
    default:
      return base
  }
}
