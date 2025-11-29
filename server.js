require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const msal = require("@azure/msal-node");
 
const app = express();
app.set("view engine", "ejs");
 
// Load SSL Certificate
const options = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem")
};
 
// MSAL Config
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};
 
const cca = new msal.ConfidentialClientApplication(msalConfig);
 
// Routes
app.get("/", (req, res) => {
  res.render("home");
});
 
app.get("/login", async (req, res) => {
  const authUrlParams = {
    scopes: ["openid", "profile", "email"],
    redirectUri: `https://${process.env.PUBLIC_IP}/redirect`,
  };
 
  const authUrl = await cca.getAuthCodeUrl(authUrlParams);
  res.redirect(authUrl);
});
 
app.get("/redirect", async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["openid", "profile", "email"],
    redirectUri: `https://${process.env.PUBLIC_IP}/redirect`,
  };
 
  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    res.render("dashboard", { user: response.account });
  } catch (error) {
    console.log(error);
    res.send("Login failed");
  }
});
 
// Start HTTPS server on port 443
https.createServer(options, app).listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
