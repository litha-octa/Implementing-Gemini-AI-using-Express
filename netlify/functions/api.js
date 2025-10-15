// netlify/functions/api.js
const express = require("express");
const serverless = require("serverless-http");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Gemini AI Express!");
});

module.exports.handler = serverless(app);
