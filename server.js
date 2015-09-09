var express = require('express');
var redis = require('redis');
var PileClient = require('piledb');

var redisHost = process.env.REDIS_URL || undefined;
var port = process.env.PORT || 5000;

var application = express();

var database = new PileClient(redis.createClient(redisHost), 'blog');

application.get('/blog', function (request, response) {
  database.getLastReference('blog', function(err, blogKey) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send('no articles');
      } else {
        return response.status(500).send(err);
      }
    }
    return response.redirect('/' + blogKey.replace(':', '/'));
  });
});

application.get('/blog/:version', function (request, response) {
  var version = request.params.version;
  database.getData('blog:' + version, function(err, articles) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send(version + ' not found');
      } else {
        return response.status(500).send(err);
      }
    }
    response.set('Content-Type', 'application/json; charset=utf-8');
    return response.status(200).send(articles);
  });
});

application.get('/article/:id', function (request, response) {
  var id = request.params.id;
  database.getLastReference('article:' + id, function(err, articleKey) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send(id + ' not found');
      } else {
        return response.status(500).send(err);
      }
    }
    return response.redirect('/' + articleKey.replace(':', '/'));
  });
});

application.get('/article/:id/:version', function (request, response) {
  var id = request.params.id;
  var version = request.params.version;
  database.getData('article:' + id + ':' + version, function(err, article) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send(id + ':' + version + ' not found');
      } else {
        return response.status(500).send(err);
      }
    }
    response.set('Content-Type', 'application/json; charset=utf-8');
    return response.status(200).send(article);
  });
});

application.listen(port);
