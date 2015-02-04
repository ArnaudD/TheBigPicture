
require("shelljs/global");

var async = require("async");
var glob  = require("glob");

var splitSize = 40; // ko
var header = "<!DOCTYPE html><html>" +
  "<head><meta charset=\"utf-8\"><style>" +
    "html,body{background:white;font-family:\"monospace\";font-size:10px;word-break:break-all;padding:0 7px;margin:0;}" +
  "</style></head><body>";
var footer = "</body></html>";
var pwd = process.cwd();

/* */
exec("rm output/splitted-*");

// phantomjs doesn't like large webpage, split the code into several files
exec("split -C" + splitSize + "K --additional-suffix \".html\" source.txt output/splitted-", {async: false});

// Escape HTML entities
exec("sed -i 's/&/\\&amp;/g' output/splitted-*", {async: false, silent: false});
exec("sed -i 's/>/\\&gt;/g' output/splitted-*", {async: false, silent: false});
exec("sed -i 's/</\\&lt;/g' output/splitted-*", {async: false, silent: false});

// Add HTML header and footer
exec("sed -i '1i" + header + "' output/splitted-*", {async: false, silent: false});
exec("echo footer >> output/splitted-*", {async: false});
/* */

function stitch(files) {

  var outputRatio = 4.0 / 3;
  var size = exec("identify -format '%w,%h' "+ files[0] + ".png", {async: false, silent: true})
              .output.trim().split(",");

  size[0] = parseInt(size[0]); // w
  size[1] = parseInt(size[1]); // h

  var pixels    = files.length * size[0] * size[1];
  var maxWidth  = Math.sqrt(pixels) * outputRatio;
  var maxHeight = Math.sqrt(pixels) * (1 / outputRatio);

  var cols = Math.ceil(maxWidth  / size[0]);
  var rows = Math.ceil(maxHeight / size[1]);

  var images = [];
  var src = files.slice(0);
  while (src.length > 0) {
    images.push(src.splice(0, rows));
  }

  // for (var i = 0, l = images.length; i < l; i++) {
  //   exec("convert " + images[i].join(".png ") + ".png -resize 75% -append output/col-" + i + ".png");
  // }

  for (var i = 0, l = rows; i < l; i++) {
    var line = [];
    for (var j = 0, jl = files.length; j < jl; j++) {
      if ((j + rows) % rows === (0 + i)) {
        line.push(files[j]);
      }
    }
    console.log("convert " + line.join(".png ") + ".png -append output/row-" + i + ".png");
    exec("convert " + line.join(".png ") + ".png -resize 70% +append output/row-" + i + ".png", {async: false});
  }

  exec("convert output/row-* -append output.png");

  // exec("montage output/*.png -gravity North -geometry +0+0 -mode Concatenate montage.png ", {async: false});

  // $ montage output/*.png -gravity North -mode Concatenate -define registry:temporary-path=. -tile 1x5 montage-%d.png

  // $ montage output/splitted-a*.png -gravity North -geometry +5+0 -define registry:temporary-path=. montage.png

}

glob("output/splitted-*.html", function(er, files) {
  var tasks = [];
  var cmd = process.cwd() + "/node_modules/.bin/phantomjs rasterize.js 'file://" + pwd + "/";
  var optipng = "optipng -o1 ";

  // Prepare rasterizing tasks
  files.forEach(function (file) {
    console.log("rasterizing ", file);
    tasks.push(exec.bind(null, cmd + file + "' '" + file + ".png' '1200px'"));
  });

  files.forEach(function (file) {
    console.log("optimizing ", file);
    tasks.push(exec.bind(null, optipng + file + ".png"));
  });

  // Run 4 phantomjs process in parallel
  async.parallelLimit(tasks, 8, function () {
    stitch(files);
  });
});
