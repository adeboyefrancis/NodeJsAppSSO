require("dotenv").config();
const express = require("express");
const msal = require("@azure/msal-node");
 
const app = express();
app.set("view engine", "ejs");
 
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
    redirectUri: "http://localhost:3000/redirect",
  };
 
  const authUrl = await cca.getAuthCodeUrl(authUrlParams);
  res.redirect(authUrl);
});
 
app.get("/redirect", async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["openid", "profile", "email"],
    redirectUri: "http://localhost:3000/redirect",
  };
 
  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    res.render("dashboard", { user: response.account });
  } catch (error) {
    console.log(error);
    res.send("Login failed");
  }
});
 
// Start server
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);