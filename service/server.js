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

// you can move the database operations to the service file
const SearchForAutoComplete = async (searchString) => SearchModel.find({ searchstring: new RegExp(`${searchString}`, 'i') });

// you can move the database operations to the service file
const CreateSearchString = async (stringObject, text) => {
  const result = await SearchForAutoComplete(text).catch((error) => {
    throw Error(error);
  });
  const autocompleteList = result.map((thing) => thing.searchstring);
  let stringInDatabase = null;
  autocompleteList.forEach((resultString) => {
    if (resultString === text) {
      stringInDatabase = resultString;
    }
  });
  if (!stringInDatabase) {
    await new SearchModel(stringObject).save();
  }
};

io.on('connection', (socket) => {
  socket.on('search submitted', (searchString) => {
    console.log(searchString);
    // io.emit('search', searchString);
    const stringObject = {
      searchstring: searchString,
    };
    CreateSearchString(stringObject, searchString).catch((error) => {
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
  // app.listen(process.env.PORT);
})();
http.listen(process.env.PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${process.env.PORT}/`);
});
