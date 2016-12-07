var db = require('node-localdb');
var now = new Date();
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
	//return new Promise(function(resolve, reject){
	//	console.log("comprobando autenticación");
	
		//if(authToken.vote){
			//permissions.voteModif = true;
		//}else{
		//	permissions.voteModif = false;
		//};
		//resolve(permissions.voteModif);
	//});
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
var checkSurvey = function(votingToken){
	surveyState = null;
	console.log("leyendo base de datos");
	var surveys = db('db/votings.json');
	console.log("fin lectura base de datos");
	survey = null;
		
	surveys.findOne({VotingToken: votingToken}).then(function(data){
		survey = data;
		var surveyDate = processDate(survey.CloseDate);

		if(surveyDate > now){
			surveyState = true;

		}else{
			surveyState = false;
		};
		
		console.log("Estado encuesta: "+surveyState);
	});
	
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

//Modificacion del voto
/*
*Necesario encuesta, token de voto y token de opción de voto
*
*return: modificación del voto indicado
*/
var changeVote = function(votingToken, voterToken, optionToken){
	console.log("iniciando modificación de votos");
	var foundOption = null;
	var deleteVote = null;
	var result = {removedVote: '', 
				addedVote: ''};
	if(permissions.voteModif == true && surveyState){
		var votingOptions = db('db/votingOptions.json')
		console.log("comprobando existencia de opción");
		foundOption = votingOptions.findOne({VotingToken: votingToken, OptionToken: optionToken}).then(function(data){
			if(data != null){
				console.log("verificación de opción completada");
				var votes = db('db/votes.json');
				deleteVote = votes.findOne({VotingToken: votingToken, VoterToken: voterToken}).then(function(voteToRemove){
					console.log("Realizando modificación de voto");
					//Accediendo a DB
					console.log("Id del voto a modificar: "+voteToRemove._id);
					votes.remove({_id: voteToRemove._id}).then(function(removed){
						result.removedVote = removed;
						console.log("removedVote -> "+ result.removedVote);
						var month = now.getMonth() +1;
						var insertDate = now.getDate() + "/" + month + "/" + now.getFullYear();
						votes.insert({VotingToken: votingToken, VoterToken: voterToken, OptionToken: data.OptionToken, VoteDate: insertDate}).then(function(insertedVote){
						console.log("Voto insertado: "+insertedVote); 
						result.addedVote = insertedVote;
						
						console.log(result)
						return result;
						});
					});
				});
			
			}else{
				errorMessage += "Opción no encontrada, no es posible modificar el voto\n\n";
				console.log("Opción no encontrada");
			};
		});
		
	}else{
		console.log("Sin permisos de modificación de voto");
		errorMessage += "No dispone de permisos para modificar su voto\n\n";
	};
	
};

//Eliminacion del voto
/*
*Necesario token de encuesta y token de voto
*
*return voto eliminado
*/

var deleteVote = function(votingToken, voterToken){
	console.log("iniciando borrado del voto");
	var deleteVote = null;
	
	if(permissions.voteModif == true && surveyState){
		var votes = db('db/votes.json');
		console.log("comprobando exixtencia del voto");
		votes.findOne({VotingToken: votingToken, VoterToken: voterToken}).then(function(deleteVote){
			if(deleteVote != null){
			console.log("iniciando borrado");
			votes.remove({VotingToken: votingToken, VoterToken: voterToken});
			}else{
				errorMessage += "Voto no encontrado, no es posible eliminar el voto\n\n";
				console.log("Voto no encontrado");
			};
		});
		
	}else{
		console.log("Sin permisos de eliminación de voto");
		errorMessage += "No dispone de permisos para eliminar su voto\n\n";
	};
};

// Funciones de inicialización del módulo
var init = function(){
	checkPermissions(authenticationToken);
	checkSurvey(surveyToken);
}

//exports.deleteVote = deleteVote;
//exports.changeVote = changeVote;

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

exports.checkPermissionsTestPositive = checkPermissionsTestPositive;

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

exports.checkPermissionsTestNegative = checkPermissionsTestNegative;

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

exports.checkSurveyTestPositive = checkSurveyTestPositive;

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

exports.checkSurveyTestNegative = checkSurveyTestNegative;

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

exports.changeVoteTestPositive = changeVoteTestPositive;


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

		