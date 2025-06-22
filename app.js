//Imports express to use in the project
const express = require("express");

//Imports the rate limit for my email form, so I don't get spammm
const rateLimit = require('express-rate-limit');

//Imports the express validator, for ensuring emails are legitimate (name length, blocks scripts ect)
const { body, validationResult } = require('express-validator');

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
//use express-rate-limit to block spam emails, 2 sends per ip, per 15 minute period
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  // windowMs: 4 * 1000, // 15 second window (for testing)
  max: 2, //number of possible sends
  message: {
    success: false,
    error: 'Too many contact form submissions from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable old X-RateLimit-* headers
});
//Validation for the email form
const validateContactForm = [
  body('name')
    .trim() // Remove extra spaces
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail() // Converts to lowercase, removes dots from Gmail addresses
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
    .escape() // Converts HTML characters like < > to safe versions
];

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

//Contact form POST route (handles both regular and AJAX submissions)
app.post("/contact", contactLimiter, validateContactForm, (req, res) => {
  //Check if validation found any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //If there are validation errors, return them
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  //if 'website' field has any value, it's a bot
if (req.body.website) {
  console.log('Bot detected - honeypot field filled:', req.body.website);
  // Silently reject (don't tell the bot why it failed)
  return res.json({ 
    success: true,
    message: 'Email sent successfully!' 
  });
}

  const { name, email, message } = req.body;
  
  //Create email content and nice formatting (now with validated and sanitized data)
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

  // Send the email if everything checks out
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email' 
      });
    } else {
      console.log('Email sent successfully:', info.response);
      return res.json({ 
        success: true,
        message: 'Email sent successfully!'
      });
    }
  });
});


//sets the node script.js command to open a server listening on the specified port
//lets you go to localhost:3000 to load the app (requires node app.js running)
app.listen(3000, () => {
  console.log("listening on port 3000");
});
