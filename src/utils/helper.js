export const formatAmount = (number, currency = 'riel') => {
  const value = Number(number) || 0
  const isUSD = currency === 'usd'
  const symbol = isUSD ? '$' : '៛'

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isUSD ? 2 : 0,
    maximumFractionDigits: isUSD ? 2 : 0,
  }).format(value)

  return `${symbol}${formatted}`
}
