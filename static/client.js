const defaultText = `$ mysqldump drupal > drupal.sql
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

const soundPool = {};
function playSound(identifier) {
  if (!soundPool[identifier]) {
    soundPool[identifier] = [];
  }
  var snd = soundPool[identifier].find(e => e.paused);
  if (snd) {
    snd.play();
  } else {
    const snd = new Audio(`/-/${identifier}.mp3`);
    soundPool[identifier].push(snd);
    snd.play();
  }
}

window.onload = function() {
  var chars = 1;
  const draw = function() {
    update(parse(defaultText.substr(0, chars)));
    if (defaultText[chars - 1] == " ") {
      playSound("space");
    } else if (defaultText[chars - 1] == "\n") {
      playSound("delete");
    } else {
      playSound("key");
    }
    if (chars < defaultText.length) {
      chars++;
      setTimeout(draw, 40 + Math.random() * 80);
    }
  };
  draw();
};

function update(dataset) {
  var characters = d3
    .select(".terminal__frame")
    .selectAll("div")
    .data(dataset);

  characters
    .enter()
    .append("div")
    .merge(characters)
    .text(d => d);

  characters.exit().remove();
}
