export const SHOW_PROTOTYPE_CONTROLS_DEFAULT = true

/** URL에 ?usertest=1 이면 프로토타입 전용 컨트롤을 숨깁니다. */
export function shouldShowPrototypeControls() {
  if (typeof window === 'undefined') return SHOW_PROTOTYPE_CONTROLS_DEFAULT
  const params = new URLSearchParams(window.location.search)
  if (params.get('usertest') === '1') return false
  if (params.get('prototype') === '0') return false
  if (params.get('prototype') === '1') return true
  return SHOW_PROTOTYPE_CONTROLS_DEFAULT
}
