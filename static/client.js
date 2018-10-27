const default_text = `$ mysqldump drupal > drupal.sql
Enter password:
$ cockroach sql --set display_format=records -e "CREATE DATABASE test; USE test; IMPORT MYSQLDUMP ('nodelocal:///drupal.sql');"
-[ RECORD 1 ]
job_id             | 394965594449870849
status             | succeeded
fraction_completed | 1
rows               | 6789
index_entries      | 7453
system_records     | 0
bytes              | 6679075
$ `;

const w = 120;
const h = 16;
function parse(input) {
  const out = new Array(w * h);
  out.fill("");
  var pos = 0;
  for (var i = 0; i < input.length; i++) {
    if (input[i] == "\n") {
      pos = (Math.floor(pos / w) + 1) * w;
    } else {
      out[pos] = input[i];
      pos++;
    }
  }
  return out;
}

window.onload = function() {
  var dataset = parse(default_text);
  var characters = d3
    .select(".terminal__frame")
    .selectAll("div")
    .data(dataset);
  characters
    .enter()
    .append("div")
    .merge(characters)
    .text(function(d) {
      return d;
    });
};
