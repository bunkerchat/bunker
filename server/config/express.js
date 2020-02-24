const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const auth = require("./auth");
const config = require("./config");
const { typeDefs, resolvers } = require("../graphql");

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

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

// Export the app instance for unit testing via supertest
module.exports = app;
