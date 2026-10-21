export function productSiteEnabled(publicOrigin?: string) {
  const setting = process.env.ARIL_PRODUCT_SITE_ENABLED?.trim().toLowerCase()
  if (setting) return setting === 'true'
  try {
    return ['aril.studio', 'www.aril.studio'].includes(
      new URL(publicOrigin || '').hostname,
    )
  } catch {
    return false
  }
}
