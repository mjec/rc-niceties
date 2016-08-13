# rc-niceties

An application to manage niceties delivered by [recursers](https://recurse.com) at the end of their batch.

## Application architecture

This application is pretty simple. It stores niceties as text and some metadata associated with a unique (author, recipient, batch) tuple. This is stored in a Postgres database. Faculty can view and edit all the niceties. Recursers can see all the nice things said about them, and all the things they have said in the past.

The backend is in Flask, and is just a REST API. The frontend is in react + redux, because it's 2016 and that's the current hotness.

## Creating a development environment

I built this using Python 3.5.2, node.js 3.10.5 and Postgres 9.5.3.

1. Clone the repository into an appropriate location.

2. Set up your Python virtual environment by running `pyvenv venv` in that directory and running `source venv/bin/activate` to active it.

3. Install Python requirements with `pip install -r requirements.txt`.

4. Install the frontend requirements with `npm install`.

5. Set the following environment variables, noting that the application **will not run** if any of these is not set:

    * `FLASK_SECRET_KEY_B64` - a base64-encoded random secret String
    * `DATABASE_URL` - the database connection URL
    * `RC_OAUTH_ID` - your Recurse Center OAuth application ID
    * `RC_OAUTH_SECRET` - your Recurse Center OAuth application secret

6. Run `python`, and inside it run `from backend import db` then `db.create_all()`.

To run:

1. Compile the frontend static files by running `npm run build`.

2. Run the Flask application with `gunicorn backend:app --log-file -`.

## Deploying

This is designed to be deployed to Heroku. To do this:

1. Enable the Python and node.js buildpacks for the application.

2. Set up a Postgres database for the application and run `heroku pg:push [database-name] DATABASE_URL` to copy your local database to Heroku.
