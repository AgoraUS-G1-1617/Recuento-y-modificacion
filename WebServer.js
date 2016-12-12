var express = require("express");
var bodyparser = require("body-parser");
var authModule = require("./authModule.js");
var crypto = require("./crypto.js");
var dbManager = require("./database_manager.js");
var modif = require("./modificationModule.js");
var fs = require("fs");

//Creamos una instancia del servidor
var server = express();
const port = 80;

const HTTP_OK = 200;
const HTTP_CREATED = 201;
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
		
		//TODO
		response.status(HTTP_OK).json({estado: HTTP_OK, mensaje: "Recuento de votos aún pendiente de implementación"});
		
		
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
		
		if(isNaN(idVotacion) || isNaN(idPregunta)) {
			response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "Los identificadores no son válidos"});
			return;
		}
		
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
				try {
					modif.changeVote(idVotacion, token, idPregunta, nuevoVoto);
					response.status(HTTP_OK).json({estado: HTTP_OK, mensaje: "Voto modificado con éxito"});
				} catch(err) {
					response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: err});
				}
			}
		});
		
	} catch(err) {
		console.log(err);
		response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
	}
}).all(display405error);

router.route("/api/eliminarVoto").post((request, response) => {
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
				
				if(isNaN(idVotacion) || isNaN(idPregunta)) {
					response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: "Los identificadores no son válidos"});
					return;
				}
				
				//El usuario tiene permisos en este punto.
				try {
					modif.deleteVote(idVotacion, token, idPregunta);
					response.status(HTTP_OK).json({estado: HTTP_OK, mensaje: "Voto eliminado con éxito"});
				} catch(err) {
					response.status(HTTP_BAD_REQ).json({estado: HTTP_BAD_REQ, mensaje: err});
				}
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

router.route("/api/verVotaciones").get((request, response) => {
    try {
        
        var detallado = request.query.detallado;
        var encuestas_json = dbManager.getPolls(detallado);
        response.status(HTTP_OK).json({estado: HTTP_OK, votaciones: encuestas_json});
        
    } catch(err) {
        console.log(err);
        response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
    }
}).all(display405error);

router.route("/api/verVotacion").get((request, response) => {
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
        
        response.status(HTTP_OK).json({estado: HTTP_OK, votacion: encuesta_json[0]});
        
    } catch(err) {
        console.log(err);
        response.status(HTTP_SERVER_ERR).json({estado: HTTP_SERVER_ERR, mensaje: "Error interno del servidor"});
    }
}).all(display405error);

router.route("/api/crearVotacion").post((request, response) => {
	try {
		
		payload = request.body;
		
		// Comprobar los parámetros
		if(!param_ok(payload.titulo)) {
			error(HTTP_BAD_REQ, "La votación debe tener un parámetro 'titulo'", response);
			return;
		} 
		
		if(!param_ok(payload.fecha_cierre)) {
			error(HTTP_BAD_REQ, "La votación debe tener un parámetro 'fecha_cierre'", response);
			return;
		} 
		
		if(!/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(payload.fecha_cierre)) {
			error(HTTP_BAD_REQ, "La fecha de cierre debe tener formato YYYY-MM-DD HH:MM:SS", response);
			return;
		}
		
		var closeDate = Date.parse(payload.fecha_cierre);
		if(isNaN(closeDate)) {
			error(HTTP_BAD_REQ, "La fecha de cierre no es válida", response);
			return;
		}
		
		if(closeDate - (new Date()) < 0) {
			error(HTTP_BAD_REQ, "La fecha de cierre debe estar en el futuro", response);
			return;
		}
			
		
		if(payload.preguntas === undefined || !(payload.preguntas instanceof Array)) {
			error(HTTP_BAD_REQ, "La votación debe tener un parámetro 'preguntas' que debe ser un array", response);
			return;
		}
		
		if(payload.preguntas.length == 0) {
			error(HTTP_BAD_REQ, "El array de preguntas debe contener al menos una pregunta", response);
			return;
		}
		
		for(var i = 0; i < payload.preguntas.length; i++) {
			var pregunta = payload.preguntas[i];
			if(typeof pregunta != "object") {
				error(HTTP_BAD_REQ, "El elemento número " + (i+1) + " del array de preguntas no es válido", response);
				return;
			}
			
			if(!param_ok(pregunta.texto_pregunta)) {
				error(HTTP_BAD_REQ, "La pregunta número " + (i+1) + " debe contener un atributo 'texto_pregunta' válido.", response);
				return;
			}
			
			if(!param_ok(pregunta.multirespuesta) || typeof pregunta.multirespuesta != "boolean") {
				error(HTTP_BAD_REQ, "La pregunta número " + (i+1) + " debe contener un atributo 'multirespuesta' de tipo boolean.", response);
				return;
			}
			
			if(pregunta.opciones === undefined || !(pregunta.opciones instanceof Array)) {
				error(HTTP_BAD_REQ, "La pregunta número " + (i+1) + " debe contener un parámetro 'opciones' que debe ser un array", response);
				return;
			}
		
			if(pregunta.opciones.length == 0) {
				error(HTTP_BAD_REQ, "El array del opciones de la pregunta número " + (i+1) + " debe contener al menos una opción", response);
				return;
			}
			
			for(var j = 0; j < pregunta.opciones.length; j++) {
				if(typeof pregunta.opciones[j] != "string") {
					error(HTTP_BAD_REQ, "La opción " + (j+1) + " de la pregunta " + (i+1) + " no es válida (debe ser un String)", response);
					return;
				}
			}
		}
		
		//Si hemos llegado hasta aquí está todo correcto, crear la votación
		var idVotacionCreada = dbManager.createPoll(payload);
		response.status(HTTP_CREATED).json({estado: HTTP_CREATED, mensaje: "Votación creada correctamente", id_votacion: idVotacionCreada});
		
		
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

function error(code, msg, response) {
	response.status(code).json({estado: code, mensaje: msg}).end();
}

function param_ok(param) {
	return param !== undefined && (typeof param != "string" || param.length > 0);
}