const Express = require('express');
const BodyParser = require('body-parser');

const router = Express.Router();
router.use(BodyParser.json());
module.exports = router;
