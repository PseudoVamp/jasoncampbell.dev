//Imports express to use in the project
const express = require("express");

// ignore env file
require('dotenv').config();

//for sending emails directly from the website contact form
const nodemailer = require('nodemailer');

//path file built in with NODE, lets you set file/dir paths
const path = require("path");

//executes express for the project
const app = express();


//Email configuration:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

//Parse form data:
app.use(express.urlencoded({ extended: true }));

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

//loads the resume page
app.get("/resume", (req, res) => {
  res.render("resume.ejs");
});



//loads the survival game on the project page
app.get("/survival", (req, res) => {
  res.render("survival.ejs");
});

//loads the contact page
app.get("/contact", (req, res) => {
  res.render("contact.ejs", { query: req.query });
});

// Contact form POST route (handles both regular and AJAX submissions)
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  
  // Create email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Message from ${name}`,
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
    html: `
      <h3>New Contact Form Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    `
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      
      // Check if it's an AJAX request
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.status(500).json({ success: false, error: 'Failed to send email' });
      } else {
        res.redirect('/contact?error=true');
      }
    } else {
      console.log('Email sent successfully:', info.response);
      
      // Check if it's an AJAX request
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.json({ success: true });
      } else {
        res.redirect('/contact?success=true');
      }
    }
  });
});


//sets the node script.js command to open a server listening on the specified port
//lets you go to localhost:3000 to load the app (requires node script.js running)
app.listen(3000, () => {
  console.log("listening on port 3000");
});
