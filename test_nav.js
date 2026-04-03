const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><html><body><nav id="site-nav"></nav></body></html>`, {
    url: "https://tenet-5.github.io/my-story.html"
});

global.window = dom.window;
global.document = dom.window.document;

try {
    const scriptContent = fs.readFileSync('E:/TENET-5.github.io/nav.js', 'utf8');
    // Note: since it's an IIFE, we just eval it
    eval(scriptContent);
    document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
    console.log("Nav HTML Output length:", document.getElementById('site-nav').innerHTML.length);
    console.log("Nav HTML Preview:", document.getElementById('site-nav').innerHTML.substring(0, 20