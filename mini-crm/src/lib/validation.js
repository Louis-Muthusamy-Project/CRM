export function required(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0
}

export function validateEmail(email) {
  const v = String(email || '').trim()
  if (!v) return false
  // Basic email regex for demo
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function validatePhone(phone) {
  const v = String(phone || '').trim()
  if (!v) return true // optional
  // Loose validation: digits, spaces, +, -, (), min length
  return /^[0-9+()\-\s]{7,}$/.test(v)
}

export function validateIsoDate(isoDate) {
  const v = String(isoDate || '').trim()
  if (!v) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}

