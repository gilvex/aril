export function productSiteEnabled() {
  return process.env.ARIL_PRODUCT_SITE_ENABLED?.trim().toLowerCase() !== 'false'
}
