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

app.post("/api/vehicles", async (request, response) => {
  const { model, label, type, owner, observation } = request.body;
  const db = await openDatabase();
  const data = await db.run(
    `
    INSERT INTO vehicles (model, label, type, owner, observation)
    VALUES (?, ?, ?, ?, ?)
  `,
    [model, label, type, owner, observation]
  );
  db.close();
  response.send({
    id: data.lastID,
    model,
    label,
    type,
    owner,
    observation,
  });
});

app.put("/api/vehicles/:id", async (request, response) => {
  const { model, label, type, owner, observation } = request.body;
  const { id } = request.params;
  const db = await openDatabase();
  const vehicle = await db.get(
    `
    SELECT * FROM vehicles WHERE id = ?
  `,
    [id]
  );
  if (vehicle) {
    const data = await db.run(
      `
      UPDATE vehicles
      SET model = ?,
          label = ?,
          type = ?,
          owner = ?,
          observation = ?
      WHERE id = ?
    `,
      [model, label, type, owner, observation, id]
    );
    db.close();
    response.send({
      id,
      model,
      label,
      type,
      owner,
      observation,
    });
    return;
  }
  db.close();
  response.send(vehicle || {});
});

app.delete("/api/vehicles/:id", async (request, response) => {
  const { id } = request.params;
  const db = await openDatabase();
  const data = await db.run(
    `
    DELETE FROM vehicles WHERE id = ?
  `,
    [id]
  );
  db.close();
  response.send({
    id,
    message: `Veículo [${id}] removido com sucesso`,
  });
});

app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000...");
});
