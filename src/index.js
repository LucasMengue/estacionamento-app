import express, { request, response } from "express";
import {
  activityCheckin,
  activityCheckout,
  listActivities,
  removeActivity,
} from "./controllers/activitiesController.js";
import {
  insertVehicles,
  listVehicles,
  removeVehicle,
  updateVehicles,
} from "./controllers/vehiclesController.js";

const app = express();

app.use(express.json());

app.get("/api/ping", (request, response) => {
  response.send({
    message: "pong",
  });
});

/* endpoints vehicles */
app.get("/api/vehicles", listVehicles);
app.post("/api/vehicles", insertVehicles);
app.put("/api/vehicles/:id", updateVehicles);
app.delete("/api/vehicles/:id", removeVehicle);

/* endpoints activities */
app.post("/api/activities/checkin", async (request, response) => {
  const { label } = request.body;
  const db = await openDatabase();
  const vehicle = await db.get(
    `
    SELECT * FROM vehicles WHERE label = ?
  `,
    [label]
  );
  if (vehicle) {
    const checkinAt = new Date().getTime();
    const data = db.run(
      `
      INSERT INTO activities (vehicle_id, checkin_at)
      VALUES (?, ?)
    `,
      [vehicle.id, checkinAt]
    );
    db.close();
    response.send({
      vehicle_id: vehicle.id,
      checkin_at: checkinAt,
      message: `Veículo [${vehicle.label}] entrou no estacionamento`,
    });
    return;
  }
  db.close();
  response.send({
    message: `Veículo [${label}] não cadastrado`,
  });
});

app.put("/api/activities/checkout", async (request, response) => {
  const { label, price } = request.body;
  const db = await openDatabase();
  const vehicle = await db.get(
    `
    SELECT * FROM vehicles WHERE label = ?
  `,
    [label]
  );
  if (vehicle) {
    const activityOpen = await db.get(
      `
      SELECT *
      FROM activities
      WHERE vehicle_id = ?
      AND checkout_at IS NULL
    `,
      [vehicle.id]
    );
    if (activityOpen) {
      const checkoutAt = new Date().getTime();
      const data = db.run(
        `
        UPDATE activities
        SET checkout_at = ?,
            price = ?
        WHERE id = ?
      `,
        [checkoutAt, price, activityOpen.id]
      );
      db.close();
      response.send({
        vehicle_id: vehicle.id,
        checkout_at: checkoutAt,
        price: price,
        message: `Veículo [${vehicle.label}] saiu do estacionamento`,
      });
      return;
    }
    db.close();
    response.send({
      message: `Veículo [${label}] não realizou nenhum check-in`,
    });
    return;
  }
  db.close();
  response.send({
    message: `Veículo [${label}] não cadastrado`,
  });
});

app.delete("/api/activities/:id", async (request, response) => {
  const { id } = request.params;
  const db = await openDatabase();
  const data = await db.run(
    `
    DELETE FROM activities WHERE id = ?
  `,
    [id]
  );
  db.close();
  response.send({
    id,
    message: `Atividade [${id}] removida com sucesso`,
  });
});

app.get("/api/activities", async (request, response) => {
  const db = await openDatabase();
  const activities = await db.all(`
    SELECT * FROM activities
  `);
  db.close();

  response.send(activities);
});

app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000...");
});
