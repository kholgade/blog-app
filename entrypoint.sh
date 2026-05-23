#!/bin/sh

# Generate site if no posts exist
if [ ! -s "site/posts" ] || [ -z "$(ls -A site/posts/*.html 2>/dev/null)" ]; then
  echo "Generating initial site..."
  node dist/generate.js
fi

# Start the server
exec node dist/index.js
