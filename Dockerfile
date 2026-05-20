# Python-only build for Railway, with Docker layer caching so the
# pip install step is reused on every deploy where requirements.txt
# hasn't changed. That cuts ~5 min off most deploys vs the previous
# nixpacks setup, which reinstalled every dep from scratch each time.
#
# Activated by railway.toml at repo root (builder = "DOCKERFILE").
# nixpacks.toml is kept as fallback documentation but ignored when the
# Dockerfile builder is selected.
#
# IMPORTANT: this Dockerfile intentionally does NOT run `npm run build`.
# frontend/dist is committed and served as static files by FastAPI's
# HashedStaticFiles. The "move frontend build to Railway" experiments
# (commits 291d3b45f and 770083fea) BOTH failed in production; see
# the build pipeline failure memory. Do not add npm here without
# reading the Build Logs from 770083fea first.

FROM python:3.13-slim

# System libraries:
# - tesseract-ocr  → required by pytesseract (thumbnail OCR)
# - libgomp1       → required by opencv-python-headless at runtime
# Matches the nixPkgs = ["tesseract"] line from nixpacks.toml plus the
# OpenMP runtime that opencv needs on Debian slim.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements FIRST so this RUN becomes a cached layer that only
# re-runs when requirements.txt changes. This is the entire point of
# moving off nixpacks: subsequent deploys reuse the pip install layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the application code (and the committed frontend/dist).
# Anything outside the layers above changing here only invalidates
# THIS layer; pip install above stays cached.
COPY . .

# Railway injects $PORT at runtime; sh -c lets the shell expand it.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
