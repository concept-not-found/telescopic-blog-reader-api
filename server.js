var express = require('express');
var redis = require('redis');
var PileClient = require('piledb');

var application = express();

var database = new PileClient(redis.createClient(), 'blog');

application.get('/articles', function (request, response) {
  database.getLastReference('articles', function(err, articleKeys) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send('no articles');
      } else {
        return response.status(500).send(err);
      }
    }
    response.set('Content-Type', 'application/json; charset=utf-8');
    return response.status(200).send(articleKeys);
  });
});

application.get('/articles/:id', function (request, response) {
  var id = request.params.id;
  database.getData('articles:' + id, function(err, article) {
    if (err) {
      if (err instanceof PileClient.NotFoundError) {
        return response.status(404).send(id + ' not found');
      } else {
        return response.status(500).send(err);
      }
    }
    response.set('Content-Type', 'application/json; charset=utf-8');
    return response.status(200).send(article);
  });
});

var server = application.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Blog Reader API http://%s:%s', host, port);
});