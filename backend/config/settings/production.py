import os

from .base import *


DEBUG = config('DEBUG', default=False, cast=bool)

INTERNAL_IPS = [
    '127.0.0.1',
]


STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
# STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
