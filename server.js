const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the Angular app build output
app.use(express.static(path.join(__dirname, "dist/frontend")));

// Catch all other routes and return the index file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/frontend/index.html"));
});

// Get port from environment and store in Express
const port = process.env.PORT || 8080;
app.set("port", port);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
