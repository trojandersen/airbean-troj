const { client } = require("../config/database");

const authAdmin = async (req, res, next) => {
  const database = client.db("Airbean");
  const users = database.collection("Users");
  const user = await users.findOne({ username: req.session.userID });
  if (!user.isAdmin) {
    return res.status(403).json({
      message: "You are unauthorized to use this endpoint",
    });
  } else {
    next();
  }
};

module.exports = authAdmin;
