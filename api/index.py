import os
import sys
from pathlib import Path

# Add backend directory to sys.path so Django apps and config can be imported
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent if CURRENT_DIR.name == 'api' else CURRENT_DIR
BACKEND_DIR = PROJECT_ROOT / 'backend'

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

# Vercel serverless function looks for `app` or `handler`
app = get_wsgi_application()
