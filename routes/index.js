const router = require("express").Router();

router.use("/check", require("./check"));
router.use("/user", require("./user"));
router.use("/room", require("./room"));
router.use("/search", require("./search"));

module.exports = router;
