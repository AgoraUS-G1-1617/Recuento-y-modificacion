var express = require("express");
var bodyparser = require("body-parser");

//Creamos una instancia del servidor
var server = express();

const port = 80;

//Usamos bodyparser en el servidor para poder extraer los json de las peticiones POST
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());

//Enrutador de peticiones para la API
var router = express.Router();

router.get("/api/recontarEncuesta", (request, response) => {
	response.json({status: "ok"});
	//Completar...
});

router.post("/api/modificarEncuesta", (request, response) => {
	response.json({status: "ok"});
	//Completar...
});

server.use(router);
server.listen(port, () => {
	console.log("Servidor iniciado en el puerto " + port);
});