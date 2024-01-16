const { warmStrategyCache } = require('workbox-recipes');
const { CacheFirst, StaleWhileRevalidate } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');


precacheAndRoute(self.__WB_MANIFEST);

// works, and is way shorter than useing the sw api as the code below shows
precacheAndRoute([
  {
    url: '/assets/icons/icon_96x96.png', revision: null
  }
])

// Set up page cache
const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Set up asset cache
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// // Assets to precache IMMEDIATELY. Using sw api directly. Do not wait for page reload(runtime cacheing):
// const precachedAssets = [
//   'assets/icons/icon_96x96.png',
// ];

// self.addEventListener('install', (event) => {
//   // Precache assets on install
//   event.waitUntil(caches.open('asset-cache').then((cache) => {
//     return cache.addAll(precachedAssets);
//   }));
// });

// self.addEventListener('fetch', (event) => {
//   // Is this one of our precached assets?
//   const url = new URL(event.request.url);
//   const isPrecachedRequest = precachedAssets.includes(url.pathname);

//   if (isPrecachedRequest) {
//     // Grab the precached asset from the cache
//     event.respondWith(caches.open("asset-cache").then((cache) => {
//       return cache.match(event.request.url);
//     }));
//   } else {
//     // Go to the network
//     return;
//   }
// });

// works fine but again, only after page reload:
// registerRoute(
//   ({url}) => url.pathname.startsWith('/assets'),
//   new StaleWhileRevalidate({
//     cacheName: 'image-cache',
//     plugins: [
//       new CacheableResponsePlugin({
//         statuses: [0, 200],
//       }),
//     ],
//   })
// );