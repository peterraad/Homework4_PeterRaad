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
const CreateSearchString = async (body) => {
  await new SearchModel(body).save();
};

// you can move the database operations to the service file
const SearchForAutoComplete = async (searchString) => SearchModel.find({ searchstring: new RegExp(`^${searchString}`, 'i') }, { searchString: 1 }, (err, result) => {
  if (err) throw Error(err);
});

io.on('connection', (socket) => {
  socket.on('search submitted', (searchString) => {
    console.log(searchString);
    // io.emit('search', searchString);
    const stringObject = {
      searchstring: searchString,
    };
    CreateSearchString(stringObject).catch((error) => {
      throw Error(error);
    });
  });
  socket.on('search', async (searchString) => {
    console.log(searchString);
    // SearchForAutoComplete(searchString);
    const result = await SearchForAutoComplete(searchString).catch((error) => {
      throw Error(error);
    });
    console.log(result);
    socket.emit('search', await SearchForAutoComplete(searchString).catch((error) => {
      throw Error(error);
    }));
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
