#!/bin/bash
# Serves this folder on http://localhost:8080 and opens it, so the 3D coins and the Ratings pages can load.
cd "$(dirname "$0")"
open "http://localhost:8080/index.html"
python3 -m http.server 8080
