var Twit = require("twit");
const request = require("request");
const fs = require("fs");
const memes = require("random-memes");
var x = 0;
(http = require("http")), (https = require("https"));

var Stream = require("stream").Transform;

var T = new Twit({
  consumer_key: "YOUR API KEY HERE",
  consumer_secret: "YOUR API KEY SECRET HERE",
  access_token: "YOUR ACCES TOKEN HERE",
  access_token_secret: "YOUR ACCES TOKEN SECRET HERE",
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});
setInterval(() => {
  memes.fromReddit("en").then((meme) => {
    var downloadImageFromURL = (url, filename, callback) => {
      var client = http;
      if (url.toString().indexOf("https") === 0) {
        client = https;
      }

      client
        .request(url, function (response) {
          var data = new Stream();

          response.on("data", function (chunk) {
            data.push(chunk);
          });

          response.on("end", function () {
            fs.writeFileSync(filename, data.read());
          });
        })
        .end();
    };
    downloadImageFromURL(meme.image, "meme.png");
    setTimeout(() => {
      var b64content = fs.readFileSync("meme.png", { encoding: "base64" });
      // first we must post the media to Twitter
      T.post(
        "media/upload",
        { media_data: b64content },
        function (err, data, response) {
          // now we can assign alt text to the media, for use by screen readers and
          // other text-based presentations and interpreters
          var mediaIdStr = data.media_id_string;
          var altText = "";
          var meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: altText },
          };

          T.post(
            "media/metadata/create",
            meta_params,
            function (err, data, response) {
              if (!err) {
                // now we can reference the media and post a tweet (media will attach to the tweet)
                var params = {
                  status: "Posting Memes Every Hour! #meme #memes",
                  media_ids: [mediaIdStr],
                };

                T.post(
                  "statuses/update",
                  params,
                  function (err, data, response) {
                    console.log(data);
                  }
                );
              }
            }
          );
        }
      );
    }, 20000);
  });
  setTimeout(() => {
    fs.unlinkSync("meme.png");
  }, 30000);
}, 3600000);
