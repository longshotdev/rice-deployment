const express = require('express');

let server = express();

server.post("/upload", (req, res) => {
	res.send(200);
})

server.listen(3000, () => {
	console.log("🚀 Rice Deployment listening on port 3000!");
})