const CACHE_NAME = 'divider-cache-v1';
const urlsToCache = [
	'/',
	'/index.html',
	'/manifest.json',
	'/service-worker.js',
	'/icon.png'
];

// Install the service worker and cache the necessary files
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			console.log('Opened cache');
			return cache.addAll(urlsToCache);
		})
	);
});

// Fetch files from the network first, then cache, with fallback to cache
self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request)
		.then(function(response) {
			// If we received a valid response, clone it and store it in the cache
			if (!response || response.status !== 200 || response.type !== 'basic') {
				return response;
			}

			const responseToCache = response.clone();

			caches.open(CACHE_NAME)
				.then(function(cache) {
					cache.put(event.request, responseToCache);
				});

			return response;
		})
		.catch(function() {
			// If the network request fails, try to serve the file from the cache
			return caches.match(event.request)
				.then(function(response) {
					if (response) {
						return response;  // return cached file
					}
					// Optional: Return a fallback page or response if the cache is also missing
					return caches.match('/index.html');
				});
		})
	);
});

// Activate the new service worker and delete old caches
self.addEventListener('activate', function(event) {
	const cacheWhitelist = [CACHE_NAME];

	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});