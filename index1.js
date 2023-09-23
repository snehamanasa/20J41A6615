const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 8008;

app.get("/numbers", async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "No valid URLs provided." });
  }

  const validURLs = urls.filter((url) => isValidURL(url));

  const fetchPromises = validURLs.map((url) => axios.get(url));

  try {
    const responses = await Promise.allSettled(fetchPromises);

    const validResponses = responses
      .filter((response) => response.status === "fulfilled")
      .map((response) => response.value.data.numbers)
      .flat();

    const uniqueNumbers = [...new Set(validResponses)];
    const sortedUniqueNumbers = uniqueNumbers.sort((a, b) => a - b);

    res.json({ numbers: sortedUniqueNumbers });
  } catch (error) {
    console.error("Error processing URLs:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.error(`Invalid URL: ${url}`);
    return false;
  }
}
