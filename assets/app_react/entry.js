require("./../vendor/bootstrap/dist/css/bootstrap.css");
//require("!style!css!./../vendor/bootswatch/sandstone/bootstrap.css");
//require("!style!css!./../vendor/font-awesome/css/font-awesome.css");
//require("!style!css!./../vendor/highlightjs/styles/github.css");
//require("style!css!less!./../vendor/bootstrap/less/bootstrap.less");
require("!style!css!./../styles/default.css");

var Header = require("./components/Header.jsx");

React.render(React.createElement(Header), document.getElementById("header"));

