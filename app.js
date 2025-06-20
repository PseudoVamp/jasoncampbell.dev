//Imports express to use in the project
const express = require("express");

//executes express for the project
const app = express();

//path file built in with NODE, lets you set file/dir paths
const path = require("path");

//tells the app to use extended javascript
//need to install with npm, and then express will require it so you dont have to
//IMPORTANT!!! the default folder ejs will look for assets to load is "/views"
app.set("view engine", "ejs");

//If app files are opened from an outside location, this setting tells the app to look at this specific folder for assets
//requires access to "path"
app.set("views", path.join(__dirname, "/views"));

//tells express that you want to serve the app all of the assets (css js) in the public folder
//If app files are opened from an outside location, this setting tells the app to look at this specific folder for assets
//requires access to "path"
app.use(express.static(path.join(__dirname, "public")));

//sets the route/home of this project to this file with a request and response
app.get("/", (req, res) => {
  //res.render sends the page that you wish to load with that URL
  res.render("home.ejs");
});

//loads the second page url /musicNotes
app.get("/musicNotes", (req, res) => {
  res.render("musicNotes.ejs");
});

//loads another page with the url /picPage
app.get("/picPage", (req, res) => {
  res.render("picPage.ejs");
});

//loads the project page
app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});

//loads the survival game on the project page
app.get("/survival", (req, res) => {
  res.render("survival.ejs");
});

//sets the node script.js command to open a server listening on the specified port
//lets you go to localhost:3000 to load the app (requires node script.js running)
app.listen(3000, () => {
  console.log("listening on port 3000");
});
