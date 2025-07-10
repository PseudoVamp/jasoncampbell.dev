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

//Imports CORS to control which domains can access the contact form
const cors = require('cors');

// ADD THIS: Import fetch for making HTTP requests to your auth server
const fetch = require('node-fetch');

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

// Rate limiter for auth requests to prevent abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 10, // Allow 10 auth attempts per IP per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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

// Validation for auth requests
const validateAuthForm = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_\-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('password')
    .isLength({ min: 1, max: 200 })
    .withMessage('Password is required')
];

//CORS configuration - allow same-origin requests
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your domains and localhost for development
    const allowedOrigins = [
      'https://jasoncampbell.dev',
      'https://www.jasoncampbell.dev'
    ];

    // IMPORTANT: Allow requests with no origin (same-origin requests, mobile apps, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin (same-origin)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowing request from:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies if needed
  methods: ['GET', 'POST', 'OPTIONS'], // Added OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'] // Only allow these headers
};

//Apply CORS to all routes
app.use(cors(corsOptions));

// Set headers for Godot web export compatibility
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
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

//tells express to serve the Godot game files (wasm, js, pck) from the webHangout folder
//when someone visits /webHangout/filename, it will look in public/webHangout/ for that file
//this keeps the game assets separate from the main website assets
app.use('/webHangout', express.static(path.join(__dirname, "public/webHangout")));

//tells express to serve the Godot game files (wasm, js, pck) from the catStuff folder
//when someone visits /catStuff/filename, it will look in public/catStuff/ for that file
//this keeps the game assets separate from the main website assets
app.use('/catStuff', express.static(path.join(__dirname, "public/catStuff")));

//Parse form data:
app.use(express.urlencoded({ extended: true }));

// Parse JSON data for API requests
app.use(express.json());

// =============================================================================
// CLOUDINARY IMAGE PROXY
// =============================================================================
// This route intercepts requests for images that originated from Cloudinary
// and proxies them through your server. This allows your server to add
// the necessary 'Cross-Origin-Resource-Policy' header, which is required
// when 'Cross-Origin-Embedder-Policy: require-corp' is active on your site.
app.get('/cloudinary-proxy/*', async (req, res) => {
    // req.params[0] captures the dynamic part of the URL after '/cloudinary-proxy/'
    // For example, if the request is /cloudinary-proxy/v1674954765/picPage/waterView_g4ncz7.jpg
    // imagePath will be 'v1674954765/picPage/waterView_g4ncz7.jpg'
    const imagePath = req.params[0];
    const cloudinaryBaseUrl = 'https://res.cloudinary.com/dijsqclbt/image/upload/';
    const fullCloudinaryUrl = `${cloudinaryBaseUrl}${imagePath}`;

    try {
        console.log(`🖼️ Proxying Cloudinary image: ${fullCloudinaryUrl}`);
        // Fetch the image from Cloudinary
        const response = await fetch(fullCloudinaryUrl);

        // If Cloudinary's response is not OK (e.g., 404, 500), propagate the error
        if (!response.ok) {
            console.error(`❌ Cloudinary returned error ${response.status} for: ${fullCloudinaryUrl}`);
            return res.status(response.status).send(`Error fetching image from Cloudinary: ${response.statusText}`);
        }

        // Get the Content-Type header from Cloudinary's response and set it for your client
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Set the crucial 'Cross-Origin-Resource-Policy' header to 'cross-origin'
        // This explicitly allows the browser to embed this resource from your domain
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        // Pipe the image data stream directly from Cloudinary to your client's response.
        // This is efficient as it avoids buffering the entire image in your server's memory.
        response.body.pipe(res);

    } catch (error) {
        // Catch any network or other errors during the proxy process
        console.error('❌ Proxy error for Cloudinary image:', error.message);
        res.status(500).send('Error loading image via proxy');
    }
});
// =============================================================================
// END CLOUDINARY IMAGE PROXY
// =============================================================================


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


//loads the resume page
app.get("/resume", (req, res) => {
  res.render("resume.ejs");
});

//loads the survival game 
app.get("/survival", (req, res) => {
  res.render("survival.ejs");
});

//loads the contact page
app.get("/contact", (req, res) => {
  res.render("contact.ejs", { query: req.query });
});

// // New WebHangout game page route
// app.get("/webHangout", (req, res) => {
//   res.render("webHangout.ejs");
// });

// // New catStuff game page route
// app.get("/catStuff", (req, res) => {
//   res.render("catStuff.ejs");
// });

// =============================================================================
// AUTHENTICATION PROXY ROUTES
// =============================================================================

// Login proxy route - forwards requests to your auth server
app.post("/api/login", authLimiter, validateAuthForm, async (req, res) => {
  // Check if validation found any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    console.log('🔐 Proxying login request for:', req.body.username);

    // Forward request to your auth server
    const response = await fetch('https://backend.jasoncampbell.dev:50003/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebHangout-Proxy/1.0'
      },
      body: JSON.stringify({
        username: req.body.username,
        password: req.body.password
      })
    });

    // Get the response data
    const data = await response.json();

    console.log('✅ Auth server responded with status:', response.status);

    // Forward the exact response from auth server
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy error during login:', error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication service temporarily unavailable'
    });
  }
});

// Register proxy route - forwards requests to your auth server
app.post("/api/register", authLimiter, validateAuthForm, async (req, res) => {
  // Check if validation found any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    console.log('📝 Proxying registration request for:', req.body.username);

    // Forward request to your auth server
    const response = await fetch('https://backend.jasoncampbell.dev:50003/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebHangout-Proxy/1.0'
      },
      body: JSON.stringify({
        username: req.body.username,
        password: req.body.password
      })
    });

    // Get the response data
    const data = await response.json();

    console.log('✅ Auth server responded with status:', response.status);

    // Forward the exact response from auth server
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy error during registration:', error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication service temporarily unavailable'
    });
  }
});

// Health check route for the auth proxy
app.get("/api/auth-status", (req, res) => {
  res.json({
    status: "ok",
    message: "WebHangout authentication proxy is running",
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// END OF AUTHENTICATION PROXY SECTION
// =============================================================================

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
  console.log("🎮 WebHangout authentication proxy enabled");
  console.log("🔗 Auth endpoints: /api/login, /api/register");
});