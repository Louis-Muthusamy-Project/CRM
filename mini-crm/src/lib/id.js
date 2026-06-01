export function createId(prefix = 'id') {
  // Good enough for localStorage-backed demo usage
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

