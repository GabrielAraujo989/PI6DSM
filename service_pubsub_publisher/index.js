require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { publishCounter } = require("./pubsubPublisher");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-counter", async (req, res) => {
  try {
    const { people } = req.body;

    if (typeof people !== "number") {
      return res.status(400).json({ error: "people precisa ser number" });
    }

    await publishCounter(people);

    res.json({ message: "Enviado ao PubSub", people });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.listen(3333, () => console.log("API rodando na porta 3333"));
