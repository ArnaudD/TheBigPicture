
require("shelljs/global");

var async = require("async");
var glob  = require("glob");

var splitSize = 40; // ko
var header = "<!DOCTYPE html><html>" +
  "<head><meta charset=\"utf-8\"><style>" +
    "html,body{font-family: \"monospace\";font-size:10px;word-break: break-all;padding:0;margin:0;}" +
  "</style></head><body>";
var footer = "</body></html>";
var pwd = process.cwd();

rm("output/splitted-*");

// phantomjs doesn't like large webpage, split the code into several files
exec("split -C" + splitSize + "K --additional-suffix \".html\" source.txt output/splitted-", {async: false});

// Escape HTML entities
exec("sed -i 's/&/\\&amp;/g' output/splitted-*", {async: false, silent: false});
exec("sed -i 's/>/\\&gt;/g' output/splitted-*", {async: false, silent: false});
exec("sed -i 's/</\\&lt;/g' output/splitted-*", {async: false, silent: false});

// Add HTML header and footer
exec("sed -i '1i" + header + "' output/splitted-*", {async: false, silent: false});
exec("echo footer >> output/splitted-*", {async: false});

function stitch(files) {

  var outputRatio = 4.0 / 3;

  // var filesPerCol  = (files.size / )
  // var filesPerLine = (files.size / )

  // exec("montage output/*.png -gravity North -geometry +0+0 -mode Concatenate montage.png ", {async: false});

  // $ montage output/*.png -gravity North -mode Concatenate -define registry:temporary-path=. -tile 1x5 montage-%d.png

  // $ montage output/splitted-a*.png -gravity North -geometry +5+0 -define registry:temporary-path=. montage.png

}

glob("output/splitted-*.html", function(er, files) {
  var tasks = [];
  var cmd = "phantomjs --debug=true rasterize.js 'file://" + pwd + "/";

  // Prepare rasterizing tasks
  files.forEach(function (file) {
    tasks.push(exec.bind(null, cmd + file + "' '" + file + ".png' '1200px'", {silent: false}));
  });

  // Run 4 phantomjs process in parallel
  async.parallelLimit(tasks, 4, function () {
    stitch(files);
  });
});
