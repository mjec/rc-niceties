## notes for beginners

"backend/api.py"
rc is a OAuth object. this accesses the "recurse.com/api/v1/batches" API endpoint.
cache is a

"backend/cache.py"




## startup
before querying database,

comitting a transaction
>>> from backend import db
>>> from backend.models import SiteConfiguration
>>> db.session().transaction.commit()

## databases stuff

\dt
\q
select * from nicety limit 1
alter table nicety add column last_day timestamp;

heroku pg:psql
heroku pg:credentials DATABASE_URL
PGHOST=ec2-50-17-220-39.compute-1.amazonaws.com PGPORT=5432 PGUSER=vvnggttuvxmqtb PGPASSWORD=roKpArVilZnx14RgpBCRqdvZdw PGDATABASE=dc5cm9vlfu2vb4 PGREQUIRESSL=require pg_dump -a -t user




## michael's speeches

Every set of database queries is impicitly wrapped in a database transaction. The normal approach in the database is:

BEGIN TRANSACTION;
UPDATE / INSERT /SELECT / etc

COMMIT;

What had happened before is that one of those query statements had an error (it could have been an update or insert or select). The result is that any further queries within that transaction generate an exception. E.g.:

BEGIN TRANSACTION; // Happens implicitly when the first database connection is opened

SELECT * FROM site_configuration; // OK)

UPDATE invalid_table SET id = 1; // this fails

SELECT * FROM site_configuration // this will then throw an exception, until either a COMMIT; or ROLLBACK is issued
