var page, system;

page = require("webpage").create();
var fs = require("fs");
system = require("system");
console.log("phantomjs: Using file " + system.env.TEST_FILE + " to compare.");
var compare = fs.read(system.env.TEST_FILE);
console.log("phantomjs: Running tests at " + system.env.ROOT_URL);

page.onConsoleMessage = function(message) {
  console.log(message);
};

page.open(system.env.ROOT_URL, function(status) {
  console.log("status:", status);
});

page.onError = function(msg, trace) {
  var mochaIsRunning;
  mochaIsRunning = page.evaluate(function() {
    return window.mochaIsRunning;
  });
  if (mochaIsRunning) {
    return;
  }
  console.log("phantomjs: " + msg);
  trace.forEach(function(item) {
    console.log("    " + item.file + ": " + item.line);
  });
  phantom.exit(6);
};

setInterval(function() {
  var done, failures;
  done = page.evaluate(function() {
    if (typeof TEST_STATUS !== "undefined" && TEST_STATUS !== null) {
      return TEST_STATUS.DONE;
    }
    if (typeof DONE !== "undefined" && DONE !== null) {
      return DONE;
    }
    return false;
  });
  if (done) {
    var html = page.evaluate(function() {
      // We don't care about the duration of tests. We make them '0'
      var duration = document.querySelectorAll(".duration");
      for (var i = 0; i < duration.length; i++) {
        duration[i].innerHTML = "0";
      }
      // Cleanup slow fast medium classes
      var tests = document.querySelectorAll(".test");
      for (var i = 0; i < tests.length; i++) {
        var test = tests[i];
        test.classList.remove("fast");
        test.classList.remove("medium");
        test.classList.remove("slow");

        test.classList.add("fast");
      }

      return document.querySelector(".mocha-wrapper").innerHTML;
    });
    // Remove changing strings
    var regex = new RegExp("/local\\?", "g");
    html = html.replace(regex, "/?");

    regex = new RegExp("http://localhost:3000", "g");
    compare = compare.replace(regex, system.env.ROOT_URL);

    regex = new RegExp("hash=[^\\n|^<]*", "g");
    html = html.replace(regex, "hash=a");

    regex = new RegExp("meteor-test-[^/]*", "g");
    html = html.replace(regex, "meteor-test-123");

    regex = new RegExp("meteor-test-[^/]*", "g");
    html = html.replace(regex, "meteor-test-123");

    regex = /\/home\/.*\/.meteor\/.*\)/g;
    html = html.replace(regex, "/home/test/.meteor/promise/core.js:1:1)");

    var equal = compare == html;
    if (!equal) {
      fs.write(system.env.TEST_FILE + ".compare", html, "w");
    }
    return phantom.exit(!equal);
  }
}, 500);

// ---
// generated by coffee-script 1.9.2
