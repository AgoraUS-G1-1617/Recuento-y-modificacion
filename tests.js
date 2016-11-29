var expect    = require("chai").expect;
var db = require("node-localdb");
var auth = require("./authModule");

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
