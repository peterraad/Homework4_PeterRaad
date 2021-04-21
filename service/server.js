require('dotenv').config();
const Mongoose = require('mongoose');
const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);
const SearchModel = require('../models/search');

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

const SearchForAutoComplete = async (searchString) => SearchModel.find({ searchstring: new RegExp(`${searchString}`, 'i') });

const CreateSearchString = async (stringObject) => {
  await new SearchModel(stringObject).save().catch((error) => {
    throw Error(`${error} Something went wrong saving the string to the database. 
    You may be trying to save an existing string`);
  });
};

io.on('connection', (socket) => {
  socket.on('search submitted', (searchString) => {
    const stringObject = {
      searchstring: searchString,
    };
    CreateSearchString(stringObject).catch((error) => {
      throw Error(error);
    });
  });
  socket.on('search', async (searchString) => {
    const result = await SearchForAutoComplete(searchString).catch((error) => {
      throw Error(error);
    });
    const autocompleteList = result.map((thing) => thing.searchstring);
    socket.emit('search', autocompleteList);
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
})();
http.listen(process.env.PORT);
