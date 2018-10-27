window.onload = function() {
  const w = 120;
  const h = 16;
  const buffer = {
    width: w,
    height: h,
    chars: new Array(w * h),
    pos: 0
  };
  buffer.chars.fill("");
  render(buffer);
  function getNext() {
    if (demoIO.length == 0) {
      return () => {};
    }
    const instruction = demoIO.shift(0);
    let ret;
    switch (instruction.type) {
      case "out":
        ret = () => writeOutput(buffer, instruction.text, getNext);
        break;
      case "in":
        ret = () => writeInput(buffer, instruction.text, getNext);
        break;
      case "pause":
        ret = () => pause(instruction.length, getNext);
        break;
      case "password":
        ret = () => writePassword(instruction.length, getNext);
        break;
    }
    return ret;
  }
  getNext()();
};

function render(dataset) {
  var characters = d3
    .select(".terminal__frame")
    .selectAll("div")
    .data(dataset.chars);

  characters
    .enter()
    .append("div")
    .merge(characters)
    .text(d => d)
    .classed("terminal__cursor", (d, i) => i == dataset.pos);

  characters.exit().remove();
}

function writeOutput(buffer, text, next) {
  for (var i = 0; i < text.length; i++) {
    let char = text[i];
    if (char == "\n") {
      buffer.pos = (Math.floor(buffer.pos / buffer.width) + 1) * buffer.width;
    } else {
      buffer.chars[buffer.pos] = char;
      buffer.pos++;
    }
  }
  render(buffer);
  setTimeout(next(), 0);
}

function writeInput(buffer, text, next) {
  if (text.length == 0) {
    setTimeout(next(), 0);
    return;
  }
  let soundName = "key";
  const char = text[0];
  if (char == "\n") {
    buffer.pos = (Math.floor(buffer.pos / buffer.width) + 1) * buffer.width;
    soundName = "delete";
  } else {
    buffer.chars[buffer.pos] = char;
    buffer.pos++;
    if (char == " ") {
      soundName = "space";
    }
  }
  playSound(soundName);
  render(buffer);
  setTimeout(() => {
    writeInput(buffer, text.substr(1), next);
  }, 40 + Math.random() * 80);
}

function writePassword(length, next) {
  if (length < 1) {
    setTimeout(next(), 0);
    return;
  }
  playSound("key");
  setTimeout(() => {
    writePassword(length - 1, next);
  }, 40 + Math.random() * 80);
}

function pause(length, next) {
  setTimeout(next(), length);
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

const demoIO = [
  { type: "out", text: "$ " },
  { type: "pause", length: 600 },
  { type: "in", text: "mysqldump drupal > drupal.sql\n" },
  { type: "out", text: "Enter password: " },
  { type: "pause", length: 600 },
  { type: "password", length: 8 },
  { type: "in", text: "\n" },
  { type: "pause", length: 2000 },
  { type: "out", text: "$ " },
  { type: "pause", length: 1000 },
  {
    type: "in",
    text: `cockroach sql --set display_format=records -e "CREATE DATABASE test; USE test; IMPORT MYSQLDUMP ('nodelocal:///drupal.sql');"\n`
  },
  { type: "pause", length: 2400 },
  {
    type: "out",
    text: `-[ RECORD 1 ]
job_id             | 394965594449870849
status             | succeeded
fraction_completed | 1
rows               | 6789
index_entries      | 7453
system_records     | 0
bytes              | 6679075
$ `
  }
];
