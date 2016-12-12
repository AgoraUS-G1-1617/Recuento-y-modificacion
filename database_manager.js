const db = require("sqlite-sync");
const crypto = require("./crypto.js");

function connect() {
	db.connect("db/database.db");
}

function createDB() {
	var command = 	"DROP TABLE IF EXISTS votaciones;" +
					"DROP TABLE IF EXISTS preguntas;" +
					"DROP TABLE IF EXISTS opciones;" +
					"DROP TABLE IF EXISTS votos;" +
					
					"CREATE TABLE votaciones (" +
						"id INTEGER PRIMARY KEY AUTOINCREMENT," +
						"titulo TEXT NOT NULL," +
						"fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP," +
						"fecha_cierre DATETIME NOT NULL" +
					");" +
					
					"CREATE TABLE preguntas (" +
						"id INTEGER PRIMARY KEY AUTOINCREMENT," +
						"texto_pregunta TEXT NOT NULL," +
						"multirespuesta BOOLEAN NOT NULL DEFAULT FALSE," +
						"id_votacion INTEGER NOT NULL," +
						"FOREIGN KEY (id_votacion) REFERENCES votaciones(id)" +
					");" +
					
					"CREATE TABLE opciones (" +
						"id INTEGER PRIMARY KEY AUTOINCREMENT," + 
						"texto_opcion TEXT NOT NULL," +
						"id_pregunta INTEGER NOT NULL," +
						"FOREIGN KEY (id_pregunta) REFERENCES preguntas(id)" +
					");" +
					
					"CREATE TABLE votos (" +
						"id INTEGER PRIMARY KEY AUTOINCREMENT," +
						"token_user TEXT NOT NULL," +
						"fecha DATETIME DEFAULT CURRENT_TIMESTAMP," +
						"id_pregunta INTEGER NOT NULL," +
						"opcion TEXT NOT NULL," +
						"FOREIGN KEY (id_pregunta) REFERENCES preguntas(id)" +
					");";
					
	console.log("Creando base de datos...");
	connect();
	db.run(command, res => {
		if(res.error) throw res.error;
	});
	
	db.close();
	console.log("Base de datos creada con éxito.");
}


function populateDB() {
	console.log("Poblando base de datos...");
	connect();

	var now = new Date();
	var futureDate = formatDate(new Date(now.getTime() + 30 * 24 * 3600 * 1000)); //1 mes en el futuro
	now = formatDate(now);
	
	var idVotacionTortilla = db.insert("votaciones", { titulo: "Votación definitiva sobre la tortilla de patatas", fecha_creacion: now, fecha_cierre: futureDate });
	var idVotacionElecciones = db.insert("votaciones", { titulo: "Encuesta sobre intención de voto", fecha_creacion: now, fecha_cierre: futureDate });
	
	var idPregunta1Tortilla = db.insert("preguntas", { texto_pregunta: "¿Prefiere Ud. la tortilla con o sin cebolla?", multirespuesta: false, id_votacion: idVotacionTortilla});
	var idPregunta1Elecciones = db.insert("preguntas", { texto_pregunta: "¿A qué políticos votaría Ud.?", multirespuesta: true, id_votacion: idVotacionElecciones });
	var idPregunta2Elecciones = db.insert("preguntas", { texto_pregunta: "¿Es Ud. mayor de edad?", multirespuesta: false, id_votacion: idVotacionElecciones });
	
	var idOp1Tortilla = db.insert("opciones", { texto_opcion: "Sin cebolla, y además me gusta devorar gatitos indefensos.", id_pregunta: idPregunta1Tortilla });
	var idOp2Tortilla = db.insert("opciones", { texto_opcion: "Con cebolla, y además rescato a los gatitos abandonados.", id_pregunta: idPregunta1Tortilla });
	
	var idO1P1Elecciones = db.insert("opciones", { texto_opcion: "Mariano Rajoy", id_pregunta: idPregunta1Elecciones });
	var idO2P1Elecciones = db.insert("opciones", { texto_opcion: "Pdro Snchz", id_pregunta: idPregunta1Elecciones });
	var idO3P1Elecciones = db.insert("opciones", { texto_opcion: "Pablo Iglesias", id_pregunta: idPregunta1Elecciones });
	var idO4P1Elecciones = db.insert("opciones", { texto_opcion: "Albert Rivera", id_pregunta: idPregunta1Elecciones });
	var idO5P1Elecciones = db.insert("opciones", { texto_opcion: "Alberto Garzón", id_pregunta: idPregunta1Elecciones });
	var idO6P1Elecciones = db.insert("opciones", { texto_opcion: "Rosa Díez", id_pregunta: idPregunta1Elecciones });
	var idO7P1Elecciones = db.insert("opciones", { texto_opcion: "Kodos", id_pregunta: idPregunta1Elecciones });
	
	var idOP1P2Elecciones = db.insert("opciones", { texto_opcion: "Sí", id_pregunta: idPregunta2Elecciones });
	var idOP1P2Elecciones = db.insert("opciones", { texto_opcion: "No", id_pregunta: idPregunta2Elecciones });
	
	db.insert("votos", { token_user: "AAA111", id_pregunta: idPregunta1Tortilla, opcion: crypto.encrypt(idOp2Tortilla) });
	db.insert("votos", { token_user: "BBB222", id_pregunta: idPregunta1Elecciones, opcion: crypto.encrypt(idO4P1Elecciones) });
	db.insert("votos", { token_user: "BBB111", id_pregunta: idPregunta1Elecciones, opcion: crypto.encrypt(idO7P1Elecciones) });
	db.insert("votos", { token_user: "CCC333", id_pregunta: idPregunta2Elecciones, opcion: crypto.encrypt(idOP1P2Elecciones) });
	
	db.close();
	console.log("Poblado completado con éxito.");
}

