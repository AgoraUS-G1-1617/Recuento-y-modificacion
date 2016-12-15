var expect = require("chai").expect;
var request = require("sync-request");
var dbModule = require("../database_manager.js");

describe("Tests de la API", function() {
	this.timeout(30000);
	
	before(function() {
		regenerateBD();
	});
	
	describe("Obtener votacion(es)", function() {
		
		it("Consultar todas las votaciones", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotaciones", "GET");
				expect(res.estado).to.equal(200);
				var votaciones = res.votaciones;
				expect(votaciones.length > 0).to.be.true;
				for(var i = 0; i < votaciones.length; i++) {
					checkVotacion(votaciones[i], false);
				}
			}).to.not.throw("");
		});
		
		it("Consultar todas las votaciones con detalle", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotaciones?detallado=si", "GET");
				expect(res.estado).to.equal(200);
				var votaciones = res.votaciones;
				expect(votaciones.length > 0).to.be.true;
				for(var i = 0; i < votaciones.length; i++) {
					checkVotacion(votaciones[i], true);
				}
			}).to.not.throw("");
		});
		
		it("Consultar una votación existente", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotacion?idVotacion=1", "GET");
				expect(res.estado).to.equal(200);
				var votacion = res.votacion;
				expect(votacion).to.be.ok;
				checkVotacion(votacion, false);
			}).to.not.throw("");
		});
		
		it("Consultar una votación existente con detalle", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotacion?idVotacion=1&detallado=si", "GET");
				expect(res.estado).to.equal(200);
				var votacion = res.votacion;
				expect(votacion).to.be.ok;
				checkVotacion(votacion, true);
			}).to.not.throw("");
		});
		
		it("Consultar una votación inexistente", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotacion?idVotacion=19999", "GET");
				expect(res.estado).to.equal(404);
			}).to.not.throw("");
		});
		
		it("Consultar una votación con ID no válido", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotacion?idVotacion=abcdef", "GET");
				expect(res.estado).to.equal(400);
			}).to.not.throw("");
		});
		
		it("Consultar una votación sin especificar ID", function() {
			expect(() => {
				var res = req2obj("http://localhost/api/verVotacion", "GET");
				expect(res.estado).to.equal(400);
			}).to.not.throw("");
		});
		
		
	});
	
});

function req2obj(url, method, options) {
	var response = request(method, url + (process.env.TRAVIS ? ":8080" : ""), options);
	try {
		return JSON.parse(response.getBody("utf-8"));
	} catch(err) {
		//Ignora los códigos de error >400 del servidor y devuelve el cuerpo de la respuesta de todos modos
		return JSON.parse(err.body.toString("utf-8"));
	}
	
}

function regenerateBD() {
	dbModule.createDB();
	dbModule.populateDB();
}

function checkVotacion(votacion, detallado) {
	expect(votacion.id_votacion > 0).to.be.true;
	expect(votacion.titulo.length > 0).to.be.true;
	expect(Date.parse(votacion.fecha_creacion)).not.to.be.NaN;
	expect(Date.parse(votacion.fecha_cierre)).not.to.be.NaN;
	expect(votacion.cp.length).to.equal(5);
	expect(votacion.cp).not.to.be.NaN;
	
	if(detallado) {
		expect(votacion.preguntas.length > 0).to.be.true;
		for(var i = 0; i < votacion.preguntas.length; i++) {
			var pregunta = votacion.preguntas[i];
			expect(pregunta).to.be.ok;
			expect(pregunta.id_pregunta > 0).to.be.true;
			expect(pregunta.texto_pregunta.length > 0).to.be.true;
			expect(pregunta.multirespuesta == "true" || pregunta.multirespuesta == "false").to.be.true;
			expect(pregunta.opciones.length > 1).to.be.true;
			for(var j = 0; j < pregunta.opciones.length; j++) {
				var opcion = pregunta.opciones[j];
				expect(opcion).to.be.ok;
				expect(opcion.id_opcion > 0).to.be.true;
				expect(opcion.texto_opcion.length > 0).to.be.true;
			}
		}
	}
}