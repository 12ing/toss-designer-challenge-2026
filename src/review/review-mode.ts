export function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

/** Product-only mode — hides all reviewer guidance. */
export function isUserTestMode(params?: URLSearchParams): boolean {
  const search = params ?? getSearchParams()
  return search.get('usertest') === '1'
}

/**
 * Reviewer guidance mode.
 * Explicit `review=1` only — never mixed with usertest.
 */
export function isReviewMode(params?: URLSearchParams): boolean {
  const search = params ?? getSearchParams()
  if (isUserTestMode(search)) return false
  return search.get('review') === '1'
}

/** Development diagnostics — separate from review notes. */
export function isDebugMode(params?: URLSearchParams): boolean {
  const search = params ?? getSearchParams()
  return search.get('debug') === '1'
}

function carryDiagnosticParams(
  params: URLSearchParams,
  source: URLSearchParams = getSearchParams(),
) {
  if (source.get('debug') === '1') params.set('debug', '1')
  if (source.get('fixture')) params.set('fixture', source.get('fixture')!)
  if (source.get('scenario')) params.set('scenario', source.get('scenario')!)
}

export function withReviewQuery(path: string): string {
  const [base, existing = ''] = path.split('?')
  const params = new URLSearchParams(existing)
  params.delete('usertest')
  params.set('review', '1')
  carryDiagnosticParams(params)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function withUserTestQuery(path: string): string {
  const [base, existing = ''] = path.split('?')
  const params = new URLSearchParams(existing)
  params.delete('review')
  params.set('usertest', '1')
  carryDiagnosticParams(params)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function preserveModeQuery(path: string): string {
  const search = getSearchParams()
  const [base, existing = ''] = path.split('?')
  const params = new URLSearchParams(existing)
  if (search.get('review') === '1') params.set('review', '1')
  if (search.get('usertest') === '1') params.set('usertest', '1')
  carryDiagnosticParams(params, search)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
