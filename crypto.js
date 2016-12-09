const exec = require("child_process").execSync;
const fs = require("fs");

function generateKeypair() {
    var command = "java -jar verification.jar keys";
    stdout = exec(command, {encoding: "utf8"});
        
    //Parsear las claves pública y privada, separadas por un salto de línea
    var spl = stdout.split("\n");
    var pubKey = spl[0].trim();
    var privKey = spl[1].trim();
    
    fs.writeFile("keypair/public.key", pubKey, "utf8", 0o644, error => {
        if(error) throw error;
        console.log("Clave pública generada.");
    });
    
    fs.writeFile("keypair/private.key", privKey, "utf8", 0o600, error => {
        if(error) throw error;
        console.log("Clave privada generada.");
    });
}

function encrypt(data) {
    //Comprobar que existe la clave pública
    if(!fs.existsSync('keypair/public.key')) {
        throw "No se puede encriptar ya que no existe la clave pública";
    }
    
    var pubKey = fs.readFileSync("keypair/public.key", "utf-8");
    var command = "java -jar verification.jar cipher " + data + " \"" + pubKey + "\"";
    return exec(command, {encoding: "utf8"}).trim();
}

function decrypt(data) {
    //Comprobar que existe la clave privada
    if(!fs.existsSync('keypair/private.key')) {
        throw "No se puede desencriptar ya que no existe la clave privada";
    }
    
    var privKey = fs.readFileSync("keypair/private.key", "utf-8");
    var command = "java -jar verification.jar decipher \"" + data + "\" \"" + privKey + "\"";
    
    return exec(command, {encoding: "utf8"}).trim();
}

exports.generateKeypair = generateKeypair;
exports.encrypt = encrypt;
exports.decrypt = decrypt;