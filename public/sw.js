self.addEventListener('push', (event) => {
  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Новое уведомление', body: '' }
  }

  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