function createPoll(data) {
	var now = formatDate(new Date());
	
	connect();
	var idCreated = db.insert("votaciones", { titulo: data.titulo, fecha_creacion: now, fecha_cierre: data.fecha_cierre });
	var preguntas = data.preguntas;
	
	for(var i = 0; i < preguntas.length; i++) {
		var pregunta = preguntas[i];
		var idPregunta = db.insert("preguntas", { texto_pregunta: pregunta.texto_pregunta, multirespuesta: pregunta.multirespuesta, id_votacion: idCreated});
		var opciones = pregunta.opciones;
		
		for(var j = 0; j < pregunta.opciones.length; j++) {
			db.insert("opciones", { texto_opcion: opciones[i], id_pregunta: idPregunta });
		}
	}
	
	db.close();
	
	return idCreated;
}

function addVote(tokenUser, idPregunta, voto) {
	connect();
	var idNewVote = db.insert("votos", { token_user: tokenUser, id_pregunta: idPregunta, opcion: voto });
	db.close();
	return newIdVote();
}

function getPreguntasVotacion(idVotacion) {
	command = "SELECT id AS id_pregunta, texto_pregunta, multirespuesta FROM preguntas WHERE id_votacion = ?";
	connect();
	var preguntas = db.run(command, [idVotacion]);
	db.close();
	return preguntas;
}

function getOpcionesPregunta(idPregunta) {
	command = "SELECT id AS id_opcion, texto_opcion FROM opciones WHERE id_pregunta = ?";
	connect();
	var opciones = db.run(command, [idPregunta]);
	db.close();
	return opciones;
}

function getPolls(detailed, pollId) {
	//Si detailed es true, devolver toda la información (incluyendo preguntas y opciones)
	//Si no, sólo la información básica de la encuesta
	
	command = "SELECT id AS id_votacion, titulo, fecha_creacion, fecha_cierre FROM votaciones";
	
	connect();
    
    if(pollId) {
        command += " WHERE id = ?";
        var votaciones = db.run(command, [pollId]);
    } else {
        var votaciones = db.run(command);
    }
	
	db.close();
	
	if(detailed) {
		for(var i = 0; i < votaciones.length; i++) {
			var votacion = votaciones[i];
			
			var preguntas = getPreguntasVotacion(votacion["id_votacion"]);
			
			for(var j = 0; j < preguntas.length; j++) {
				pregunta = preguntas[j];
				var opciones = getOpcionesPregunta(pregunta["id_pregunta"]);
				pregunta["opciones"] = opciones;
			}
			
			votacion["preguntas"] = preguntas;
		}
	}
	
	return votaciones;
}


function findPollById(pollId){
	
	command = "SELECT id AS id_votacion, titulo, fecha_creacion, fecha_cierre FROM votaciones where id = " + pollId;
	
	connect();
	var poll = db.run(command);
	db.close();
	
	return poll[0];
};

function findPreguntaById(preguntaId){
	
	command = "SELECT * from preguntas where id = " + preguntaId;
	
	connect();
	var pregunta = db.run(command);
	db.close();
	
	return pregunta[0];
};

function findOpcionById(opcionId){
	
	command = "SELECT * from opciones where id = " + opcionId;
	
	connect();
	var opcion = db.run(command);
	db.close();
	
	return opcion;
};

function updateVote(voteId, opcion){
	
	connect();
	
	var update = db.update("votos",{opcion: opcion},{id:voteId});
	db.close();
	
	return update;
}

function getVoteByUserAndPregunta(userToken, preguntaId){
	
	command = "SELECT * from votos where token_user = '"+userToken+"' and id_pregunta = " + preguntaId;
	
	connect();
	var vote = db.run(command);
	db.close();
	
	return vote[0];
};


function deleteVote(voteId){
	command = "delete from votos where id = " + voteId;
	
	connect();
	db.run(command);
	db.close();
	
};


////////////////////////////////////////////////////

function formatDate(date) {
	function f(x) {
		return x<10?"0"+x:x;
	}
	return f(date.getFullYear()) + "-" + f(date.getMonth()+1) + "-" + f(date.getDate()) + " " + f(date.getHours()) + ":" + f(date.getMinutes()) + ":" + f(date.getSeconds());
}

exports.createDB = createDB;
exports.populateDB = populateDB;
exports.addVote = addVote;
exports.getPreguntasVotacion = getPreguntasVotacion;
exports.getOpcionesPregunta = getOpcionesPregunta;
exports.getPolls = getPolls;
exports.findPollById = findPollById;
exports.findPreguntaById = findPreguntaById;
exports.findOpcionById = findOpcionById;
exports.getVoteByUserAndPregunta = getVoteByUserAndPregunta;
exports.deleteVote = deleteVote;
exports.updateVote = updateVote;
exports.createPoll = createPoll;