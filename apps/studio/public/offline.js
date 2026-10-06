let language = navigator.language
try { language = localStorage.getItem('pomegranate-language') || language } catch { /* Optional preference. */ }
if (language.startsWith('ru')) {
  document.documentElement.lang = 'ru'
  document.getElementById('title').textContent = 'Нет подключения'
  document.getElementById('description').textContent = 'Подключитесь к интернету, чтобы открыть пространство. Ваши сохранённые планы ждут вас.'
  document.getElementById('retry').textContent = 'Попробовать снова'
}
document.getElementById('retry').addEventListener('click', () => {
  if (location.pathname === '/offline.html') location.replace('/')
  else location.reload()
})
