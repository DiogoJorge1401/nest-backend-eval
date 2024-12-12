const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let accessToken = "mocked-access-token";

app.post("/mock-auth/token", (req, res) => {
  const { client_id, client_secret } = req.body;
  if (client_id === "test" && client_secret === "secret") {
    return res.json({
      access_token: accessToken,
    });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/mock-account/open", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (authHeader === `Bearer ${accessToken}`) {
    // Aqui apenas simulamos um OK
    return res.json({ status: "ok" });
  }
  return res.status(401).json({ error: "Unauthorized" });
});

app.post("/mock-transfer", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (authHeader === `Bearer ${accessToken}`) {
    // Simula uma transferência OK
    return res.json({ status: "ok" });
  }
  return res.status(401).json({ error: "Unauthorized" });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Mock backend is running on port ${PORT}`);
});
