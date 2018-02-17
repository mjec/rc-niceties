const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const got = require('got');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const {
  RC_OAUTH_ID,
  RC_OAUTH_SECRET,
  RC_OAUTH_REDIRECT_URI
} = process.env; 

app.post('/auth/authorize', async (req, res, next) => {
  try {
    const { code } = req.body;
    const response = await got('https://www.recurse.com/oauth/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: RC_OAUTH_ID,
        client_secret: RC_OAUTH_SECRET,
        redirect_uri: RC_OAUTH_REDIRECT_URI,
        code
      })
    });
    return res.json(JSON.parse(response.body));
  } catch (e) {
    next(e);
  }
});

app.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const payload = await got('https://www.recurse.com/oauth/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: RC_OAUTH_ID,
        client_secret: RC_OAUTH_SECRET,
        refresh_token
      })
    });
    return res.json(JSON.parse(response.body));
  } catch(e) {
    next(e);
  } 
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(`Error on request ${req.method} ${req.url}`);
  console.error(err.stack);
  return res.status(500).send(err.stack)
});

app.listen(5000, () => console.log('Listening on port 5000'));
