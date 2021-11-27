const router = require("express").Router();

router.use("/login", require("./login"));
router.use("/register", require("./register"));
router.use("/confirm", require("./confirm"));
router.use("/session", require("./session"));

module.exports = router;
