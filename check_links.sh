#!/bin/bash

# Define the local and CDN paths
local_bootstrap_css="/deps/bootstrap.min.css"
cdn_bootstrap_css="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"

local_fontawesome_css="/deps/all.min.css"
cdn_fontawesome_css="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css"

local_bootstrap_js="/deps/bootstrap.min.js"
cdn_bootstrap_js="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"

local_popper_js="/deps/popper.min.js"
cdn_popper_js="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"

local_fontawesome_js="/deps/all.min.js"
cdn_fontawesome_js="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/js/all.min.js"

# Find all HTML files
files=$(git diff --name-only --diff-filter=ACM | grep ".html$")
for file in $files; do
    if [ -f "$file" ]; then
        echo "Replacing links with cdn valid links for $file"
        # Check and update the links if necessary
        sed -i.bak "s|$local_bootstrap_css|$cdn_bootstrap_css|g" "$file"
        sed -i.bak "s|$local_fontawesome_css|$cdn_fontawesome_css|g" "$file"
        sed -i.bak "s|$local_bootstrap_js|$cdn_bootstrap_js|g" "$file"
        sed -i.bak "s|$local_popper_js|$cdn_popper_js|g" "$file"
        sed -i.bak "s|$local_fontawesome_js|$cdn_fontawesome_js|g" "$file"

        # Stage the updated file
        git add "$file"
    fi
done

# Exit with success
exit 0
