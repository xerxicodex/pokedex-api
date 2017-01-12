'use strict';

const app = require("app/app");
const port = process.env.NODE_PORT || 5000;
const db = require("app/db");

const Promise = require("bluebird");
const _ = require("underscore");

const routers = {
  "/pokemon": require("app/routers/pokemon")
};

_.each(_.keys(routers), function (path) {
  app.use(path, routers[path]);
});

app.use(function (err, req, res, next) {
  console.error(err);
  if ('httpStatusCode' in err) {
    res.status(err.httpStatusCode)
      .send({"error_code": err.httpStatusCode, "error_message": err.httpErrorMessage})
  } else {
    res.status(500)
      .send({"error_code": 500, "error_message": "Internal Server Error"})
  }
});

Promise.resolve()
  .then(function () {
    return db.sqlite.open('./pokedex.sqlite', Promise);
  })
  .then(function () {
    return db.mongo.once('open', Promise);
  })
  .catch(function (err) {
    return console.error(err.stack);
  })
  .finally(function () {
    return app.listen(port, function () {
      console.log('App listening on port ' + port);
    });
  });