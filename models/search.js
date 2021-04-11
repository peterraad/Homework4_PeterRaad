const Mongoose = require('mongoose');

module.exports = Mongoose.model('Search', new Mongoose.Schema({
  searchstring: { type: String, required: true, unique: true },
}, {
  toJSON: {
    getters: true,
    virtuals: false,
  },
}));
