require("@babel/register")();
const { configure } = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

configure({ adapter: new Adapter() });

const jsdom = require("jsdom");

const { JSDOM } = jsdom;

const { document } = new JSDOM({
  url: "http://localhost",
}).window;
global.document = document;

global.window = document.defaultView;
global.HTMLElement = window.HTMLElement;
global.HTMLAnchorElement = window.HTMLAnchorElement;

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: "node.js",
  },
  writable: true,
  configurable: true,
});

configure({ adapter: new Adapter() });
