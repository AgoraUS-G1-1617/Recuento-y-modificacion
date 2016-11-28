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
	console.log("comprobando autenticación");
	
	if(authToken.vote){
		permissions.voteModif = true;
	}else{
		permissions.voteModif = false;
	};

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
						console.log(removed._id)
						var month = now.getMonth() +1;
						var insertDate = now.getDate() + "/" + month + "/" + now.getFullYear();
						votes.insert({VotingToken: votingToken, VoterToken: voterToken, OptionToken: data.OptionToken, VoteDate: insertDate}).then(function(insertedVote){
						console.log("Voto insertado: "+insertedVote); 
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
*Necesario encuesta y token de voto
*
*return voto eliminado
*/
var deleteVote = function(survey, voterToken){
	console.log("iniciando borrado del voto");
	var deleteVote = null;
	
	if(permissions.voteModif == true && surveyState){
		var votes = db('db/votes.json');
		console.log("comprobando exixtencia del voto");
		deleteVote = votes.findOne({VotingToken: survey.VotingToken, VoterToken: voterToken});
		
		if(deleteVote != null){
			console.log("iniciando borrado");
			votes.remove({VotingToken: survey.VotingToken, VoterToken: voterToken});
		}else{
			errorMessage += "Voto no encontrado, no es posible eliminar el voto\n\n";
			console.log("Voto no encontrado");
		};
		
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

//***************************
//Testing********************
//***************************

//Test: comprobación de permisos
var checkPermissionsTestPositive = function(){
	console.log("************ CHECK PERMISSIONS TEST (POSITIVE) *******************");
	var authToken = null;
	authToken={vote:''};
	authToken.vote = true;
	console.log("Test positivo: el acceso a la funcionalidad de modificación está disponible");
	checkPermissions(authToken);
	console.log("Resultado comprobación de permisos de modificación: " + permissions.voteModif); 
};

checkPermissionsTestPositive();

//Test: comprobación de permisos
var checkPermissionsTestNegative = function(){
	console.log("************ CHECK PERMISSIONS TEST (NEGATIVE) *******************");
	var authToken = null;
	authToken={vote:''};
	authToken.vote = false;
	console.log("Test negativo: el acceso a la funcionalidad de modificación no está disponible");
	checkPermissions(authToken);
	console.log("Resultado comprobación de permisos de modificación: " + permissions.voteModif); 
};
console.log("\n")
checkPermissionsTestNegative();


//Test: comprobación de encuesta
var checkSurveyTestPositive = function(){
	console.log("************ CHECK SURVEY STATE (POSITIVE) *******************");
	var votingToken = "BBB111";
	console.log("Test positivo: la encuesta está disponible y permite modificación de voto");
	checkSurvey(votingToken);
};
console.log("\n")
checkSurveyTestPositive();

//Test: comprobación de encuesta
var checkSurveyTestNegative = function(){
	console.log("\n")
	console.log("************ CHECK SURVEY STATE (NEGATIVE) *******************");
	var votingToken = "BBB222";
	console.log("Test negativo: la encuesta ha concluido y no permite modificación de voto");
	checkSurvey(votingToken);
};

setTimeout(function(){
checkSurveyTestNegative()}, 500);

//Test: cambiar voto
var changeVoteTestPositive = function(){
	console.log("\n")
	console.log("************ CHANGE VOTE (POSITIVE) *******************");
	var votingToken = "BBB111";
	var voterToken = "AAA111";
	var optionToken = "CCC222";
	permissions.voteModif = true
	surveyState = true;
	console.log("Test positivo: se permite y se completa la modificación del voto");
	changeVote(votingToken, voterToken, optionToken);
	
};

setTimeout(function(){
changeVoteTestPositive()}, 1000);
		