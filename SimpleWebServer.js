//Importamos el módulo http que se encarga de crear el servidor
var http = require("http");

//Definimos el puerto en el que escuchará el servidor
var port = 8080;

//Creamos el servidor, con la función que se encarga de gestionar las respuestas
//Si la función es compleja puede ser mejor idea extraerla fuera
var server = http.createServer((request, response) => {
	//Enviamos un mensaje simple al navegador
	console.log("Handling request from client " + request.connection.remoteAddress + ":" + request.connection.remotePort);
	response.end("<h1>Hello World!</h1>You requested URL: " + request.url);
});

//Iniciamos el servidor
server.listen(port, () => {
	//Función de callback cuando se inicia el servidor
	console.log("Server listening on port " + port);
});