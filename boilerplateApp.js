const express = require('express');

// here app is a function which has many methods attached to it
const app = express();

// express is really similar to the basic node as node is being worked under the hood. Here the .get after app is the requested method and will change according to the method requested like app.post, app.patch etc unlike normal node where you would do something like if req.method==="POST"
app.get('/', (req, res) => {
  // res.send is like res.end in node - in express res.send sets the content-type to text/html automatically and res.json sets it to application/json
  // res.send('hello from the server side');

  //by default the status is 200
  //res.status(302)

  res.json({ message: 'hi from the server', app: 'natours' });
});

app.post('/', (req, res) => {
  res.send('this a post reponse from the server!');
});

const port = 9000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
