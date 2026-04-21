const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("HELLO! The server is working!");
});

app.listen(5005, () => {
    console.log("Test Server running on port 5005");
});