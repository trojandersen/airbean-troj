const app = require("express");
const router = app.Router();
const controllers = require("../controllers/controllers");
const auth = require("../middleware/auth");
const orderHandler = require("../middleware/orderHandler");
const blockGuest = require("../middleware/guestmiddleware");
const authAdmin = require("../middleware/authadmin");

// about & account routes

router.get("/about", controllers.about);
router.post("/login", controllers.logIn);
router.post("/signup", controllers.signUp);
router.get("/guest", controllers.continueAsGuest);

// menu, cart & order routes

router.get("/getmenu", auth, controllers.getMenu);
router.get("/viewcart", auth, controllers.viewCart);
router.post("/addtocart", auth, orderHandler, controllers.addToCart);
router.post("/removefromcart", auth, controllers.removeFromCart);
router.get("/createorder", auth, controllers.createOrder);
router.get("/orderhistory", auth, blockGuest, controllers.getPreviousOrders);

// Admin routes

router.post("/createmenuitem", auth, authAdmin, controllers.createMenuItem);
router.post("/updatemenuitem", auth, authAdmin, controllers.updateMenuItem);
router.post("/removemenuitem", auth, authAdmin, controllers.removeMenuItem);
router.post("/creatediscount", auth, authAdmin, controllers.createDiscount);

module.exports = router;
