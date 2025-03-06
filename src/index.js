const express = require("express");
const { exec } = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// downloads" folder
const downloadsFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsFolder)) {
  fs.mkdirSync(downloadsFolder);
}

app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "Please provide a YouTube URL." });
  }

  // unique filename
  const outputFilePath = path.join(downloadsFolder, `video_${Date.now()}.mp4`);

  try {
    await exec(videoUrl, {
      output: outputFilePath,
      format: "best",
    });

    // Send the file as a response
    res.download(outputFilePath, "video.mp4", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error sending the video file." });
      }

      // Delete the file after sending it
      fs.unlinkSync(outputFilePath);
    });
  } catch (err) {
    console.error("Error downloading video:", err);
    res.status(500).json({ error: "Error downloading the video." });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
