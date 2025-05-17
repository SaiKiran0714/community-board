import multiprocessing

# Gunicorn configuration
bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
accesslog = "gunicorn_access.log"
errorlog = "gunicorn_error.log"
loglevel = "info" 