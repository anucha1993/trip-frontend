// Custom entry point for hosts (e.g. Plesk/Passenger) that need a plain
// Node.js startup file instead of running the `next` CLI directly.
// Requires `npm run build` to have been run first.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 1001;
// Resolve relative to this file (not process.cwd()) so it works regardless
// of the working directory the host (e.g. Passenger) launches it from.
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`> Ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
