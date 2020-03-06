var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var auth = require("./auth");
var config = require("./config");

app.set("env", config.useJavascriptBundle ? "production" : "development");
app.use("/assets", express.static("assets"));
app.use("/dist", express.static("dist"));
app.use("/node_modules", express.static("node_modules"));
app.set("view engine", "ejs");
app.set("views", "./server/views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

auth.init(app);

// system level responses
app.use(require("../responses/serverError"));
app.use(require("../responses/ok"));
app.use(require("../responses/notFound"));
app.use(require("../responses/badRequest"));

// setup routes
require("./routes").http(app);

app.use("/", express.static("build"));

// Export the app instance for unit testing via supertest
module.exports = app;
