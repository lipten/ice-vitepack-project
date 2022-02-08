const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback');

const app = express();
const port = 5000;
app.use(history());
app.use(express.static(path.join(__dirname, './build')));

app.listen(port, () => {
  console.log(`listening ${port}`);
});
