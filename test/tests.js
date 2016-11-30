var expect    = require("chai").expect;
var db = require("node-localdb");
var auth = require("../authModule");
var modif = require("../modificationModule");

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
	it("comprobación de permisos", function(){
		modif.checkPermissionsTestPositive().then(function (result){
			expect(result).to.be.true;
		});
		
	});
	
	it("comprobación de permisos", function(){
		modif.checkPermissionsTestNegative().then(function(result){
			expect(result).to.be.false;
		});
		
	});
	
	it("comprobación de encuesta", function(){
		modif.checkSurveyTestPositive().then(function(result){
			expect(result).to.be.true;
		});
		
	});
	
	it("comprobación de encuesta", function(){
		modif.checkSurveyTestNegative().then(function(result){
			expect(result).to.be.false;
		});
		
	});
	
	it("comprobación de modificación de voto", function(){
		modif.changeVoteTestPositive().then(function(result){
			expect(result).not.to.be.undefined;
		});
	});
	
	//console.log("\n")
	//checkPermissionsTestNegative();
	//console.log("\n")
	//checkSurveyTestPositive();
	//setTimeout(function(){
	//checkSurveyTestNegative()}, 500);
	//setTimeout(function(){
	//changeVoteTestPositive()}, 1000);
});