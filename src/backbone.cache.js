(function() {

  var root = this;

  var Backbone = root.Backbone;
  Backbone.original_sync = Backbone.sync;

  Backbone.Cache = {};
  Backbone.Cache._cache = {};

  var DEFAULT_LIFETIME = 300000; // ms => 5 minutes

  Backbone.Cache.sync = function(method, model, options) {
    var useSync = function() {
      options.checkCache = false;
      return Backbone.original_sync(method, model, options);
    };

    options.checkCache = (options.checkCache !== false);
    if (!options.checkCache) {
      return useSync();
    } else if (method === 'read') {
      var cached_response = readFromCache(options);
      if (cached_response) {
        setTimeout(function sendResponse() {
          options.success(cached_response);
        }, 1);
        return;
      } else {
        var original_success_callback = options.success;

        options.success = function cacheResponse(response) {
          writeToCache(model, options, response);
          original_success_callback(response);  
        };
      }
    } else if (method === 'update' || method === 'delete') {
      invalidateCache(model, options);
    }

    return useSync();
  };

  Backbone.Cache.clear = function() {
    Backbone.Cache._cache = {};
  };

  function readFromCache(options) {
    var key = options.url,
        record = Backbone.Cache._cache[key];

    if (typeof record !== 'object') { return null; }
    if (record.expires_at < Date.now()) {
      delete Backbone.Cache._cache[key];
      return null;
    }

    trimCache();

    return record.content;
  }

  function writeToCache(model, options, response) {
    var key = options.url,
        record = {};

    record.expires_at = Date.now() + (model.lifetime || DEFAULT_LIFETIME);
    record.content = response;
    Backbone.Cache._cache[key] = record;

    trimCache();
  }

  function invalidateCache(options) {
    var key = options.url;

    delete Backbone.Cache._cache[key];

    trimCache();
  }

  function trimCache() {
    setTimeout(function() {
      for (var key in Backbone.Cache._cache) {
        if (Backbone.Cache._cache[key].expires_at < Date.now()) {
          delete Backbone.Cache._cache[key];
        }
      }
    }, 50);
  }

  Backbone.Cache.Model = Backbone.Model.extend({
    sync: Backbone.Cache.sync,
    lifetime: DEFAULT_LIFETIME
  });

}).call(this);