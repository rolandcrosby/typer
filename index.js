const express = require("express");
const app = express();
const path = require('path');

app.use("/-", express.static('static'))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on http://localhost:" + (process.env.PORT || 3000));
});
