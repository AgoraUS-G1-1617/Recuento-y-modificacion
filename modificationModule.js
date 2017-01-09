var now = new Date();
var database = require("./database_manager");
const crypto = require("./crypto.js");
now.setHours(now.getHours() + 1);
var errorMessage = "";
var surveyState;
var survey;

//Variable de permisos
var permissions = {
	voteModif: null
};

//Comprobando permisos de acceso
/*
* Necesario token de autenticacion
*/
var checkPermissions = function(authToken){

	console.log("comprobando autenticación");
	
		if(authToken.vote){
			permissions.voteModif = true;
		}else{
			permissions.voteModif = false;
		};
		return permissions.voteModif;
};

//Comprobando integridad de la encuesta
/*
* Necesario token de encuesta
*
*return: estado de la encuesta que posibilita la modificación de votos
*/

var checkSurvey = function(pollId){
	surveyState = null;
	console.log("leyendo base de datos");
	var poll = database.findPollById(pollId);
	console.log("fin lectura base de datos");
	if(poll == null){
		throw "No existe ninguna encuesta con el ID introducido";
	}else{

		if(new Date(poll.fecha_cierre) > new Date()){
			
			surveyState = true;

		}else{
			surveyState = false;
		}
	}
		
	return surveyState;
};

//Procesing dates
/*
*Realiza el parseo de fechas (string -> date) para su comparación
*
*return: type Date
*/
var processDate = function(surveyDate){
	var splitter = surveyDate.split("/");
	result = new Date(splitter[2] + "-" + splitter[1] + "-" + splitter[0]);
		
	if(!result){
		console.log("No se ha introducido una fecha válida");
	}
	return result;
};


//Comprobación integridad pregunta
var checkIntegridadPregunta = function(pollId, preguntaId){
	console.log("Comprobando integridad de la pregunta");
	var pregunta = database.findPreguntaById(preguntaId);
	
	if(!pregunta) {
		throw "La pregunta indicada no existe";
	}

	if(pregunta.id_votacion != pollId) {
		throw "La pregunta no corresponde a la votación indicada";
	}
	
	return true;
};

//Añadir voto
/*
*Necesario: idPregunta, voto
*
*return: voto
*/

var addVote = function(preguntaId, voto){
	console.log("Añadiendo voto");
	var pregunta = database.findPreguntaById(preguntaId);
    
    if(!pregunta) {
        throw "La pregunta indicada no existe";
    }
    
    if(!checkSurvey(pregunta.id_votacion)) {
        throw "La encuesta ya ha finalizado";
    }
	
	if(database.getVoteByUserAndPregunta(voto.token_user, preguntaId) === undefined){
		return database.addVote(voto.token_user, preguntaId, voto.opcion);	
	}else{
		throw "Pregunta incorrecta o el usuario ya ha votado";
	}
};


//Modificacion del voto
/*
*Necesario token de voto y token de opción de voto
*
*return: modificación del voto indicado
*/

var changeVote = function(userToken, preguntaId, options){
	console.log("Iniciando modificación de votos");
	console.log("Comprobando integridad de encuesta");
	
	var pregunta = database.findPreguntaById(preguntaId);
    
    if(!pregunta) {
        throw "La pregunta indicada no existe";
    }
	
	if(checkSurvey(pregunta.id_votacion)){

		if(checkIntegridadPregunta(pregunta.id_votacion, preguntaId) && pregunta != undefined){
			console.log("Procediendo a realizar la modificación");
		
			var voto = database.getVoteByUserAndPregunta(userToken, preguntaId);

			if(!voto) {
				throw "El usuario no ha votado aún en esa pregunta, por lo que no se puede modificar el voto";
				return false;
			}
			database.updateVote(voto.id, options);

			var newVote = database.getVoteByUserAndPregunta(userToken, preguntaId);
			console.log("Voto modificado con exito");
			
			return newVote;
			
		}else{
			throw "La pregunta y/o opción/es no son correcta/s";
			return false;
		}

	}else{
		throw "La encuesta ha finalizado";
		return false;
	}
};


//Eliminacion del voto
/*
*Necesario token de encuesta y token de voto
*
*return voto eliminado
*/

