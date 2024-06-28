export function convertStringToPtr(str: string) {
  return Buffer.from(`${str}\x00`)
}
