import flask
import wrapt


@wrapt.decorator
def to_json(wrapped, _, args, kwargs):
    return_value = wrapped(*args, **kwargs)
    status = None
    headers = None
    if isinstance(return_value, tuple):
        if len(return_value) == 3:
            return_value, status, headers = return_value
        elif len(return_value) == 2:
            return_value, headers = return_value
    elif return_value is None:
        return_value = {}
    response = flask.jsonify(return_value)
    if status is not None:
        response.status_code = int(status)
    if headers is not None:
        response.headers.extend(headers)
    return response
