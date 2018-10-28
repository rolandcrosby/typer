class Terminal {
  constructor(element, width, height, params) {
    this.element = element;
    this.setSize(width, height);
    params = params || {};
    if (params.chars && params.chars.length == width * height) {
      this.chars = params.chars;
    } else {
      this.chars = new Array(width * height);
      this.chars.fill("");
    }
    this.pos = params.pos || 0;
    this.setColorful(
      params.hasOwnProperty("colorful") ? params.colorful : false
    );
    this.setTitle(params.title || "");
    this.setShowCursor(
      params.hasOwnProperty("showCursor") ? params.showCursor : true
    );
    this.render();
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    d3.select(this.element)
      .select(".terminal__frame")
      .attr(
        "style",
        `grid-template-columns: repeat(${width}, 6.5px);` +
          `grid-template-rows: repeat(${height}, 14px)`
      );
  }

  setTitle(title) {
    this.title = title;
    d3.select(this.element)
      .select(".terminal__title_text")
      .text(title);
  }

  setColorful(colorful) {
    this.colorful = colorful;
    d3.select(this.element).classed("terminal--colorful", colorful);
  }

  setShowCursor(showCursor) {
    this.showCursor = showCursor;
    d3.select(this.element).classed("terminal--show_cursor", showCursor);
  }

  writeText(text) {
    for (var i = 0; i < text.length; i++) {
      let char = text[i];
      let newPos;
      if (char == "\n") {
        newPos = (Math.floor(this.pos / this.width) + 1) * this.width;
      } else {
        newPos = this.pos + 1;
      }
      while (newPos >= this.height * this.width) {
        this.chars.splice(0, this.width);
        this.chars = this.chars.concat(new Array(this.width).fill(""));
        newPos -= this.width;
      }
      if (char !== "\n") {
        this.chars[newPos - 1] = char;
      }
      this.pos = newPos;
    }
    this.render();
  }

  render() {
    const characters = d3
      .select(this.element)
      .select(".terminal__frame")
      .selectAll("div")
      .data(this.chars);

    characters
      .enter()
      .append("div")
      .merge(characters)
      .text(d => d)
      .classed("terminal__cursor", (d, i) => i === this.pos);

    characters.exit().remove();
  }
}

window.onload = function() {
  const terminal = new Terminal(document.querySelector(".terminal"), 64, 16);
  function getNext() {
    if (demoIO.length == 0) {
      return () => {};
    }
    const instruction = demoIO.shift(0);
    let ret;
    switch (instruction.type) {
      case "out":
        ret = () => writeOutput(terminal, instruction.text, getNext);
        break;
      case "in":
        ret = () => writeInput(terminal, instruction.text, getNext);
        break;
      case "title":
        ret = () => setTitle(terminal, instruction.text, getNext);
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

function writeOutput(terminal, text, next) {
  terminal.writeText(text);
  setTimeout(next(), 0);
}

function writeInput(terminal, text, next) {
  if (text.length == 0) {
    setTimeout(next(), 0);
    return;
  }
  let soundName = "key";
  const char = text[0];
  if (char == "\n") {
    soundName = "delete";
  } else {
    if (char == " ") {
      soundName = "space";
    }
  }
  playSound(soundName);
  terminal.writeText(char);
  setTimeout(() => {
    writeInput(terminal, text.substr(1), next);
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

function setTitle(terminal, title, next) {
  terminal.setTitle("~/mysqldemo — " + title);
  setTimeout(next(), 0);
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
  { type: "title", text: "bash" },
  { type: "out", text: "$ " },
  { type: "pause", length: 2000 },
  { type: "in", text: "mysqldump drupal > drupal.sql\n" },
  { type: "title", text: "mysqldump" },
  { type: "out", text: "Enter password: " },
  { type: "pause", length: 600 },
  { type: "password", length: 8 },
  { type: "in", text: "\n" },
  { type: "pause", length: 2000 },
  { type: "title", text: "bash" },
  { type: "out", text: "$ " },
  { type: "pause", length: 1000 },
  {
    type: "in",
    text: `cockroach sql --set display_format=records -e "CREATE DATABASE test; USE test; IMPORT MYSQLDUMP ('nodelocal:///drupal.sql');"\n`
  },
  { type: "title", text: "cockroach" },
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
`
  },
  { type: "title", text: "bash" },
  { type: "out", text: "$ " }
];
