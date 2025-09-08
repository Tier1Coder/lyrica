export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function safeErrorMessage(): string {
  return 'Error, please try again.'
}
