#!/bin/bash

local_files=("{{ url_for('static', filename='css/style.css')}}" "{{ url_for('static', filename='js/src/streams.js')}}" "/deps/bootstrap.min.css" "/deps/all.min.css" "/deps/bootstrap.min.js" "/deps/popper.min.js" "<script src=\"{{ url_for('static', filename='js/utils/utility.js')}}\"></script>" "/deps/all.min.js")
remote_files=("css/style.css" "js/src/streams.js" "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" "https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" "<!--nothing-->" "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/js/all.min.js")

pages=("streams" "about" "favorites" "leaderboard")
for page in ${pages[@]}; do
  local_temp="{{ url_for('render_page', page='$page') }}"
  remote_temp="https://studywindow.github.io/pages/$page.html"
  local_files+=("$local_temp")
  remote_files+=("$remote_temp")
done
length_pages="${#local_files[@]}"
echo "length =$length_pages"
files=$(find /storage/emulated/0/.Apps/YtStudy -type f -name "*.html")
for file in $files; do
    if [ -f "$file" ]; then
        echo "Replacing links with cdn valid links for $file"
        # Check and update the links if necessary
        name=$(basename "$file")
        filename="dev/$name"
        echo "$filename"
        cp "$file" "$filename"
        for index in $(seq 0 $((length_pages - 1)));do
          old="${local_files[$index]}"
          new="${remote_files[$index]}"
           if printf "%s.html\n" "${pages[@]}" | grep -q -w "$name";then
             if [ $(( $index <= 1 )) -eq 1 ];then
               new="../$new"
             fi
        fi
          sed -i "s|$old|$new|g" $filename
        done
    fi
done
# Exit with success
exit 0
