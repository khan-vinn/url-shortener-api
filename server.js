const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const port = process.env.PORT || 3000;
require("dotenv").config();
mongoose
  .connect(process.env.MONGO_ATLASS_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const urlSchema = Schema({
  _id: Schema.Types.ObjectId,
  link: {
    type: String,
    required: true,
  },
});

const UrlModel = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:id", (req, res) => {
  UrlModel.findOne({ _id: req.params.id }, (error, data) => {
    if (error) {
      return res.json({ error: "Dont find link with this :_id" });
    }
    res.redirect(data.link);
  });
});

app.post("/api/shorturl", (req, res) => {
  const urlSent = req.body["url"];
  var dd = urlSent.split("//")[1];
  var urlDns;
  if (dd) {
    urlDns = dd.split("/")[0];
  } else {
    urlDns = "error-link";
  }

  dns.lookup(urlDns, (error) => {
    if (!error) {
      UrlModel.find({ link: urlSent }, (error, data) => {
        if (error) {
          return res.json({
            error: "something was wrong",
          });
        }

        if (data.length >= 1) {
          return res.json({
            original_url: urlSent,
            short_url: data[0]._id,
          });
        } else if (data.length <= 0) {
          let saveUrl = new UrlModel({
            link: urlSent,
            _id: new mongoose.Types.ObjectId(),
          });

          saveUrl.save((error) => {
            console.log("saving link......")
            if (error) {
              return res.json({
                error: "something was wrong",
              });
            }
          });
          res.json({
            original_url: urlSent,
            short_url: saveUrl._id,
          });
        }
      });
    } else {
      res.json({
        error: "invalid url",
      });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
