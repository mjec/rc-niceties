import os
from flask import send_file, abort
from backend import app
from backend.auth import needs_authorization


@app.route('/')
def home():
    return send_file(os.path.realpath(os.path.join(app.static_folder, 'index.html')))

@app.route('/<path:p>')
def serve_static_files(p, index_on_error=True):
    """Securely serve static files for the given path using send_file."""

    # Determine the canonical path of the file
    full_path = os.path.realpath(os.path.join(app.static_folder, p))

    # We have a problem if either:
    #   - the path is not a sub-path of app.static_folder; or
    #   - the path does not refer to a real file.
    if (os.path.commonprefix([app.static_folder, full_path]) != app.static_folder or
            not os.path.isfile(full_path)):
        file_to_return = app.config.get('STATIC_FILE_ON_404', None)
        if file_to_return is not None:
            full_path = os.path.realpath(os.path.join(app.static_folder, file_to_return))
        else:
            return abort(404)
    return send_file(full_path)
