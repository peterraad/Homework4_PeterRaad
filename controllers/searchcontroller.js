// get, update, delete, create
const SearchString = require('../service/search.service');

const DoActionThatMightFailValidation = async (request, response, action) => {
  try {
    await action();
  } catch (e) {
    response.sendStatus(
      e.code === 11000
            || e.stack.includes('ValidationError')
            || (e.reason !== undefined && e.reason.code === 'ERR_ASSERTION')
        ? 400 : 500,
    );
  }
};
const CreateString = async (request, response) => {
  await DoActionThatMightFailValidation(request, response, async () => {
    await SearchString.CreateSearchStringService(request.body);
    response.sendStatus(201);
  });
};

module.exports = {
  CreateString,
};
