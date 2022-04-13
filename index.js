const http = require("http");
const fs = require("fs");
const {
  guardarUsuario,
  getUsuarios,
  editUsuario,
  eliminarUsuario,
  registrarTransferencias,
} = require("./consultas");
const url = require("url");

http
  .createServer(async (req, res) => {
    //Ruta /GET:Devuelve la aplicación cliente disponible en el apoyo de la prueba.
    if (req.url == "/" && req.method == "GET") {
      fs.readFile("index.html", (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end;
        } else {
          res.setHeader("Content-Type", "text/html");
          res.end(data);
        }
      });
    }
    //Ruta /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
    if (req.url == "/usuario" && req.method == "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body = chunk.toString();
      });
      req.on("end", async () => {
        const usuario = Object.values(JSON.parse(body));
        try {
          const result = await guardarUsuario(usuario);
          res.statusCode = 201;
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = 500;
          res.end("Ocurrió un problema en el servidor" + error);
        }
      });
    }
    //Ruta /usuarios GET: Devuelve todos los usuarios registrados con sus balances.
    if (req.url == "/usuarios" && req.method == "GET") {
      try {
        const usuarios = await getUsuarios();
        res.end(JSON.stringify(usuarios));
      } catch (error) {
        res.statusCode = 500;
        res.end("Ocurrió un problema en el servidor" + error);
      }
    }
    //Ruta /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
    if (req.url.startsWith("/usuario?id") && req.method == "PUT") {
      const { id } = url.parse(req.url, true).query;
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        const usuario = JSON.parse(body);
        try {
          const result = await editUsuario(usuario, id);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = 500;
          res.end("Ocurrió un problema en el servidor" + error);
        }
      });
    }
    //Ruta /usuario DELETE: Recibe el id de un usuario registrado y lo elimina .
    if (req.url.startsWith("/usuario?id") && req.method == "DELETE") {
      try {
        let { id } = url.parse(req.url, true).query;
        await eliminarUsuario(id);
        res.end("CUsuario eliminado");
      } catch (error) {
        res.statusCode = 500;
        res.end("Ocurrió un problema en el servidor" + error);
      }
    }
    //Ruta /transferencia POST: Recibe los datos para realizar una nueva transferencia. Se debe ocupar una transacción SQL en la consulta a la base de datos.
    if (req.url == "/transferencia" && req.method == "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body = chunk.toString();
      });
      req.on("end", async () => {
        const transferencia = JSON.parse(body);
        try {
          const result = await registrarTransferencias(transferencia);
          res.statusCode = 201;
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = 500;
          res.end("Ocurrió un problema en el servidor" + error);
        }
      });
    }
  })
  .listen(3000, console.log("Servidor en el puerto 3000 encendido"));
