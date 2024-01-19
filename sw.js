class AppCache {
  static cacheName = "page";

  static async deleteCache(cache) {
    await caches.delete(cache);
  }
  
  static async deleteOldCaches() {
    const cachesToKeep = [AppCache.cacheName];
    const cachesToDelete = (await caches.keys()).filter(cache => !cachesToKeep.includes(cache));
    cachesToDelete.map(AppCache.deleteCache);
  }
}

const addResourcesToCache = async (resources) => {
  const page = await caches.open(AppCache.cacheName);
  await page.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
      "/index.html",
      "/style.css",
      "/main.js",
      "/module.js",
      "/favicon.ico",
      "https://fonts.googleapis.com/css2?family=Agbalumo&family=Merriweather&display=swap"
    ]),
  );
});

async function cacheFirst(request, preloadResponsePromise) {
  const page = await caches.open(AppCache.cacheName);
  const response = await page.match(request);
  if (response) {
    return response;
  }

  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info("using preload response", preloadResponse);
    await page.put(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    const networkResponse = await fetch(request);
    await page.put(request, networkResponse.clone());
    return networkResponse;
  } catch (e) {
    console.error(e);
    return new Response("Network error", {
      status: 408,
      headers: {"Content-Type": "text/plain"}
    });
  }
}

self.addEventListener("activate", e => {
  e.waitUntil(self.registration?.navigationPreload.enable());
  AppCache.deleteOldCaches();
})

self.addEventListener("fetch", e => {
  e.respondWith(cacheFirst(e.request, e.preloadResponse));
}); 