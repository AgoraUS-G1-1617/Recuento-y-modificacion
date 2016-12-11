var db = require('node-localdb');
var now = new Date();
var database = require("./database_manager");
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
		console.log("No existe ninguna encuesta con el ID introducido");
	}else{

		if(new Date(poll.fecha_cierre) > now){
			
			surveyState = true;

		}else{
			surveyState = false;
		};
	};
		
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

	return pregunta.id_votacion == pollId;
};

//Comprobación integridad opciones
var checkIntegridadOpciones = function(preguntaId, opciones){
	console.log("Comprobando integridad de la opción");
	var result = true;
	if(opciones.length = 1){
		if(opciones[0].id_pregunta != preguntaId){
			result = false;
		}
		
	}else{
		for(var i = 0; i < opciones.length; i++){
			if(opciones[i].id_pregunta != preguntaId){
				result = false;
				break;
			}
		};
	};
	
	return result;
};

//Modificacion del voto
/*
*Necesario encuesta, token de voto y token de opción de voto
*
*return: modificación del voto indicado
*/

var changeVote = function(pollId, userToken, preguntaId, options){
	console.log("Iniciando modificación de votos");
	console.log("Comprobando integridad de encuesta");
	if(checkSurvey(pollId)){

		if(checkIntegridadPregunta(pollId, preguntaId) && checkIntegridadOpciones(preguntaId, options)){
			console.log("Procediendo a realizar la modificación");
		
			var voto = database.getVoteByUserAndPregunta(userToken, preguntaId);

			console.log("Modificando voto");
			database.updateVote(voto.id, options);

			var newVote = database.getVoteByUserAndPregunta(userToken, preguntaId);
			console.log("Voto modificado con exito");
			
			return newVote;
			
		}else{
			console.log("La pregunta y/o opción/es no son correcta/s");
		};

	}else{
		console.log("La encuesta ha finalizado");
	}
};


//Eliminacion del voto
/*
*Necesario token de encuesta y token de voto
*
*return voto eliminado
*/

var deleteVote = function(pollId, userToken, preguntaId){
	console.log("Iniciando borrado del voto");
	if(checkSurvey(pollId)){
		
		if(checkIntegridadPregunta(pollId, preguntaId)){
			
			try{
				var vote = database.getVoteByUserAndPregunta(userToken, preguntaId);
				database.deleteVote(vote.id);
				console.log("Voto eliminado correctamente");
				
			}catch(error){
				console.log("No se ha podido eliminar el voto: " + error);
			}
		
		}else{
			console.log("La pregunta no es correcta, no se ha podido eliminar el voto");
		};
		
	}else{
		console.log("La encuesta ha finalizado");
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
		console.log("\n")
		console.log("************ CHECK PERMISSIONS TEST (POSITIVE) *******************");
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
var checkSurveyTestPositive = function(){
	return new Promise(function(resolve, reject){
		console.log("\n")
		console.log("************ CHECK SURVEY STATE (POSITIVE) *******************");
		var votingToken = "BBB111";
		console.log("Test positivo: la encuesta está disponible y permite modificación de voto");
		resolve(checkSurvey(votingToken));
	});
	
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


//Test: cambiar voto
var changeVoteTestPositive = function(){
	return new Promise(function(resolve, reject){
		console.log("\n")
		console.log("************ CHANGE VOTE (POSITIVE) *******************");
		var votingToken = "BBB111";
		var voterToken = "AAA111";
		var optionToken = "CCC222";
		permissions.voteModif = true
		surveyState = true;
		console.log("Test positivo: se permite y se completa la modificación del voto");
		resolve(changeVote(votingToken, voterToken, optionToken));
	});
	
	
};


//Test: eliminar voto
var deleteVoteTestPositive = function(){
	return new Promise(function(resolve, reject){
		var votingToken = "BBB111";
		var voterToken = "AAA111";
		permissions.voteModif = true
		surveyState = true;
		resolve(deleteVote(votingToken, voterToken));
	});
};

exports.deleteVoteTestPositive = deleteVoteTestPositive;
exports.changeVoteTestPositive = changeVoteTestPositive;
exports.checkSurveyTestNegative = checkSurveyTestNegative;
exports.checkSurveyTestPositive = checkSurveyTestPositive;
exports.checkPermissionsTestNegative = checkPermissionsTestNegative;
exports.checkPermissionsTestPositive = checkPermissionsTestPositive;
exports.deleteVote = deleteVote;
exports.changeVote = changeVote;