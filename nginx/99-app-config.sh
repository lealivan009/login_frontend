#!/bin/sh
set -e
API_URL="${API_URL:-${VITE_API_URL:-}}"
echo "window.__APP_CONFIG__ = { API_URL: \"${API_URL}\" };" > /usr/share/nginx/html/config.js
