# _Airbean API - Grupp7 - FE23_

Rebecca Jansson, Johanna Tepsa, Simon Gustavsson, Troj Andersen, Tor Högberg.

## Auth operations

### Sign Up

To create a new account send a POST to **/public/signup**

the format for the request should look like this

```
{
"username": "Simon",
"password" : "kakor",
"email" : "simon@gmail.com"
}
```

All fields are required

### Log In

To log in send a POST to **/public/login**

the format for the request should look like this

```
{
"username": "Simon",
"password" : "kakor"
}
```

All fields are required

### Guest

To use a guest account send a GET to **/public/guest**

**_IMPORTANT_** Guests can not review order history

## Order handling

### View Menu

To view the menu send a GET to **/public/menu**

The user needs to be on a user or guest account

### Add to cart

To add a new product to the cart send a POST to **/public/addtocart**

The user needs to be on a user or guest account

The request should look like this

```
{
 "add" : {
	"id": 1,
	 "quantity": 15
 }
}
```

All fields are required

### Remove from cart

To add a new product to the cart send a POST to **/public/addtocart**

The user needs to be on a user or guest account

The request should look like this

```
{
    "remove": {
        "id": 1
    }
}
```

All fields are required

### View cart

To view the cart send a GET to **/public/viewcart**

The user needs to be on a user or guest account

### Place order

When the user is happy with the items in cart

Send a GET request to **/public/create**

This will place an order with a searchable id into the database.

Delivery data is not yet available

### Show previous orders

Send a GET request to **/public/orderhistory**

The user needs to be logged in for this feature

# **Thanks for using Airbean!**
