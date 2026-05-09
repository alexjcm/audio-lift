export function isLikelyAppleMobileDevice() {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const isiPhoneLike = /iphone|ipod/.test(userAgent)
  const isiPadLike =
    /ipad/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  return isiPhoneLike || isiPadLike
}

export function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') {
    return false
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}
