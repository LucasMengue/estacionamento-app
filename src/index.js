import express, { request, response } from "express";
const app = express();

app.use(express.json());

app.get("/api/ping", (request, response) => {
  response.send({
    message: "pong",
  });
});

/* endpoints vehicles */
app.get("/api/vehicles", (request, response) => {
  // query string, vem dos parâmetros da URL
  const { id } = request.query;
  const vehicles = [
    {
      id: 1,
      name: "Onix 1.4",
      owner: "Marcus Vinicius",
      type: "car",
    },
    {
      id: 2,
      name: "Cobalt Cinza",
      owner: "Maria Eduarda",
      type: "car",
    },
  ];

  if (id) {
    response.send(vehicles.filter((vehicle) => vehicle.id == id));
    return;
  }

  response.send(vehicles);
});

app.post("/api/vehicles", (request, response) => {});

app.put("/api/vehicles/:id", (request, response) => {});

app.delete("/api/vehicles/:id", (request, response) => {});

app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000...");
});
