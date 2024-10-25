"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const handler_1 = require("./handler");
const port = 4000;
const server = (0, http_1.createServer)();
server.on("request", handler_1.handler);
server.listen(port);
server.on("listening", () => {
    console.log(`(Event) Server listening on port
${port}`);
});
