var express = require("express");
var bodyparser = require("body-parser");

//Creamos una instancia del servidor
var server = express();

const port = 8080;

const HTTP_OK = 200;
const HTTP_BAD_REQ = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_SERVER_ERR = 500;

server.use(bodyparser.urlencoded({extended: true}));
server.use(bodyparser.json());

//Enrutador de peticiones para la API
var router = express.Router();

///////////////////////////////////////////////////////////////////////
/////////////////////   MÉTODOS DE LA API /////////////////////////////
///////////////////////////////////////////////////////////////////////

router.route("/api/recontarVotacion").get((request, response) => {
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
			preguntas: [
				{id_pregunta: 0,
				 titulo: "¿A quién va a votar en las próximas elecciones?",
				 opciones: [
					{id_respuesta: 0, nombre: "Mariano Rajoy", votos: 10},
					{id_respuesta: 1, nombre: "Pdro Snchz", votos: 9},
					{id_respuesta: 2, nombre: "Pablo Iglesias", votos: 8},
					{id_respuesta: 3, nombre: "Albert Rivera", votos: 7}
				]},
				
				{id_pregunta: 1,
				 titulo: "¿Eres mayor de edad?",
				 opciones: [
					{id_respuesta: 0, nombre: "Sí", votos: 40},
					{id_respuesta: 1, nombre: "No", votos: 30}
				]},
				
			]
		});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
}).all(display405error);

router.route("/api/modificarVoto").post((request, response) => {
	try {
		
		if(!request.body.token) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el token"});
			return;
		}
		
		if(!request.body.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		if(!request.body.idPregunta) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la pregunta"});
			return;
		}
		
		if(!request.body.nuevoVoto) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el nuevo voto"});
			return;
		}
		
		var token = request.body.token;
		var idVotacion = request.body.idVotacion;
		var idPregunta = request.body.idPregunta;
		var nuevoVoto = request.body.nuevoVoto;
		
		//Hacer todas las comprobaciones oportunas...
		
		response.json({estado: HTTP_OK, mensaje: "Voto modificado satisfactoriamente"});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
}).all(display405error);

router.route("/api/eliminarVoto").delete((request, response) => {
	try {
		
		if(!request.body.token) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el token"});
			return;
		}
		
		if(!request.body.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		if(!request.body.idPregunta) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la pregunta"});
			return;
		}
		
		var token = request.body.token;
		var idVotacion = request.body.idVotacion;
		var idPregunta = request.body.idPregunta;
		
		//Hacer todas las comprobaciones y operaciones oportunas...
		
		response.json({estado: HTTP_OK, mensaje: "Voto eliminado satisfactoriamente"});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
}).all(display405error);

///////////////////////////////////////////////////////////////////////
///////////////////// Mostrar formulario html /////////////////////////
///////////////////////////////////////////////////////////////////////
server.use(express.static('./'));


server.use(router);

//Para las restantes rutas no especificadas, usar el manejador de 404
server.use(display404error);

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

server.listen(port, () => {
	console.log("Servidor iniciado en el puerto " + port);
});

///////////////////////////////////////////////////////////////////////
/////////////////////   FUNCIONES AUXILIARES //////////////////////////
///////////////////////////////////////////////////////////////////////

function display405error(request, response) {
	response.status(HTTP_METHOD_NOT_ALLOWED).json({estado: HTTP_METHOD_NOT_ALLOWED, mensaje: "Metodo HTTP no soportado"});
}

function display404error(request, response) {
	response.status(HTTP_NOT_FOUND).json({estado: HTTP_NOT_FOUND, mensaje: "Metodo no encontrado"});
}