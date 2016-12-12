var expect    = require("chai").expect;
var db = require("node-localdb");
var auth = require("../authModule");
var modif = require("../modificationModule");
var database = require("../database_manager");

describe("Comprobación del módulo de Autenticación", function() {
	describe("Test de Consulta de ID", function() {
		it("Login de usuario AAA111", function() {
    		auth.getCredentials("AAA111").then(function(u){
    			expect(u).not.to.be.undefined;
    			expect(u).to.deep.equal({UserRole: 'Admin'});
    		});
    	});

    	it("Login de usuario AAA111", function() {
    		auth.getCredentials("AAA222").then(function(u){
    			expect(u).not.to.be.undefined;
    			expect(u).to.deep.equal({UserRole: 'Admin'});
    		});
    	});

    	it("Login de usuario AAA112", function() {
    		auth.getCredentials("AAA111").then(function(u){
    			expect(u).to.be.undefined
    		});
    	});
  	});
});



describe("Tests unitarios módulo modificación", function(){
	//Repoblado de base de datos
	
	database.createDB();
	database.populateDB();
	
	it("Comprobación de encuesta", function(){
		var result = modif.checkSurveyTest();
		expect(result).to.be.true;
		
	});
	
	it("Comprobación de pregunta", function(){
		var result = modif.checkIntegridadPreguntaTest();
		expect(result).to.be.true;
		
	});
	
	it("Modificación de voto (Satisfactorio)", function(){
		var result = modif.changeVoteTestPositive();
		expect(result).not.to.be.undefined;
		
	});
	
	it("Eliminación de voto (Satisfactorio)", function(){
		var result = modif.deleteVoteTestPositive();
		expect(result).to.be.true;
		
	});
	
	

});