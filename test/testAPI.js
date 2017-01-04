var expect = require("chai").expect;
var request = require("sync-request");
var dbModule = require("../database_manager.js");
var crypto = require("../crypto.js");

describe("Tests de la API", function() {
	this.timeout(30000);
	
	before(function() {
		regenerateBD();
	});

	describe("Obtener votacion(es)", function() {
		
		it("Consultar todas las votaciones", function() {
			expect(() => {
				var res = req2obj("/api/verVotaciones", "GET");
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
				var res = req2obj("/api/verVotaciones?detallado=si", "GET");
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
				var res = req2obj("/api/verVotacion?idVotacion=1", "GET");
				expect(res.estado).to.equal(200);
				var votacion = res.votacion;
				expect(votacion).to.be.ok;
				checkVotacion(votacion, false);
			}).to.not.throw("");
		});
		
		it("Consultar una votación existente con detalle", function() {
			expect(() => {
				var res = req2obj("/api/verVotacion?idVotacion=1&detallado=si", "GET");
				expect(res.estado).to.equal(200);
				var votacion = res.votacion;
				expect(votacion).to.be.ok;
				checkVotacion(votacion, true);
			}).to.not.throw("");
		});
		
		it("Consultar una votación inexistente", function() {
			expect(() => {
				var res = req2obj("/api/verVotacion?idVotacion=19999", "GET");
				expect(res.estado).to.equal(404);
			}).to.not.throw("");
		});
		
		it("Consultar una votación con ID no válido", function() {
			expect(() => {
				var res = req2obj("/api/verVotacion?idVotacion=abcdef", "GET");
				expect(res.estado).to.equal(400);
			}).to.not.throw("");
		});
		
		it("Consultar una votación sin especificar ID", function() {
			expect(() => {
				var res = req2obj("/api/verVotacion", "GET");
				expect(res.estado).to.equal(400);
			}).to.not.throw("");
		});
		
		
	});
    
    describe("Emitir votos", function() {
    
        it("Emitir un voto de forma correcta", function() {
            expect(() => {
                regenerateBD();
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(201);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto sin encriptar", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(pregunta.opciones[0].id_opcion);
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto sin voto", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta);
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto sin pregunta", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto con pregunta no válida", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=100000&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto sin token", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var bodyRequest = "idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
        
        it("Emitir un voto con token no válido", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "tokenNoValido";
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/emitirVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(403);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");    
        });
    
    });

    describe("Modificar votos", function() {
        
        it("Modificación correcta de voto", function() {
            expect(() => {
                regenerateBD();
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequestCrearVoto = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var resCrearVoto = req2obj("/api/emitirVoto", "POST", {body: bodyRequestCrearVoto, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(resCrearVoto.estado).to.equal(201);
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(200);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto en encuesta no participada", function() {
            expect(() => {
                regenerateBD();
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[1].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto con nuevo voto sin encriptar", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequestCrearVoto = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&voto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var resCrearVoto = req2obj("/api/emitirVoto", "POST", {body: bodyRequestCrearVoto, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(resCrearVoto.estado).to.equal(201);
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&nuevoVoto=" + encodeURIComponent(pregunta.opciones[0].id_opcion);
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto sin nuevo voto", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta);
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto sin pregunta", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto con pregunta no válida", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=100000&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto sin token", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "test_travisTesting";
                
                var bodyRequest = "idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(400);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
        it("Modificación de voto ton token no válido", function() {
            expect(() => {
                var votaciones = req2obj("/api/verVotaciones?detallado=si", "GET");
				expect(votaciones.estado).to.equal(200);
                var pregunta = votaciones.votaciones[0].preguntas[0];
                var userToken = "tokenNoValido";
                
                var bodyRequest = "token=" + encodeURIComponent(userToken) + "&idPregunta=" + encodeURIComponent(pregunta.id_pregunta) + "&nuevoVoto=" + encodeURIComponent(crypto.encrypt(pregunta.opciones[0].id_opcion));
                var res = req2obj("/api/modificarVoto", "POST", {body: bodyRequest, headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                expect(res.estado).to.equal(403);
                expect(res.mensaje.length > 0).to.be.true;
            }).to.not.throw("");  
        });
        
    });
    
});

function req2obj(url, method, options) {
	var response = request(method, "http://localhost" + (process.env.TRAVIS ? ":8080" : "") + url, options);
	try {
		return JSON.parse(response.getBody("utf-8"));
	} catch(err) {
		//Ignora los códigos de error >=400 del servidor y devuelve el cuerpo de la respuesta de todos modos
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