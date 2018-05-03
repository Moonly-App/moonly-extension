// Cache name
var CACHE = 'moonly';

// Cache all of the files upong install event
addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            return cache.addAll([
                '//fonts.googleapis.com/icon?family=Material+Icons',
                '//fonts.googleapis.com/css?family=Lato:300,400,700,900',
                '../css/bootstrap.min.css',
                '../css/fontawesome/css/font-awesome.css',
                '../css/style.css',
                '../css/cat-colors.css',
                '../js/libs/chrome-promise.js',
                '../js/libs/jquery.min.js',
                '../js/libs/bootstrap.min.js',
                '../js/libs/moment.js',
                '../js/libs/sha256.min.js',
                '../js/libs/sockjs.min.js',
                '../js/config.js',
                '../js/popup/query.js',
                '../js/newtab/jquery.nicescroll.js',
                '../js/newtab/loginTest.js',
                '../js/newtab/script.js'
            ]);
        })
    );
});

// Fetch from cache first, then update the cache from network
addEventListener('fetch', e => {
    e.respondWith(fromCache(e.request));
    e.waitUntil(updateCache(e.request));
})

// Load from cache
let fromCache = req => {
    return caches.open(CACHE).then(cache => {
        return cache.match(req).then(res => {
            return res || Promise.reject('no-match');
        });
    });
};

// Update the cache from network
let updateCache = req => {
    return caches.open(CACHE).then(cache => {
        return fetch(req).then(res => {
            return cache.put(request, res);
        });
    });
};