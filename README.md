# rc-niceties

An application to manage niceties delivered by [recursers](https://recurse.com) at the end of their batch.

## Application architecture

This application is pretty simple. It stores niceties as text and some metadata associated with a unique (author, recipient, batch) tuple. This is stored in a Postgres database. Faculty can view and edit all the niceties. Recursers can see all the nice things said about them, and all the things they have said in the past.

The backend is in Flask, and is just a REST API. The frontend is in react + redux, because it's 2016 and that's the current hotness.

All queries to the RC API is cached, and things

## Creating a development environment

I built this using Python 3.5.2, node.js 3.10.5 and Postgres 9.5.3.

1. Clone the repository into an appropriate location.

2. Set up your Python virtual environment by running `pyvenv venv` in that directory and running `source venv/bin/activate` to active it.

3. Install Python requirements with `pip install -r requirements.txt`.

4. Install the frontend requirements with `npm install`.

5. Set the following environment variables, noting that the application **will not run** if any of these is not set:

    * `FLASK_SECRET_KEY_B64` - a base64-encoded random secret string, for example generaed by running:
        ```python
        from base64 import b64encode
        from os import urandom
        print(b64encode(urandom(24)))
        ```
    * `DATABASE_URL` - the database connection URL `e.g. postgres://localhost/rcniceties`
    * `RC_OAUTH_ID` - your Recurse Center OAuth application ID
    * `RC_OAUTH_SECRET` - your Recurse Center OAuth application secret
    * `DEV` - set to either `TRUE` or `FALSE`, depending on if this is a development or production environment

   A common way of setting up these environment variables is with a `.env` file in your project directory, containing `export ENV_VAR=value` on each line. This can be loaded by running `source .env` and will be automatically loaded by `heroku local`.

6. Optionally mock out the RC API by setting `MOCK_OUT_RC_API = True` in `backend/__init__.py`. This means you do not have to set `RC_OAUTH_ID` or `RC_OAUTH_SECRET`, but you'll only get sample data (contained in the `mock/fixtures` folder, and with request -> filename mapping in `mock/rc.py`). Alternatively, you'll need to [set up an RC application](https://recurse.com/settings/oauth) with a redirect URI pointing to your local server (e.g. `http://localhost:8000/login/authorized`) or with the special value `urn:ietf:wg:oauth:2.0:oob`.

7. Run `python`, and inside it run:

    ```python
    from backend import db, config
    db.create_all()
    config.set_to_default()
    ```

To run:

1. Compile the frontend static files by running `npm run build`.

2. Run the Flask application with `gunicorn backend:app --log-file -`.

## Deploying

This is designed to be deployed to Heroku. To do this:

1. Enable the Python and node.js buildpacks for the application.

2. Set up a Postgres database for the application and run `heroku pg:push [database-name] DATABASE_URL` to copy your local database to Heroku.
