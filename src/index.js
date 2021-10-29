import express, { request, response } from "express";
import { openDatabase } from "./database.js";
const app = express();

app.use(express.json());

app.get("/api/ping", (request, response) => {
  response.send({
    message: "pong",
  });
});

/* endpoints vehicles */
app.get("/api/vehicles", async (request, response) => {
  const db = await openDatabase();
  const vehicles = await db.all(`
    SELECT * FROM vehicles
  `);
  db.close();

  response.send(vehicles);
});

app.post("/api/vehicles", (request, response) => {});

app.put("/api/vehicles/:id", (request, response) => {});

app.delete("/api/vehicles/:id", (request, response) => {});

app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000...");
});
