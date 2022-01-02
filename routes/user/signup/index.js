const router = require("express").Router();

router.use("/manual", require("./manual"));

module.exports = router;
