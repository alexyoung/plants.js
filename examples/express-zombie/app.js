var express = require('express'),
    app = express.createServer();

module.exports.app = app;
app.set('view engine', 'jade');
app.use(express.bodyDecoder());
app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/login', function(req, res) {
  if (req.body.username === 'alex'
      && req.body.password === 'test') {
    res.render('logged-in');
  } else {
    res.redirect('/');
  }
});

app.get('/login', function(req, res) {
  res.render('login');
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express server listening on port %d, environment: %s', app.address().port, app.settings.env)
}
