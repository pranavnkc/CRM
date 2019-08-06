import os

from .base import *


DEBUG = config('DEBUG', default=False, cast=bool)

INTERNAL_IPS = [
    '127.0.0.1',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'defaultdb',
        'USER': 'doadmin',
        'PASSWORD': 'x26fsuuis53jgb4o',
        'HOST': 'db-postgresql-blr1-41581-do-user-5955133-0.db.ondigitalocean.com',
        'PORT': '25060',
        'OPTIONS': {'sslmode': 'require'},
    }
}

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
# STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
