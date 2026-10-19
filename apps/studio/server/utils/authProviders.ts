export function authProviders(publicOrigin?: string) {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    yandexEnabled: !!(
      publicOrigin &&
      process.env.YANDEX_CLIENT_ID &&
      process.env.YANDEX_CLIENT_SECRET
    ),
    oidcEnabled: !!(
      publicOrigin &&
      process.env.OIDC_ISSUER &&
      process.env.OIDC_CLIENT_ID &&
      process.env.OIDC_CLIENT_SECRET
    ),
    oidcLabel: process.env.OIDC_DISPLAY_NAME || 'SSO',
  }
}
