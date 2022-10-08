var express = require("express");
var router = express.Router();
const AWS =require("../config/aws/config")
const client = new AWS.Rekognition();

router.post("/classify", async function (req, res) {
  const file = req.files.file;
  const data = file.data;
  const image = Buffer.from(data, "base64");

  try {
    response = await detectLables(image, 10, 95);
    const labels = response.Labels.map((label) => label.Name);
    console.log(labels.length)
    if (!labels.length)  throw {message:"Unable to find the labels for the given image", status: 204 }
    return res.status(200).json({ labels: labels });
  } catch (err) {
    console.error("Error Log", err);
    const statusCode=err.status || 500
    return res.status(statusCode).json({ error: err.message || "Unable to process the request" });
  }
});

const detectLables = (image, MaxLabels, MinConfidence=75) => {
  const params = {
    Image: { Bytes: image },
    MaxLabels,
    MinConfidence,
  };
  return new Promise((resolve,reject)=>{
    client.detectLabels(params, function(err, response) {
      if (err) return reject(err)
      resolve(response)
    })
  })
};

module.exports = router;