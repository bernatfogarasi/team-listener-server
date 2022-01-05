const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/confirm", require("./confirm"));
router.use("/edit", require("./edit"));
router.use("/login", require("./login"));
router.use("/logout", require("./logout"));
router.use("/session", require("./session"));
router.use("/signup", require("./signup"));

module.exports = router;
