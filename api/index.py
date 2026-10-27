import sys
import os

# Add root directory to sys.path so app and models can be imported in Vercel serverless environment
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app
