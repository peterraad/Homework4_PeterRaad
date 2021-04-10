const SearchString = require('../models/search');

const CreateSearchStringService = async (body) => {
  await new SearchString(body).save();
};

module.exports = {
  CreateSearchStringService,
};
