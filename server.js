const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser")
const dns = require("dns")

const port = process.env.PORT || 3000;
require('dotenv').config();


app.use(bodyParser.urlencoded({extended:false}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let linkTotal = []

app.get("/api/shorturl/:id",(req,res)=>{
  res.redirect(linkTotal[req.params.id])
})


app.post("/api/shorturl",(req,res)=>{
  const urlSent = req.body["url"]
  var urlDns= (urlSent.split('//')[1]?.split("/")[0]) || "error-link"
  dns.lookup(urlDns,(error)=>{
    if(!error){
      linkTotal.indexOf(urlSent)===-1 && linkTotal.push(urlSent)
      res.json({
        original_url:urlSent, 
        short_url: linkTotal.indexOf(urlSent)
      })
    } else{
      res.json({
        message:"Invalid URL"
      })
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
