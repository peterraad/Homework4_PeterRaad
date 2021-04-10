require('dotenv').config();
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');

const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const SearchRoutes = require('../routes/searchroutes');

app.post('/', SearchRoutes);
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});
io.on('connection', (socket) => {
  socket.on('search', (msg) => {
    io.emit('search', msg);
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
