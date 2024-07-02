const { client } = require("../config/database");

const crypto = require("node:crypto");

// function to make your orderID, used in createOrder

const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// functions to make a new order, add & remove items from cart and to view the menu & your previous orders

exports.createOrder = async (req, res) => {
  if (!req.session.cart) {
    res.status(404).json("Cart is empty!");
    return;
  } else {
    try {
      const database = client.db("Airbean");
      const orders = database.collection("Orders");
      const discounts = database.collection("Discounts");

      const userId = req.session.userID;
      const itemsInCart = req.session.cart;
      const itemIds = itemsInCart.map((item) => item.id);
      const discount = await discounts.findOne({ comboIds: { $all: itemIds } });

      let billed = 0;

      itemsInCart.forEach((item) => {
        const price = item.price;

        const quantity = item.quantity;

        const cost = price * quantity;

        billed += cost;
      });

      // Apply discount if available
      if (discount) {
        billed = billed - billed * (discount.discountPercentage / 100);
      }

      const randomString = generateRandomString(8);
      const orderID = `${userId}${randomString}`;

      await orders.insertOne({
        ordernumber: orderID,
        placed_at: new Date().toDateString(),
        coffeeOrdered: itemsInCart,
        billed: `${billed} SEK`,
      });

      let confirmMessage;
      if (req.session.userID !== "guest") {
        confirmMessage = `Tack för din beställning! Ditt orderId = ${orderID}`;
        req.session.cart = [];
      } else {
        confirmMessage = "Tack för din beställning. Lyfter snart!";
        req.session.cart = [];
      }

      res.status(200).json({ message: confirmMessage });
    } catch (error) {
      res.status(500).json({ message: "Error order failed: " + error.message });
    }
  }
};

exports.addToCart = async (req, res) => {
  const addItem = req.body.add;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const cart = req.session.cart;

  const database = client.db("Airbean");
  const menu = database.collection("Menu");

  let itemfound = false;

  cart.forEach((item) => {
    if (item.id === addItem.id) {
      itemfound = true;
      item.quantity += addItem.quantity;

      res.status(200).json({
        message: `${addItem.quantity} ${item.title} added to cart`,
        cart: req.session.cart,
      });
    }
  });
  if (!itemfound) {
    const product = await menu.findOne({ id: addItem.id });

    if (product && !itemfound) {
      product.quantity = addItem.quantity;

      cart.push(product);

      res.status(200).json({
        message: `${product.quantity} ${product.title} added to cart`,
        cart: req.session.cart,
      });
    }
  }
};

exports.removeFromCart = async (req, res) => {
  if (req.session.cart && req.session.cart.length > 0) {
    const removeItem = req.body.remove;
    const filterCart = req.session.cart.filter(
      (item) => item.id !== removeItem.id
    );

    req.session.cart = filterCart;
    res.status(200).json({
      message: "Item deleted",
      cart: req.session.cart,
    });
  } else {
    res.status(400).json("Cart empty!");
  }
};

exports.viewCart = async (req, res) => {
  if (req.session.cart) {
    res.status(200).json(req.session.cart);
  } else {
    res.status(400).json("Cart empty!");
  }
};

