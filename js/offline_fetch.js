// TEMPORAL NODE: Offline CORS Fetch Bypass
(function() {
    if (window._fetchPolyfilled) return;
    window._fetchPolyfilled = true;
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            let relativeUrl = url.replace(/^\/?/, '');
            // Some scripts might fetch './data/...'
            relativeUrl = relativeUrl.replace(/^\.\//, '');
            if (window.TENET_OFFLINE_DB && window.TENET_OFFLINE_DB[relativeUrl]) {
                console.log("[TEMPORAL] Intercepted CORS-safe fetch:", relativeUrl);
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(window.TENET_OFFLINE_DB[relativeUrl]),
                    text: () => Promise.resolve(JSON.stringify(window.TENET_OFFLINE_DB[relativeUrl]))
                });
            }
        }
        return originalFetch.apply(this, arguments);
    };
})();
