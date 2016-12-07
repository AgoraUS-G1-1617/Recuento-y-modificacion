# Introducción
Este proyecto corresponde al módulo de Recuento y Modificación de votos de Agora@US 2016/17 del grupo 1.

El [proyecto del año anterior](https://github.com/AgoraUS1516/G01) de este mismo módulo presentaba graves deficiencias: no tenía integración con ningún otro módulo y la interfaz de usuario no funcionaba adecuadamente mostrando Panics. Por tanto, se va a rehacer en NodeJS, ya que es un lenguaje que ayuda a la simplificación y modularización de los componentes internos del módulo.

# Miembros del equipo
- Agustín Borrego Díaz ([@agubelu](https://github.com/agubelu))
- David de los Santos Boix ([@Dionakra](https://github.com/Dionakra))
- Rafael García Domínguez ([@rafgardom](https://github.com/rafgardom))
- Manuel Tejero Vela ([@mantejvel](https://github.com/mantejvel))
- Jesús Enrique Bozada Márquez ([@enruiq](https://github.com/enruiq))

# Organización del repositorio
Existen dos ramas principales, "development" y "master". Sobre la rama *development* se efectuarán todos los cambios durante el desarrollo de la aplicación, y eventualmente se crearán ramas sobre ésta para implementar funcionalidades si se considerase necesario. La rama *master* contendrá sólo versiones que se consideren estables, y por lo tanto es la que debería ser usada por los demás equipos para realizar la integración.

# Estructura
La estructura interna del módulo está sujeta a cambios, pero en este momento es la siguiente:

- **API Rest:** Encargado de recibir las peticiones externas y coordinar las operaciones necesarias para mostrar los resultados requeridos.
- **Autenticación:** Encargado de comprobar que los datos de autenticación proporcionados a la API son correctos y el usuario tiene permiso para realizar la operación que solicita.
- **Recuento:** Encargado de obtener los votos de la votación especificada y proporcionar los resultados de la misma en un formato sencillo y fácil de interpretar.
- **Modificación:** Encargado de efectuar los cambios que se requieran sobre los votos de una determinada votación.
- **Interfaz gráfica:** Encargada de mostrar en un navegador los resultados de una encuesta de forma sencilla. No busca reemplazar al frontend general de la aplicación sino proveer una interfaz visual para el testeo del módulo.

# Funcionamiento
Los componentes se comunican internamente usando los métodos provistos para ello en NodeJS. Cada componente es un módulo, que realiza importaciones (*require*) de los demás módulos internos que necesite y emplea los métodos que expone públicamente.

# Instalación
1. Instalar [Node.JS](https://nodejs.org/es/)
2. Clonar el proyecto: `git clone https://github.com/AgoraUS-G1-1617/Recuento-y-modificacion.git`
3. Navegar con la consola a la carpeta del proyecto: `cd Recuento-y-modificacion`
4. Instalar las dependencias del proyecto: `npm install`
5. Ejecutar el módulo usando `npm start`

# Peticiones a la API Rest
### URL base de rama estable (master): https://recuento.agoraus1.egc.duckdns.org/
### URL base de rama de desarrollo (development): https://beta.recuento.agoraus1.egc.duckdns.org/

### Códigos de estado HTTP
- **200 (OK)**: Petición atendida con éxito
- **400 (BAD REQUEST)**: No se ha proporcionado algún parámetro obligatorio o los parámetros no son válidos.
- **403 (FORBIDDEN)**: El usuario identificado por el token no existe o no tiene permiso para realizar la operación.
- **404 (NOT FOUND)**: El método de la API especificado no existe.
- **405 (METHOD NOT ALLOWED)**: El método existe pero el verbo HTTP usado no es el correcto.
- **500 (INTERNAL SERVER ERROR)**: Errores no controlados en el servidor.

### Información adicional
Las respuestas incluyen un campo *estado* que indica el código de estado HTTP asociado, para mayor comodidad. Opcionalmente, también pueden incluir un campo *mensaje* que proporciona información sobre la operación.

### Recontar Votación
- URL: `(GET) URL_BASE/recontarVotacion`
- Parámetros:
    - **idVotacion**: Obligatorio. Identificador de la votación que se desea recontar.
- Ejemplo de uso:
    - Petición: `(GET) http://URL_BASE/recontarVotacion?idVotacion=288`
    - Respuesta: 
    `{"estado":200,"preguntas":[{"id_pregunta":0,"titulo":"¿A quién va a votar en las próximas elecciones?","opciones":[{"id_respuesta":0,"nombre":"Mariano Rajoy","votos":10},{"id_respuesta":1,"nombre":"Pdro Snchz","votos":9},{"id_respuesta":2,"nombre":"Pablo Iglesias","votos":8},{"id_respuesta":3,"nombre":"Albert Rivera","votos":7}]},{"id_pregunta":1,"titulo":"¿Eres mayor de edad?","opciones":[{"id_respuesta":0,"nombre":"Sí","votos":40},{"id_respuesta":1,"nombre":"No","votos":30}]}]}`

### Modificar votos
- URL: `(POST) URL_BASE/modificarVoto`
- Parámetros:
    - **token**: Obligatorio. Token de sesión del usuario que solicita el cambio de su voto.
    - **idVotacion**: Obligatorio. Identificador de la votación en la que se encuentra el voto a modificar.
	- **idPregunta**: Obligatorio. Identificador de la pregunta dentro de la votación en la que se encuentra el voto a modificar.
    - **nuevoVoto**: Obligatorio. Identificador de la opción a votar.
- Ejemplo de uso:
    - Petición: `(POST) http://URL_BASE/modificarVoto`
	- Cuerpo de la petición: 
	```
	token=AAA111
	idVotacion=288
	idPregunta=2
	nuevoVoto=3
	```
    - Respuesta: `{"estado": 200,"mensaje": "Voto modificado satisfactoriamente"}`

### Eliminar votos
- URL: `(DELETE) URL_BASE/eliminarVoto`
- Parámetros:
  - **token**: Obligatorio. Token de sesión del usuario que solicita la eliminación de su voto.
  - **idVotacion**: Obligatorio. Identificador de la votación en la que se encuentra el voto a eliminar.
  - **idPregunta**: Obligatorio. Identificador de la pregunta dentro de la votación en la que se encuentra el voto a modificar.
- Ejemplo de uso:
    - Petición: `(DELETE) http://URL_BASE/eliminarVoto`
	- Cuerpo de la petición: 
	```
	token=AAA111
	idVotacion=288
	idPregunta=2
	```
    - Respuesta: `{"estado": 200,"mensaje": "Voto eliminado satisfactoriamente"}`

### Obtención de clave pública
####Devuelve la clave pública RSA para el encriptado de votos mediante el módulo de Verificación.
- URL: `(GET) URL_BASE/clavePublica`
- Parámetros: ninguno
- Ejemplo de respuesta:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArzCJi1tsADcuCfDirZpJ
w+OXm12yYlDbHGTufspJWBp/uVQw+9HlWskTz3Y9Dyd949i2smlR5HhhY1dwQ+Qp
8z+MNvY5nzUKkgT1eRPpE0VFH9xzVYMQdZvUT64QVd0aXWyebTBXDgyFwHp0mbWA
wyVWq6FIViJ6Nd5CXnOp3exTKsvXGKQrid3Q2jklR/JEx00O1TkZHYuM+HMiDjfC
Ig6rPdYthN78C/AOB7isdUQQl1J5XGY/VT8NHtSvUurSpvyrgGcy9bTLjtA6zSxk
UC6XAW9m7u8ln36NNUb9lBLbrkg6GpNoWIbRzzvtz/jysXfrOGb+TmQQUa+SwJfI
YQIDAQAB
-----END PUBLIC KEY-----
```

# Encriptado de votos
Los votos emitidos en la cabina de votación deben ser encriptados antes de guardarse mediante el módulo de Almacenamiento, para que nadie sepa qué opción votó cada persona. Lógicamente, es el módulo de Recuento el que debe ser capaz de, llegado el momento de recontar una votación, desencriptar cada voto.

En caso de que aún no exista, en el arranque se genera un par de claves RSA y se guardan en la carpeta keypair. La clave privada está añadida a .gitignore, de forma que nunca se sube al repositorio. Cada miembro del equipo tiene una copia en local de la misma, al igual que el servidor de integración continua. La clave pública es expuesta en la API, para que cualquiera pueda conocerla, en especial la cabina de votación.

Nótese que la pérdida de la clave privada provocaría que se deba generar un par de claves nuevo y todos los votos que se hayan encriptado con la clave pública anterior serían irrecuperables.

Las tareas de encriptado, desencriptado y generación de claves las realiza el módulo de Verificación, integrado en el nuestro en forma de .jar que usamos por línea de comandos.
