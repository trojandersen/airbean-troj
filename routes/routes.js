const app = require("express");
const router = app.Router();
const authenticateUser = require("../middleware/auth");
const handleOrder = require("../middleware/orderHandler");
const controllers = require("../controllers/controllers");
const blockGuest = require("../middleware/guestmiddleware");

router.get("/about", controllers.about);

router.post("/login", controllers.logIn);
router.post("/signup", controllers.signUp);
router.get("/guest", controllers.continueAsGuest);
router.get("/viewcart", authenticateUser, controllers.viewCart);
router.post("/addtocart", authenticateUser, handleOrder, controllers.addToCart);
router.post("/removefromcart", authenticateUser, controllers.removeFromCart);
router.get("/menu", authenticateUser, controllers.getMenu);

router.get("/create", authenticateUser, controllers.createOrder);
router.get(
  "/orderhistory",
  authenticateUser,
  blockGuest,
  controllers.getPreviousOrders
);

module.exports = router;