var deleteVote = function(userToken, preguntaId){
	console.log("Iniciando borrado del voto");
	
	var pregunta = database.findPreguntaById(preguntaId);
    
    if(!pregunta) {
        throw "La pregunta indicada no existe";
    }
	
	if(checkSurvey(pregunta.id_votacion)){
		
		if(checkIntegridadPregunta(pregunta.id_votacion, preguntaId) && pregunta != undefined){
			
			try{
				var vote = database.getVoteByUserAndPregunta(userToken, preguntaId);
				if(!vote) {
					throw "El usuario no ha votado aún en esa pregunta, por lo que no se puede eliminar";
				}
				database.deleteVote(vote.id);
				
				console.log("Voto eliminado correctamente");
				return true;
				
			}catch(error){
				throw "No se ha podido eliminar el voto: " + error;
				return false;
			}
		
		}else{
			throw "La pregunta no es correcta, no se ha podido eliminar el voto";
			return false;
		}
		
	}else{
		throw "La encuesta ha finalizado";
		return false;
	}
}


// Funciones de inicialización del módulo
var init = function(){
	checkPermissions(authenticationToken);
	checkSurvey(surveyToken);
}

//***************************
//Testing********************
//***************************
var expect = require("chai").expect;


//Test: comprobación de permisos
var checkPermissionsTestPositive = function(){
	return new Promise(function(resolve, reject){
		permissions.voteModif = null;
		var authToken = null;
		authToken={vote:''};
		authToken.vote = true;
		console.log("Test positivo: el acceso a la funcionalidad de modificación está disponible");
		resolve(checkPermissions(authToken));
	});
	
};


//Test: comprobación de permisos
var checkPermissionsTestNegative = function(){
	return new Promise(function(resolve, reject){
		console.log("\n")
		console.log("************ CHECK PERMISSIONS TEST (NEGATIVE) *******************");
		var authToken = null;
		authToken={vote:''};
		authToken.vote = false;
		console.log("Test negativo: el acceso a la funcionalidad de modificación no está disponible");
		checkPermissions(authToken); 
		resolve(permissions.voteModif);
	});
	
};


//Test: comprobación de encuesta
var checkSurveyTest = function(){
	
	var votingToken = 1;
	return checkSurvey(votingToken);
};

//Test: integridad de pregunta
var checkIntegridadPreguntaTest = function(){
	var pollId = 2;
	var preguntaId = 3;
	
	return checkIntegridadPregunta(pollId, preguntaId);
};

//Test: comprobación de encuesta
var checkSurveyTestNegative = function(){
	return new Promise(function(resolve, reject){
		console.log("\n")
		console.log("\n")
		console.log("************ CHECK SURVEY STATE (NEGATIVE) *******************");
		var votingToken = "BBB222";
		console.log("Test negativo: la encuesta ha concluido y no permite modificación de voto");
		resolve(checkSurvey(votingToken));
	});
	
};

//Test: añadir voto
var addVoteTest = function(){
	var userToken = "AAA111";
	var idPregunta = 2;
	var voto = { token_user: userToken, id_pregunta: idPregunta, opcion: crypto.encrypt("prueba") };
	
	return addVote(idPregunta, voto);
};


//Test: cambiar voto
var changeVoteTestPositive = function(){
	
	var userToken = "BBB222";
	var preguntaId = 2;
	var options = database.getOpcionesPregunta(preguntaId);
	
	return changeVote(userToken, preguntaId, options);
};

var changeVoteTestNegative = function(){
	
	var userToken = "BBB222";
	var preguntaId = 1;
	var options = database.getOpcionesPregunta(preguntaId);
	
	return changeVote(userToken, preguntaId, options);
};


//Test: eliminar voto
var deleteVoteTestPositive = function(){
	
	var userToken = "BBB222";
	var preguntaId = 2;
	var voto = {token_user: "AAA111", id_pregunta: 2, opcion: crypto.encrypt("prueba") };
	return deleteVote(userToken, preguntaId);
};

exports.deleteVoteTestPositive = deleteVoteTestPositive;
exports.changeVoteTestPositive = changeVoteTestPositive;
exports.changeVoteTestNegative = changeVoteTestNegative;
exports.checkSurveyTestNegative = checkSurveyTestNegative;
exports.checkIntegridadPreguntaTest = checkIntegridadPreguntaTest;
exports.checkSurveyTest = checkSurveyTest;
exports.checkPermissionsTestNegative = checkPermissionsTestNegative;
exports.checkPermissionsTestPositive = checkPermissionsTestPositive;
exports.deleteVote = deleteVote;
exports.changeVote = changeVote;
exports.addVoteTest = addVoteTest;
exports.addVote = addVote;