var db = require('node-localdb');
var now = new Date();
now.setHours(now.getHours() + 1);
var errorMessage = "";
var surveyState;
var survey;

//Variable de permisos
var permissions = {
	voteModif: null,
	surveyModif: null
};

//Comprobando permisos de acceso
/*
* Necesario token de autenticacion
*/
var checkPermissions = function(authToken){
	console.log("comprobando autenticación");
	
	if(authToken.vote){
		permissions.voteModif = true;
	};
	
	if(authToken.survey){
		permissions.surveyModif = true;
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
	});
	
	if(Date.parse(survey.CloseDate) > now.getDate()){
		surveyState = true;
		
	}else{
		surveyState = false;
	};
	
	return surveyState;
};

//Modificacion del voto
/*
*Necesario encuesta, token de voto y token de opción de voto
*
*return: modificación del voto indicado
*/
var changeVote = function(survey, voterToken, optionToken){
	console.log("iniciando modificación de votos");
	var foundOption = null;
	var finalVote = null;
	var deleteVote = null;
	
	if(permissions.voteModif == true && surveyState){
		var votingOptions = db('db/votingOptions.json')
		console.log("comprobando existencia de opción");
		foundOption = votingOptions.findOne({VotingToken: survey.VotingToken, OptionToken: optionToken});
		
		if(foundOption != null){
			console.log("verificación de opción completada");
			var votes = db('db/votes.json');
			deleteVote = votes.findOne({VotingToken: survey.VotingToken, VoterToken: voterToken});
			console.log("Realizando modificación de voto");
			
			//Accediendo a DB
			votes.remove({VotingToken: deleteVote.VotingToken, VoterToken: voterToken});
			insertLine(votes, {VotingToken: deleteVote.VotingToken, VoterToken: voterToken, OptionToken: foundOption, VoteDate: now});
		}else{
			errorMessage += "Opción no encontrada, no es posible modificar el voto\n\n";
			console.log("Opción no encontrada");
		};
		
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
		