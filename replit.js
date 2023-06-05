import express from "express";
const express_app = express();

express_app.get("/", (_, res) => {
  res.send("<h1>2K2R namebot 24/7 with reple.it</h1>");
});

express_app.listen(80, () => {
  console.log("[EXPRESS] Ready: express server");
});

await import("./out/main.js");
