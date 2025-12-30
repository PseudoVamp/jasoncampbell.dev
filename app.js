//Imports express to use in the project
const express = require("express");

//Imports the rate limit for my email form, so I don't get spammm
const rateLimit = require("express-rate-limit");

//Imports the express validator, for ensuring emails are legitimate
const { body, validationResult } = require("express-validator");

//Ignore env file
require("dotenv").config();

//For sending emails directly from the website contact form
const nodemailer = require("nodemailer");

//Imports CORS to control which domains can access the contact form
const cors = require("cors");

//Path file built in with NODE, lets you set file/dir paths
const path = require("path");

//Executes express for the project
const app = express();

//Email configuration:
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Use express-rate-limit to block spam emails
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: {
    success: false,
    error:
      "Too many contact form submissions from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//Validation for the email form
const validateContactForm = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters")
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    ),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email address is too long"),

  body("message")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be between 10 and 5000 characters")
    .escape(),
];

//CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://jasoncampbell.dev",
      "https://www.jasoncampbell.dev",
      "http://localhost:3000",
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

//Set view engine and asset folders
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

// Serves the Godot catStuff game files (wasm, js, pck) from the catStuff folder
app.use("/catStuff", express.static(path.join(__dirname, "public/catStuff")));

//Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//******************
//******ROUTES******
//******************
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/musicNotes", (req, res) => {
  res.render("musicNotes.ejs");
});

app.get("/picPage", (req, res) => {
  res.render("picPage.ejs");
});

app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});

app.get("/resume", (req, res) => {
  res.render("resume.ejs");
});

app.get("/survival", (req, res) => {
  res.render("survival.ejs");
});

app.get("/catStuff", (req, res) => {
  res.render("catStuff.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { query: req.query });
});

//Contact form POST route
app.post("/contact", contactLimiter, validateContactForm, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  if (req.body.website) {
    return res.json({ success: true, message: "Email sent successfully!" });
  }

  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Contact Form Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to send email" });
    } else {
      return res.json({ success: true, message: "Email sent successfully!" });
    }
  });
});

//For local development, does not matter on vercel as it is serverless
app.listen(3000, () => {
  console.log("listening on port 3000");
});
