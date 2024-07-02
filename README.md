# _Airbean API - Individual project by Troj - Group 7 - FE23_

Group 7
Rebecca Jansson, Johanna Tepsa, Simon Gustavsson, Troj Andersen, Tor Högberg.

## Previously used options are found in the group project. Here I will instead focus on using the admin functions

Setup the project with node and be sure to use npm install to ensure you have all the dependencies. Run the code by using
"nodemon server.js". Then preferably use Insomnia to interact with the REST API.

### LOGIN
POST request on http://localhost:8000/login
```
{
	"username": "admin",
	"password": "admin"
}
```

This user has admin functionality needed to bypass admin authentication.

### CREATEMENUITEM
POST request on http://localhost:8000/createmenuitem

```
{
	"id": 15,
	"title": "Coffee Carta",
	"desc": "Cartae",
	"price": 56
}
```
This is an example of making a new menu item. Aslong as youre using a new unique ID it will create a new item in the menu.

### UPDATEMENUITEM
POST request on http://localhost:8000/updatemenuitem

```
{
	"id": 15,
	"title": "Coffee Carta",
	"desc": "Cartae dere",
	"price": 52
}
```

### REMOVEMENUITEM
POST request on http://localhost:8000/removemenuitem

```
{
	"id": 15
}
```
This example would remove the previous created or updated menu item by targetting its id.

### CREATEDISCOUNT
POST request on http://localhost:8000/creatediscount

```
{
	"comboIds": [1, 4],
  	"discountPercentage": 20
}
```
This example would add a discount percentage on orders using the IDs of 1 & 4 from the menu.
