#!/bin/bash
set -euo pipefail
export NODE_ENV=production

# App Service provides $PORT; Next's standalone server.js reads it.
cd /home/site/wwwroot
echo "Starting Next.js on port ${PORT:-3000}"
node server.js
