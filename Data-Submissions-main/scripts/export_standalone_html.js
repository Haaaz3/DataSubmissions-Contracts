const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const sourceDir = path.join(root, "outputs", "ohds-prototype");
const docsDir = path.join(root, "docs");

const sourceHtmlPath = path.join(sourceDir, "index.html");
const sourceCssPath = path.join(sourceDir, "styles.css");
const sourceJsPath = path.join(sourceDir, "app.js");

const exportName = "oracle-health-data-submissions-editable.html";
const outputPath = path.join(sourceDir, exportName);
const docsPath = path.join(docsDir, exportName);

const html = fs.readFileSync(sourceHtmlPath, "utf8");
const css = fs.readFileSync(sourceCssPath, "utf8").replaceAll("</style>", "<\\/style>");
const js = fs.readFileSync(sourceJsPath, "utf8").replaceAll("</script>", "<\\/script>");

const exported = html
  .replace(
    "<!doctype html>",
    `<!doctype html>
<!--
  Oracle Health Data Submissions editable standalone export.
  Generated from outputs/ohds-prototype/index.html, styles.css, and app.js.
  This single file contains the full clickable prototype, including all production,
  variant, strategy, performance, validation, submission, QRDA, and audit screens.
-->`,
  )
  .replace(
    "<title>Oracle Health Data Submissions Prototype</title>",
    "<title>Oracle Health Data Submissions Prototype - Editable Export</title>",
  )
  .replace(
    /<link rel="stylesheet" href="styles\.css\?v=\d+" \/>/,
    `<style id="ohds-exported-styles">
${css}
    </style>`,
  )
  .replace(
    /<script src="app\.js\?v=\d+"><\/script>/,
    `<script id="ohds-exported-app">
${js}
    </script>`,
  );

fs.writeFileSync(outputPath, exported);
fs.writeFileSync(docsPath, exported);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${docsPath}`);
