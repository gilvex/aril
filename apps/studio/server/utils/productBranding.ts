export function productBranding() {
  const productName =
    process.env.ARIL_PRODUCT_NAME?.trim().slice(0, 80) || 'Aril'
  const candidate = process.env.ARIL_PRODUCT_LOGO_URL?.trim() || '/aril.svg'
  let productLogoUrl = '/aril.svg'
  try {
    const url = new URL(candidate, 'https://aril.invalid')
    if (
      candidate.length <= 2048 &&
      (candidate.startsWith('/') || /^https?:\/\//.test(candidate)) &&
      !candidate.startsWith('//') &&
      !candidate.includes('\\') &&
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      productLogoUrl = candidate
  } catch {
    /* Invalid logo settings use the built-in logo. */
  }
  return { productName, productLogoUrl }
}
