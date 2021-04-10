const Express = require('express');
const BodyParser = require('body-parser');
const SearchController = require('../controllers/searchcontroller');

const router = Express.Router();
router.use(BodyParser.json());
router.post('/', SearchController.CreateString);
module.exports = router;
