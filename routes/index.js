const router = require("express").Router();

router.use("/user", require("./user"));
router.use("/search", require("./search"));

module.exports = router;
