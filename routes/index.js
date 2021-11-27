const router = require("express").Router();

router.use("/user", require("./user"));
router.use("/search", require("./search"));
router.use("/check", require("./check"));

module.exports = router;
