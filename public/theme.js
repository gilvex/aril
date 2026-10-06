// Apply the saved appearance before the app or its styles load.
try {
  var savedAppearance = localStorage.getItem('pomegranate-appearance')
  var darkAppearance =
    savedAppearance === 'dark' ||
    (savedAppearance !== 'light' &&
      matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = darkAppearance ? 'dark' : 'light'
  document.documentElement.style.colorScheme = darkAppearance ? 'dark' : 'light'
} catch {
  document.documentElement.dataset.theme = matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
    ? 'dark'
    : 'light'
}
