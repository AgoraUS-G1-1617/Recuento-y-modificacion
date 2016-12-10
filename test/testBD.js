var expect    = require("chai").expect;
var dbModule = require("../database_manager");
var fs = require("fs");
var copy = require("fs-extra").copySync;

describe("Comprobación del módulo de Base de Datos", function() {
	this.timeout(30000);
	
	before(function() {
		copy("db/database.db", "db/database.backup");
	});
	
	after(function() {
		copy("db/database.backup", "db/database.db");
		fs.unlinkSync("db/database.backup");
	});
	
	it("Creación de la BD", function() {
		expect(dbModule.createDB).to.not.throw("");
	});
	
	it("Poblado de la BD", function() {
		expect(dbModule.populateDB).to.not.throw("");
	});
	
	it("Listado simple de votaciones", function() {
		expect(() => {dbModule.getPolls(false)}).to.not.throw("");
		var votaciones = dbModule.getPolls(false);
		expect(votaciones.length).to.equal(2);
	});
	
	it("Listado detallado de votaciones", function() {
		expect(() => {dbModule.getPolls(true)}).to.not.throw("");
		var votaciones = dbModule.getPolls(true);
		expect(votaciones.length).to.equal(2);
		expect(votaciones[0]["preguntas"].length).to.equal(1);
		expect(votaciones[1]["preguntas"].length).to.equal(2);
		expect(votaciones[0]["preguntas"][0]["opciones"].length).to.equal(2);
		expect(votaciones[1]["preguntas"][0]["opciones"].length).to.equal(7);
		expect(votaciones[1]["preguntas"][1]["opciones"].length).to.equal(2);
	});
	
});