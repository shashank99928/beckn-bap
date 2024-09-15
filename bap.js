const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/search", async (req, res) => {
  const searchCriteria = req.body;

  const transactionId = uuidv4();

  const context = {
    domain: "financial-services",
    country: "IND",
    city: "std:080",
    action: "search",
    core_version: "1.0.0",
    bap_id: "example-bap.com",
    bap_uri: "https://example-bap.com/beckn",
    transaction_id: transactionId,
    message_id: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  const searchMessage = {
    intent: {
      item: {
        descriptor: {
          name: searchCriteria.loan_type || "Personal Loan",
        },
      },
      fulfillment: {
        customer: {
          person: {
            name: searchCriteria.name || "",
            age: searchCriteria.age || "",
            gender: searchCriteria.gender || "",
          },
        },
      },
    },
  };

  const searchRequest = {
    context: context,
    message: searchMessage,
  };

  try {
    const response = await forwardSearch(searchRequest);
    res.json({
      message: "Search request received",
      ack: true,
      transaction_id: transactionId,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error processing search request",
        error: error.message,
      });
  }
});

app.post("/on_search", (req, res) => {
  const searchResults = req.body;

  const processedResults = processSearchResults(searchResults);

  res.json({ message: "Search results received", ack: true });
});

async function forwardSearch(searchRequest) {
  const bppUrl = "http://localhost:3001/search";
  const response = await axios.post(bppUrl, searchRequest);
  return response.data;
}

function processSearchResults(results) {
  console.log("Received search results:", results);
  return results;
}

const PORT = 3000;
app.listen(PORT, () => console.log(`BAP running on port ${PORT}`));
