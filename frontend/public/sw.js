self.addEventListener('push', function(event) {
  let title = 'Smart Factory Alert';
  let options = {
    body: 'Critical system event detected.',
    icon: '/vite.svg', // Assuming vite.svg or similar icon is present
    badge: '/vite.svg',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      options.data = data.data || {};
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
  
  // Broadcast to all open tabs so the UI can update
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ type: 'PUSH_RECEIVED', payload: { title, ...options } });
      }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if any
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Immediately claim clients
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
