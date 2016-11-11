var express = require("express");
var bodyparser = require("body-parser");

//Creamos una instancia del servidor
var server = express();

const port = 80;

const HTTP_OK = 200;
const HTTP_BAD_REQ = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_SERVER_ERR = 500;

//Usamos bodyparser en el servidor para poder extraer los json de las peticiones POST
server.use(bodyparser.urlencoded({extended: true}));
server.use(bodyparser.json());

//Enrutador de peticiones para la API
var router = express.Router();

router.get("/api/recontarVotacion", (request, response) => {
	try {
		
		if(!request.query.token) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el token"});
			return;
		}
		
		if(!request.query.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		var token = request.query.token;
		var idVotacion = request.query.idVotacion;
		
		//Comprobar con nuestro módulo de auth si el token es válido
		
		//Hacer la petición al módulo que nos dé los votos de la encuesta y recontarlos
		
		//Respuesta de prueba
		response.json({
			estado: HTTP_OK,
			opciones: [
				{nombre: "Mariano Rajoy", votos: 10},
				{nombre: "Pdro Snchz", votos: 9},
				{nombre: "Pablo Iglesias", votos: 8},
				{nombre: "Albert Rivera", votos: 7}
			]
		});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
});

router.get("/api/modificarVoto", (request, response) => {
	response.status(HTTP_METHOD_NOT_ALLOWED).end("Se debe usar POST en este metodo");
});

router.post("/api/modificarVoto", (request, response) => {
	try {
		
		if(!request.query.token) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el token"});
			return;
		}
		
		if(!request.query.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		if(!request.query.nuevoVoto) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el nuevo voto"});
			return;
		}
		
		var token = request.query.token;
		var idVotacion = request.query.idVotacion;
		var nuevoVoto = request.query.nuevoVoto;
		
		//Hacer todas las comprobaciones oportunas...
		
		response.json({estado: HTTP_OK, mensaje: "Voto modificado satisfactoriamente"});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
});

router.get("/api/eliminarVoto", (request, response) => {
	response.status(HTTP_METHOD_NOT_ALLOWED).end("Se debe usar DELETE en este metodo");
});

router.delete("/api/eliminarVoto", (request, response) => {
	try {
		
		if(!request.query.token) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el token"});
			return;
		}
		
		if(!request.query.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		var token = request.query.token;
		var idVotacion = request.query.idVotacion;
		
		//Hacer todas las comprobaciones y operaciones oportunas...
		
		response.json({estado: HTTP_OK, mensaje: "Voto eliminado satisfactoriamente"});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
});

server.use(router);
server.listen(port, () => {
	console.log("Servidor iniciado en el puerto " + port);
});