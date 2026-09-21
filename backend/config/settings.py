import os
import sys
import urllib.parse as urlparse
from pathlib import Path
from datetime import timedelta
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

try:
    import dotenv
    # Load environment variables from .env file if available (environment variables take precedence)
    dotenv.load_dotenv(BASE_DIR / '.env', override=False)
except ImportError:
    pass

SECRET_KEY = os.getenv('SECRET_KEY', 'vega-dev-secret-key-super-secure-change-in-prod-2026')
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')

ALLOWED_HOSTS_ENV = os.getenv('ALLOWED_HOSTS', '')
if ALLOWED_HOSTS_ENV:
    ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS_ENV.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = ['*'] if DEBUG else ['.vercel.app', 'localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    
    # Local Apps
    'apps.accounts',
    'apps.profiles',
    'apps.services',
    'apps.locations',
    'apps.bookings',
    'apps.reviews',
    'apps.notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Configuration
# Supports managed PostgreSQL (Neon / Supabase / AWS / Render / Vercel Postgres)
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL') or os.getenv('POSTGRES_PRISMA_URL')
DB_HOST = os.getenv('DB_HOST', '').strip()
IS_REMOTE_DB = bool(DATABASE_URL or (DB_HOST and DB_HOST not in ('localhost', '127.0.0.1', '')))
IS_PRODUCTION = (not DEBUG) or (os.getenv('VERCEL') == '1') or (os.getenv('ENVIRONMENT') == 'production')

if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
elif DATABASE_URL:
    url = urlparse.urlparse(DATABASE_URL)
    db_name = url.path[1:] if url.path else 'vega_db'
    db_user = urlparse.unquote(url.username) if url.username else 'postgres'
    db_password = urlparse.unquote(url.password) if url.password else ''
    db_host = url.hostname or 'localhost'
    db_port = str(url.port or 5432)
    is_remote = 'localhost' not in db_host and '127.0.0.1' not in db_host

    # Parse query parameters (e.g. ?sslmode=require&channel_binding=require)
    query_params = dict(urlparse.parse_qsl(url.query))
    sslmode = os.getenv('DB_SSLMODE', query_params.get('sslmode', 'require' if is_remote else 'prefer'))

    db_options = {}
    if is_remote:
        db_options['sslmode'] = sslmode
    if 'channel_binding' in query_params:
        db_options['channel_binding'] = query_params['channel_binding']

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_name,
            'USER': db_user,
            'PASSWORD': db_password,
            'HOST': db_host,
            'PORT': db_port,
            'OPTIONS': db_options,
        }
    }
elif DB_HOST:
    is_remote = DB_HOST not in ('localhost', '127.0.0.1')
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.getenv('DB_NAME', 'vega_db'),
            'USER': os.getenv('DB_USER', 'vega_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'vega_password'),
            'HOST': DB_HOST,
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': os.getenv('DB_SSLMODE', 'require' if is_remote else 'prefer'),
            } if is_remote else {},
        }
    }
elif IS_PRODUCTION:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured(
        "VEGA Production Configuration Error: Managed PostgreSQL is required in production. "
        "Please provide DATABASE_URL (e.g. from Neon, Supabase, or Vercel Marketplace Postgres) "
        "or DB_HOST, DB_NAME, DB_USER, DB_PASSWORD. "
        "SQLite and localhost PostgreSQL are strictly disallowed in production."
    )
else:
    # Local Development only: local SQLite database file
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Simple JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', SECRET_KEY)
JWT_ACCESS_EXPIRATION_HOURS = int(os.getenv('JWT_ACCESS_EXPIRATION_HOURS', '24'))
JWT_REFRESH_EXPIRATION_DAYS = int(os.getenv('JWT_REFRESH_EXPIRATION_DAYS', '7'))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=JWT_ACCESS_EXPIRATION_HOURS),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=JWT_REFRESH_EXPIRATION_DAYS),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': JWT_SECRET,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = DEBUG and (os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1'))
CORS_ALLOW_CREDENTIALS = True

cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [orig.strip() for orig in cors_origins_env.split(',') if orig.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://frontend-ashu-36ce.vercel.app",
    ]

# Support Vercel deployment preview domains
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

# Security Headers & Cookies in Production
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() in ('true', '1')
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    CSRF_TRUSTED_ORIGINS = [
        orig for orig in CORS_ALLOWED_ORIGINS if orig.startswith('http')
    ] + [
        'https://*.vercel.app'
    ]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static & Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '').strip()
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '').strip()
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'VEGA <noreply@vega.app>')

if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
else:
    EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')


