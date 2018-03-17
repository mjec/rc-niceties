const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const got = require('got');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const { RC_OAUTH_ID, RC_OAUTH_SECRET, RC_OAUTH_REDIRECT_URI } = process.env;

app.get('/health', (req, res, next) => {
  try {
    return res.json({ okay: true });
  } catch (e) {
    return next(e);
  }
});

app.post('/auth/authorize', (req, res, next) => {
  try {
    const { code } = req.body;
    return got('https://www.recurse.com/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: RC_OAUTH_ID,
        client_secret: RC_OAUTH_SECRET,
        redirect_uri: RC_OAUTH_REDIRECT_URI,
        code
      })
    })
      .then(response => res.json(JSON.parse(response.body)))
      .catch(e => next(e));
  } catch (e) {
    return next(e);
  }
});

app.post('/auth/refresh', (req, res, next) => {
  try {
    const { refresh_token } = req.body; // eslint-disable-line camelcase
    return got('https://www.recurse.com/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: RC_OAUTH_ID,
        client_secret: RC_OAUTH_SECRET,
        refresh_token
      })
    })
      .then(response => res.json(JSON.parse(response.body)))
      .catch(e => next(e));
  } catch (e) {
    return next(e);
  }
});

app.get('/rc/batches', (req, res, next) => {
  try {
    const token = req.get('X-Access-Token');
    return got('https://www.recurse.com/api/v1/batches', {
      authorization: `Bearer ${token}`
    })
      .then(response => res.json(JSON.parse(response.body)))
      .catch(e => next(e));
  } catch (e) {
    return next(e);
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(`Error on request ${req.method} ${req.url}`); // eslint-disable-line no-console
  console.error(err.stack); // eslint-disable-line no-console
  return res.status(500).send(err.stack);
});

app.listen(5000, () => console.log('Listening on port 5000')); // eslint-disable-line no-console

exports.api = functions.https.onRequest(app);
