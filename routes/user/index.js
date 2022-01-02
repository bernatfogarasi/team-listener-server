const router = require("express").Router();

router.use("/login", require("./login"));
router.use("/logout", require("./logout"));
router.use("/signup", require("./signup"));
router.use("/confirm", require("./confirm"));
router.use("/session", require("./session"));
router.use("/auth", require("./auth"));
router.use("/edit", require("./edit"));

module.exports = router;
