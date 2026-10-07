// Apply the saved appearance before the app or its styles load.
try {
  var savedAppearance = localStorage.getItem('pomegranate-appearance')
  var darkAppearance =
    savedAppearance === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
      : savedAppearance !== 'light'
  document.documentElement.dataset.theme = darkAppearance ? 'dark' : 'light'
  document.documentElement.style.colorScheme = darkAppearance ? 'dark' : 'light'
} catch {
  document.documentElement.dataset.theme = 'dark'
  document.documentElement.style.colorScheme = 'dark'
}
