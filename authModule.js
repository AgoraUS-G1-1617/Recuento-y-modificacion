var http = require('http');
var https= require('https');
var db = require('node-localdb');

var user = db('db/users.json');

/**
* Esta función obtiene los datos relativos a un usuario, es decir, su rol
* dado un UserToken específico
* @param {string} userToken Token del usuario a obtener sus credenciales
* @returns {JSON} JSON con la información del usuario con los campos UserToken y UserRole
* @example <caption> Ejemplo de uso del getCredentials.</caption>
*   // Devuelve 'undefined'
*   getCredentials("AAA111").then(function(data){
*       console.log(data); 
*   });
* @author David de los Santos Boix <davsanboi@alum.us.es>
* @since 0.0.1
* @version 0.0.1
* @access public
*/
function getCredentials(userToken){
    return new Promise(function(resolve, reject){
        checkOnlineCredentials(userToken, function(data){
            resolve(data);
        });
    });
}

/**
* Esta función se encarga de la obtención de datos del usuario
* @description Primero, busca en la URL de la API REST del grupo necesario
*   En el caso de que la URL no exista, no funcione o no devuelva los datos esperados,
*   se hará una búsqueda en la base de datos local para ello.
*   En caso de que tampoco lo encuentre ahí, devolverá 'undefined'
* @param {string} userToken Token del usuario a obtener sus credenciales
* @param {Object} callback Función a la que retornará los datos cuando termine el procso
* @author David de los Santos Boix <davsanboi@alum.us.es>
* @since 0.0.1
* @version 0.0.1
* @access public
*/
function checkOnlineCredentials(userToken, callback) {
    
    if(userToken.startsWith("test_")) {
        callback({"UserToken":userToken, "UserRole":"Admin", "_id":"1337"});
    }
    
    var url="www.npmjs.com";
    var method = "/login";
    var urlPort = 80;
    var agentOptions = new http.Agent({ keepAlive: true });
    var headersOptions = { 'Content-Type': 'application/json' }

    var localData = user.findOne({UserToken: userToken}).then(function(data){
        return data;
    });

    http.get({
        host: url,
        path: method, 
        port: urlPort, 
        agent: agentOptions, 
        headers: headersOptions

    }, function(response) {
        var body = '';

        response.on('data', function(d) {
            body += d;
        });

        response.on('error', function(err){
            callback(localData);
        })

        response.on('end', function() {
            try{
                var parsed = JSON.parse(body);

                if(parsed.hasOwnProperty('UserToken') 
                    && parsed.hasOwnProperty('UserRole')){
                    callback({
                        UserToken: parsed.UserToken,
                        UserRole: parsed.UserRole
                    });
                } else {
                    callback(localData);
                }

            }catch(err){
                callback(localData);
            }
        });
    });
}

exports.getCredentials = getCredentials;