const db = require("sqlite-sync");
const crypto = require("./crypto.js");

function connect() {
	db.connect("db/database.db");
}

function createDB() {
	var command = 	"DROP TABLE IF EXISTS VOTACIONES;" +
					"DROP TABLE IF EXISTS PREGUNTAS;" +
					"DROP TABLE IF EXISTS OPCIONES;" +
					"DROP TABLE IF EXISTS VOTOS;" +
					
					"CREATE TABLE VOTACIONES (" +
						"ID INTEGER PRIMARY KEY AUTOINCREMENT," +
						"TITULO TEXT NOT NULL," +
						"FECHA_CREACION DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP," +
						"FECHA_CIERRE DATETIME NOT NULL" +
					");" +
					
					"CREATE TABLE PREGUNTAS (" +
						"ID INTEGER PRIMARY KEY AUTOINCREMENT," +
						"TEXTO_PREGUNTA TEXT NOT NULL," +
						"MULTIRESPUESTA BOOLEAN NOT NULL DEFAULT FALSE," +
						"ID_VOTACION INTEGER NOT NULL," +
						"FOREIGN KEY (ID_VOTACION) REFERENCES VOTACIONES(ID)" +
					");" +
					
					"CREATE TABLE OPCIONES (" +
						"ID INTEGER PRIMARY KEY AUTOINCREMENT," + 
						"TEXTO_OPCION TEXT NOT NULL," +
						"ID_PREGUNTA INTEGER NOT NULL," +
						"FOREIGN KEY (ID_PREGUNTA) REFERENCES PREGUNTAS(ID)" +
					");" +
					
					"CREATE TABLE VOTOS (" +
						"ID INTEGER PRIMARY KEY AUTOINCREMENT," +
						"TOKEN_USER TEXT NOT NULL," +
						"FECHA DATETIME DEFAULT CURRENT_TIMESTAMP," +
						"ID_PREGUNTA INTEGER NOT NULL," +
						"OPCION TEXT NOT NULL," +
						"FOREIGN KEY (ID_PREGUNTA) REFERENCES PREGUNTAS(ID)" +
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
	var futureDate = new Date(now.getTime() + 30 * 24 * 3600 * 1000); //1 mes en el futuro
	
	var idVotacionTortilla = db.insert("VOTACIONES", { TITULO: "Votación definitiva sobre la tortilla de patatas", FECHA_CREACION: now, FECHA_CIERRE: futureDate });
	var idVotacionElecciones = db.insert("VOTACIONES", { TITULO: "Encuesta sobre intención de voto", FECHA_CREACION: now, FECHA_CIERRE: futureDate });
	
	var idPregunta1Tortilla = db.insert("PREGUNTAS", { TEXTO_PREGUNTA: "¿Prefiere Ud. la tortilla con o sin cebolla?", MULTIRESPUESTA: false, ID_VOTACION: idVotacionTortilla});
	var idPregunta1Elecciones = db.insert("PREGUNTAS", { TEXTO_PREGUNTA: "¿A qué políticos votaría Ud.?", MULTIRESPUESTA: true, ID_VOTACION: idVotacionElecciones });
	var idPregunta2Elecciones = db.insert("PREGUNTAS", { TEXTO_PREGUNTA: "¿Es Ud. mayor de edad?", MULTIRESPUESTA: false, ID_VOTACION: idVotacionElecciones });
	
	var idOp1Tortilla = db.insert("OPCIONES", { TEXTO_OPCION: "Sin cebolla, y además me gusta devorar gatitos indefensos.", ID_PREGUNTA: idPregunta1Tortilla });
	var idOp2Tortilla = db.insert("OPCIONES", { TEXTO_OPCION: "Con cebolla, y además rescato a los gatitos abandonados.", ID_PREGUNTA: idPregunta1Tortilla });
	
	var idO1P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Mariano Rajoy", ID_PREGUNTA: idPregunta1Elecciones });
	var idO2P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Pdro Snchz", ID_PREGUNTA: idPregunta1Elecciones });
	var idO3P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Pablo Iglesias", ID_PREGUNTA: idPregunta1Elecciones });
	var idO4P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Albert Rivera", ID_PREGUNTA: idPregunta1Elecciones });
	var idO5P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Alberto Garzón", ID_PREGUNTA: idPregunta1Elecciones });
	var idO6P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Rosa Díez", ID_PREGUNTA: idPregunta1Elecciones });
	var idO7P1Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Kodos", ID_PREGUNTA: idPregunta1Elecciones });
	
	var idOP1P2Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "Sí", ID_PREGUNTA: idPregunta2Elecciones });
	var idOP1P2Elecciones = db.insert("OPCIONES", { TEXTO_OPCION: "No", ID_PREGUNTA: idPregunta2Elecciones });
	
	db.insert("VOTOS", { TOKEN_USER: "AAA111", ID_PREGUNTA: idPregunta1Tortilla, OPCION: crypto.encrypt(idOp2Tortilla) });
	db.insert("VOTOS", { TOKEN_USER: "BBB222", ID_PREGUNTA: idPregunta1Elecciones, OPCION: crypto.encrypt(idO4P1Elecciones) });
	db.insert("VOTOS", { TOKEN_USER: "BBB222", ID_PREGUNTA: idPregunta1Elecciones, OPCION: crypto.encrypt(idO7P1Elecciones) });
	db.insert("VOTOS", { TOKEN_USER: "CCC333", ID_PREGUNTA: idPregunta2Elecciones, OPCION: crypto.encrypt(idOP1P2Elecciones) });
	
	db.close();
	console.log("Poblado completado con éxito.");
}

createDB();
populateDB();