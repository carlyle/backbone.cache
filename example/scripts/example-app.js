var Router = Backbone.Router.extend({
  routes: {
    '': 'fetchFetchFetch'
  },

  fetchFetchFetch: function() {
    var tweet_id = '165192103880691712', // using a string since JS is imprecise on large numbers
        self = this;

    console.info('Initial Fetch');
    self.fetchTweet(tweet_id);

    setTimeout(function after15s() {
      console.info('');
      console.info('Fetch after 15s (well within the cache lifetime)');
      self.fetchTweet(tweet_id);
    }, 10000);

    setTimeout(function after30s() {
      console.info('');
      console.info('Fetch after 29s (barely within the cache lifetime)');
      self.fetchTweet(tweet_id);
    }, 30000);

    setTimeout(function after31s() {
      console.info('');
      console.info('Fetch after 31s (just outside the cache lifetime)');
      self.fetchTweet(tweet_id);
    }, 31000);

    setTimeout(function after40s() {
      console.info('');
      console.info('Fetch after 40s (within the cache lifetime, now that it has been updated)');
      self.fetchTweet(tweet_id);
    }, 40000);
  },

  fetchTweet: function(id) {
    var tweet = new Tweet({ id: id }),
        start_time,
        time_elapsed;

    tweet.on('change', function fetched() {
      time_elapsed = Date.now() - start_time;

      console.info('Tweet: ' + tweet.get('text') + '"');
      console.info('Fetched in ' + time_elapsed + ' ms');
    }).fetch();

    start_time = Date.now();
  }
});

var Tweet = Backbone.Model.extend({
  lifetime: 30000,  // 30 seconds

  url: function() {
    return 'https://api.twitter.com/1/statuses/show/' + this.id + '.json?callback=?';
  },

  sync: function(method, model, options) {
    options.type = 'jsonp';

    return Backbone.sync(method, model, options);
  }
});

var ExampleApp = {
  run: function() {
    new Router();

    Backbone.sync = Backbone.Cache.sync;
    Backbone.history.start();
  }
};

ExampleApp.run();