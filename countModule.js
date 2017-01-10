var dbManager = require("./database_manager.js");
var crypto = require("./crypto.js");

function recontarVotacion(idVotacion) {
    var votacion = dbManager.getPolls(true, idVotacion);
    
    if(!votacion) {
        throw "La votación indicada no existe";
    }
    
    votacion = votacion[0];
    
    var now = new Date();
    if(new Date(votacion.fecha_cierre) > now) {
        throw "No se puede recontar esta votación ya que aún no ha terminado";
    }
    
    var resultados = [];
    
    for(var i = 0; i < votacion.preguntas.length; i++) {
        var pregunta = votacion.preguntas[i];
        var obj = {id_pregunta: pregunta.id_pregunta, texto_pregunta: pregunta.texto_pregunta, opciones: []};
        
        var votos = dbManager.getVotosPregunta(pregunta.id_pregunta);
        var votosDesencriptados = desencriptarVotos(votos);
        var recuento = opcionesRecontadas(votosDesencriptados);
        
        for(var j = 0; j < pregunta.opciones.length; j++) {
            var opcion = pregunta.opciones[j];
            if(!(opcion.id_opcion in recuento)) {
                var votos = 0;
            } else {
                var votos = recuento[opcion.id_opcion];
            }
            
            obj.opciones.push({id_opcion: opcion.id_opcion, texto_opcion: opcion.texto_opcion, votos: votos});
        }
        
        resultados.push(obj)
    }
    
    return resultados;
}

function desencriptarVotos(votos) {
    var res = [];
    for(var i = 0; i < votos.length; i++) {
        res.push(crypto.decrypt(votos[i].opcion));
    }
    
    return res;
}

function opcionesRecontadas(votos) {
    var res = {};
    for(var i = 0; i < votos.length; i++) {
        var voto = votos[i];
        
        if(!(voto in res)) {
            res[voto] = 0;
        }
        res[voto]++;
    }
    return res;
}

exports.recontarVotacion = recontarVotacion;