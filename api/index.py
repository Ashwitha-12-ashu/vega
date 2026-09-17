import os
import sys
import shutil
from pathlib import Path

# Add backend directory to sys.path so Django apps and config can be imported
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent if CURRENT_DIR.name == 'api' else CURRENT_DIR
BACKEND_DIR = PROJECT_ROOT / 'backend'

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure writable /tmp SQLite is seeded if no remote database is configured
if not (os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL') or (os.getenv('DB_HOST') and os.getenv('DB_HOST') not in ('localhost', '127.0.0.1'))):
    tmp_db = Path('/tmp/vega_db.sqlite3')
    seed_db = BACKEND_DIR / 'db_seed.sqlite3'
    if not seed_db.exists():
        seed_db = BACKEND_DIR / 'db.sqlite3'
    if not tmp_db.exists() and seed_db.exists():
        try:
            shutil.copyfile(seed_db, tmp_db)
        except Exception:
            pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

# Vercel serverless function looks for `app` or `handler`
app = get_wsgi_application()
