// Service worker بسيط عشان المتصفح يعتبر الموقع قابل للتثبيت.
// مش بيخزّن أي حاجة، فالبيانات والدخول دايمًا بييجوا من السيرفر مباشرة.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});