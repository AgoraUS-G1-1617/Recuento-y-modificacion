var express = require("express");
var bodyparser = require("body-parser");
var authModule = require("./authModule.js");
var crypto = require("./crypto.js");
var dbManager = require("./database_manager.js");
var fs = require("fs");

//Creamos una instancia del servidor
var server = express();
const port = 80;

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
/////////////////////// COMPROBAR KEYPAIR /////////////////////////////
///////////////////////////////////////////////////////////////////////

var pubKeyExists = fs.existsSync('keypair/public.key');
var privKeyExists = fs.existsSync('keypair/private.key');

if(pubKeyExists && !privKeyExists) {
	console.error("Falta la clave privada, las operaciones de recuento no funcionarán correctamente.");
} else if(!pubKeyExists && privKeyExists) {
	console.error("Falta la clave pública, las operaciones de modificación no funcionarán correctamente.");
} else if(!pubKeyExists && !privKeyExists) {
	console.log("Faltan las claves pública y privada, generando un nuevo par de claves...");
	crypto.generateKeypair();
} 
//else: existen las dos, todo OK

///////////////////////////////////////////////////////////////////////
/////////////////////// COMPROBAR BASE DATOS //////////////////////////
///////////////////////////////////////////////////////////////////////

if(!fs.existsSync("db/database.db")) {
	console.log("Base de datos no encontrada, creando una nueva...");
	dbManager.createDB();
	dbManager.populateDB();
}

///////////////////////////////////////////////////////////////////////
/////////////////////   MÉTODOS DE LA API /////////////////////////////
///////////////////////////////////////////////////////////////////////

router.route("/api/recontarVotacion").get((request, response) => {
	try {
		
		if(!request.query.idVotacion) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
		}
		
		var token = request.query.token;
		var idVotacion = request.query.idVotacion;
		
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
		authModule.getCredentials(token).then(data => {
			
			if(data === undefined) {
				response.status(HTTP_FORBIDDEN).json({estado: HTTP_FORBIDDEN, mensaje: "El token no existe en el módulo de Autenticación ni en nuestra base de datos local"});
				return;
			} else {	
				if(data.UserToken != token) {
					response.status(HTTP_FORBIDDEN).json({estado: HTTP_FORBIDDEN, mensaje: "El token devuelto por la consulta no coincide con el proporcionado como parámetro"});
					return;
				}
				
				//El usuario tiene permisos en este punto.
				response.json({estado: HTTP_OK, mensaje: "Voto modificado satisfactoriamente"});
			}
		});
		
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
		authModule.getCredentials(token).then(data => {
			
			if(data === undefined) {
				response.status(HTTP_FORBIDDEN).json({estado: HTTP_FORBIDDEN, mensaje: "El token no existe en el módulo de Autenticación ni en nuestra base de datos local"});
				return;
			} else {	
				if(data.UserToken != token) {
					response.status(HTTP_FORBIDDEN).json({estado: HTTP_FORBIDDEN, mensaje: "El token devuelto por la consulta no coincide con el proporcionado como parámetro"});
					return;
				}
				
				//El usuario tiene permisos en este punto.
				response.json({estado: HTTP_OK, mensaje: "Voto eliminado satisfactoriamente"});
			}
		});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
}).all(display405error);

router.route("/api/clavePublica").get((request, response) => {
	try {
		
		pubkey = fs.readFileSync("keypair/public.key", "utf-8");
		response.status(HTTP_OK).end(pubkey);
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
	
}).all(display405error);

router.route("/api/verEncuestas").get((request, response) => {
    try {
        
        var detallado = request.query.detallado;
        var encuestas_json = dbManager.getPolls(detallado);
        response.status(HTTP_OK).json({estado: HTTP_OK, encuestas: encuestas_json});
        
    } catch(err) {
        console.log(err);
        response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
    }
}).all(display405error);

router.route("/api/verEncuesta").get((request, response) => {
    try {
        
        if(!request.query.idVotacion) {
            response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "No se ha proporcionado el ID de la votacion"});
			return;
        }
        
        var idVotacion = request.query.idVotacion;
        
        if(isNaN(idVotacion)) {
            response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "El ID de la votacion no es un valor valido"});
			return;
        }
        
        var detallado = request.query.detallado;
        var encuesta_json = dbManager.getPolls(detallado, idVotacion);
        
        if(encuesta_json.length == 0) {
            response.status(HTTP_NOT_FOUND).json({estado: HTTP_NOT_FOUND, mensaje: "No existe ninguna votacion con esa ID"});
			return;
        }
        
        response.status(HTTP_OK).json({estado: HTTP_OK, encuesta: encuesta_json[0]});
        
    } catch(err) {
        console.log(err);
        response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
    }
}).all(display405error);

///////////////////////////////////////////////////////////////////////
///////////////////// MOSTRAR FORMULARIO HTML /////////////////////////
///////////////////////////////////////////////////////////////////////
var options = {
  index: "views/index.html"
};
server.use(express.static('./', options));
server.use(router);

//Para las restantes rutas no especificadas, usar el manejador de 404
server.use(display404error);

///////////////////////////////////////////////////////////////////////
///////////////////////// ARRANCAR SERVIDOR ///////////////////////////
///////////////////////////////////////////////////////////////////////

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