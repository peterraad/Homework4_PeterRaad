require('dotenv').config();
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');
const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);
const SearchModel = require('../models/search');

const SearchRoutes = require('../routes/searchroutes');

app.use(BodyParser.json());
app.post('/', SearchRoutes);
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});
const CreateSearchString = async (body) => {
  await new SearchModel(body).save();
};
io.on('connection', (socket) => {
  socket.on('search submitted', (searchString) => {
    console.log(searchString);
    // io.emit('search', searchString);
    const stringObject = {
      searchstring: searchString,
    };
    CreateSearchString(stringObject);
    // emit the list of query results
  });
  socket.on('search', (searchString) => {
    console.log(searchString);
  });
});

(async () => {
  try {
    await Mongoose.connect(process.env.SERVER_SECRET, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } catch (error) {
    throw Error('While connecting to database.');
  }
  // app.listen(process.env.PORT);
})();
http.listen(process.env.PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${process.env.PORT}/`);
});