exports.getPreviousOrders = async (req, res) => {
  try {
    const database = client.db("Airbean");
    const orders = database.collection("Orders");
    const userId = req.session.userID;
    const userOrder = await orders
      .find({
        ordernumber: { $regex: `^${userId}` },
      })
      .toArray();
    if (userOrder && userOrder.length > 0) {
      res.status(200).json(userOrder);
    } else {
      res.status(404).json({ message: "No orders found for this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error order failed: " + error.message });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const database = client.db("Airbean");
    const menuCollection = database.collection("Menu");

    const fullMenu = await menuCollection.find({}).toArray();

    res.status(200).json({ menuItems: fullMenu });
  } catch (err) {
    console.log("Error fetching menu:", err);
    res.status(500).json({ message: "Error fetching menu: " + err });
  }
};

// controllers for user authentication, login and account creation

exports.continueAsGuest = async (req, res) => {
  req.session.userID = "guest";

  res
    .status(200)
    .json(
      "Please note that you will not be able to review order history or change orders whilst you are logged in as guest"
    );
};

exports.logIn = async (req, res) => {
  const details = req.body;

  try {
    const user = crypto
      .createHash("sha256")
      .update(details.username)
      .digest("hex");

    const pass = crypto
      .createHash("sha256")
      .update(details.password)
      .digest("hex");

    const shiftedUser = user.slice(5) + user.slice(0, 5);
    const shiftedPass = pass.slice(5) + pass.slice(0, 5);

    const database = client.db("Airbean");
    const userbase = database.collection("Users");

    const findUser = await userbase.findOne({ username: shiftedUser });

    if (findUser) {
      if (shiftedPass === findUser.password) {
        req.session.userID = findUser.username;

        res.status(200).json("Logged in!");
      } else {
        res.status(200).json("Wrong password");
      }
    } else {
      res.status(404).json("No user found, please create an account!");
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.signUp = async (req, res) => {
  const details = req.body;

  try {
    const user = crypto
      .createHash("sha256")
      .update(details.username)
      .digest("hex");

    const pass = crypto
      .createHash("sha256")
      .update(details.password)
      .digest("hex");

    const email = details.email;
    const isAdmin = details.isAdmin;
    const shiftedUser = user.slice(5) + user.slice(0, 5);
    const shiftedPass = pass.slice(5) + pass.slice(0, 5);

    const database = client.db("Airbean");
    const userbase = database.collection("Users");
    const emailFormat = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}/;
    const findUser = await userbase.findOne({ username: shiftedUser });

    if (!shiftedUser || !shiftedPass || !email) {
      res.status(401).json("Please enter a username, password & email");
    } else {
      if (findUser) {
        res.status(200).json("User already exists. Please log in!");
      } else {
        if (emailFormat.test(email) == true) {
          const createUser = await userbase.insertOne({
            username: shiftedUser,
            password: shiftedPass,
            email: email,
            isAdmin: false,
          });
          req.session.userID = shiftedUser;
          res.status(200).json(`Welcome to Airbean ${details.username}!`);
        } else {
          res.status(401).json("Please register with a valid mailadress");
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// admin controllers

exports.createMenuItem = async (req, res) => {
  const item = req.body;
  const database = client.db("Airbean");
  const menu = database.collection("Menu");
  const findItem = await menu.findOne({ id: item.id });

  if (findItem) {
    res
      .status(400)
      .json(
        "This item already exists in the menu, either remove or update instead."
      );
  } else if (
    !item.id ||
    !item.title ||
    !item.price ||
    !item.desc ||
    item.price < 1
  ) {
    res
      .status(400)
      .json("One or more fields are missing. Please remake your query");
  } else {
    const newMenuItem = {
      id: item.id,
      title: item.title,
      desc: item.desc,
      price: item.price,
      created_at: new Date().toDateString(),
    };
    await menu.insertOne(newMenuItem);
    res.status(200).json("New item successfully added to the menu!");
  }
};

exports.updateMenuItem = async (req, res) => {
  const item = req.body;
  const database = client.db("Airbean");
  const menu = database.collection("Menu");
  const findItem = await menu.findOne({ id: item.id });

  if (findItem) {
    const updatedMenuItem = {
      id: item.id,
      title: item.title,
      desc: item.desc,
      price: item.price,
      created_at: findItem.created_at,
      modified_at: new Date().toDateString(),
    };
    await menu.updateOne({ id: item.id }, { $set: updatedMenuItem });
    res.status(200).json(`id: ${findItem.id} has been updated!`);
  } else {
    res
      .status(400)
      .json("There was no item found including this id in the menu");
  }
};

exports.removeMenuItem = async (req, res) => {
  const item = req.body;
  const database = client.db("Airbean");
  const menu = database.collection("Menu");
  const findItem = await menu.findOne({ id: item.id });

  if (findItem) {
    await menu.deleteOne(findItem);
    res.status(200).json("This item was successfully removed from the menu!");
  } else {
    res
      .status(400)
      .json("There was no item found including this id in the menu");
  }
};

exports.createDiscount = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const discount = req.body;

    // Check if comboIds is present and is an array
    if (!discount.comboIds || !Array.isArray(discount.comboIds)) {
      return res.status(400).json("Invalid comboIds: Must be an array.");
    }

    // Check if comboIds has at least two elements
    if (discount.comboIds.length < 2) {
      return res
        .status(400)
        .json("Invalid discount: At least two comboIds are required.");
    }

    // Check if discountPercentage is present and is a number
    if (
      !discount.discountPercentage ||
      typeof discount.discountPercentage !== "number"
    ) {
      return res
        .status(400)
        .json("Invalid discountPercentage: Must be a number.");
    }

    // Ensure comboIds is an array of numbers
    if (!discount.comboIds.every(Number.isFinite)) {
      return res
        .status(400)
        .json("Invalid comboIds: Must be an array of numbers.");
    }
    // TODO: fix undefined type in comboIds array
    const database = client.db("Airbean");
    const discounts = database.collection("Discounts");
    const discountDocument = {
      comboIds: discount.comboIds,
      discountPercentage: discount.discountPercentage,
      created_at: new Date().toDateString(),
    };

    const result = await discounts.insertOne(discountDocument);

    console.log("Insert result:", result);

    // Create the response object
    const response = {
      _id: result.insertedId,
      ...discountDocument,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json("An error occured whilst trying to create this discount");
  }
};

exports.about = async (req, res) => {
  res
    .status(200)
    .json(
      "Welcome to Airbean! We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum!  We are lorem ipsum! Här fortsätter lorem * 20"
    );
};
