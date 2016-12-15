## Rama *master* (estable): [![Build Status](https://travis-ci.org/AgoraUS-G1-1617/Recuento-y-modificacion.svg?branch=master)](https://travis-ci.org/AgoraUS-G1-1617/Recuento-y-modificacion)
## Rama *development* (beta): [![Build Status](https://travis-ci.org/AgoraUS-G1-1617/Recuento-y-modificacion.svg?branch=development)](https://travis-ci.org/AgoraUS-G1-1617/Recuento-y-modificacion)

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
### URL base de rama estable (master): https://recuento.agoraus1.egc.duckdns.org
### URL base de rama de desarrollo (development): https://beta.recuento.agoraus1.egc.duckdns.org


**Importante:** la URL estable no tiene por qué corresponder con la versión actualmente desplegada en la rama *master*, normalmente estará algunas versiones por detrás para garantizar la compatibilidad ante cambios repentinos. La URL de desarrollo sí contiene la última versión que se encuentre en cada momento en la rama *development*.

### Códigos de estado HTTP
- **200 (OK)**: Petición atendida con éxito
- **201 (CREATED)**: Recurso creado con éxito
- **400 (BAD REQUEST)**: No se ha proporcionado algún parámetro obligatorio o los parámetros no son válidos.
- **403 (FORBIDDEN)**: El usuario identificado por el token no existe o no tiene permiso para realizar la operación.
- **404 (NOT FOUND)**: El método o el recurso especificado no existe.
- **405 (METHOD NOT ALLOWED)**: El método existe pero el verbo HTTP usado no es el correcto.
- **500 (INTERNAL SERVER ERROR)**: Errores no controlados en el servidor.

### Información adicional
Las respuestas incluyen un campo *estado* que indica el código de estado HTTP asociado, para mayor comodidad. Opcionalmente, también pueden incluir un campo *mensaje* que proporciona información sobre la operación.
    
### Emitir un voto
- URL: `(POST) URL_BASE/api/emitirVoto`
- Parámetros:
    - **token**: Obligatorio. Token de sesión del usuario que emite el voto.
    - **idPregunta**: Obligatorio. Identificador de la pregunta en la que se desea votar.
    - **voto**: Obligatorio. Identificador de la opción a votar, debe estar encriptado.
- Ejemplo de uso:
    - Petición: `(POST) http://URL_BASE/api/emitirVoto`
	- Parámetros de la petición: 
	```
	token=test_123456
	idPregunta=2
	voto=<voto encriptado>
	```
    - Respuesta: `{"estado": 201,  "mensaje": "Voto emitido con éxito"}`
    
### Modificar votos
- URL: `(POST) URL_BASE/api/modificarVoto`
- Parámetros:
    - **token**: Obligatorio. Token de sesión del usuario que solicita el cambio de su voto.
    - **idPregunta**: Obligatorio. Identificador de la pregunta en la que se encuentra el voto a modificar.
    - **nuevoVoto**: Obligatorio. Identificador de la nueva opción a votar, debe estar encriptado.
- Ejemplo de uso:
    - Petición: `(POST) http://URL_BASE/api/modificarVoto`
	- Parámetros de la petición: 
	```
	token=test_123456
	idPregunta=2
	nuevoVoto=<voto encriptado>
	```
    - Respuesta: `{"estado": 200, "mensaje": "Voto modificado con éxito"}`

### Eliminar votos
- URL: `(POST) URL_BASE/api/eliminarVoto`
- Parámetros:
  - **token**: Obligatorio. Token de sesión del usuario que solicita la eliminación de su voto.
  - **idPregunta**: Obligatorio. Identificador de la pregunta en la que se encuentra el voto a modificar.
- Ejemplo de uso:
    - Petición: `(DELETE) http://URL_BASE/api/eliminarVoto`
	- Parámetros de la petición: 
	```
	token=test_123456
	idPregunta=2
	```
    - Respuesta: `{"estado": 200,"mensaje": "Voto eliminado con éxito"}`
    
### Recontar Votación
- URL: `(GET) URL_BASE/api/recontarVotacion`
- Parámetros:
    - **idVotacion**: Obligatorio. Identificador de la votación que se desea recontar.
- Ejemplo de uso:
    - Petición: `(GET) http://URL_BASE/api/recontarVotacion?idVotacion=2`
    - Respuesta: Aún por implementar
    
### Consultar una votación
 - URL: `(GET) URL_BASE/api/verVotacion`
 - Parámetros:
    - **idVotacion**: Obligatorio. ID de la votación sobre la cual obtener información.
    - **detallado**: Opcional. Si se incluye, añade a la información básica de la encuesta las preguntas de cada una y las opciones de cada pregunta. Puede tener cualquier valor.
 - Ejemplo de uso:
    - Petición: `(GET) http://URL_BASE/api/verVotacion?idVotacion=1&detallado=si`
    - Respuesta: ```{"estado":200,"votacion":{"id_votacion":1,"titulo":"Votación definitiva sobre la tortilla de patatas","cp":"12345","fecha_creacion":"2016-12-12 20:39:41","fecha_cierre":"2017-01-11 20:39:41","preguntas":[{"id_pregunta":1,"texto_pregunta":"¿Prefiere Ud. la tortilla con o sin cebolla?","multirespuesta":"false","opciones":[{"id_opcion":1,"texto_opcion":"Sin cebolla, y además me gusta devorar gatitos indefensos."},{"id_opcion":2,"texto_opcion":"Con cebolla, y además rescato a los gatitos abandonados."}]}]}}```
    
### Consultar todas las votaciones
 - URL: `(GET) URL_BASE/api/verVotaciones`
 - Parámetros:
    - **detallado**: Opcional. Si se incluye, añade a la información básica de la encuesta las preguntas de cada una y las opciones de cada pregunta. Puede tener cualquier valor.
    
 - Ejemplo de uso: El JSON tiene el mismo formato que el método anterior, salvo que devuelve un array de objetos de tipo Votación en lugar de uno solo.
  
### Crear una votación
  - URL: `(POST) URL_BASE/api/crearVotacion`
  - Parámetros: El cuerpo de la petición POST debe contener la representación JSON de la votación a crear tal y como se devuelve en los dos métodos anteriores, con un par de cambios: no es necesario incluir ID's (ya que lógicamente no tienen ninguno al estar creando una nueva) y las opciones deben ser simplemente un array de Strings.
  - Ejemplo de uso:
    - Cuerpo de la petición: ```{"titulo":"Votación definitiva sobre la tortilla de patatas","cp":"12345","fecha_cierre":"2017-12-12 13:37:00","preguntas":[{"texto_pregunta":"Pregunta 1","multirespuesta":false,"opciones":["Opción 1 pregunta 1","Opción 2 pregunta 1"]},{"texto_pregunta":"Pregunta 2","multirespuesta":false,"opciones":["Opción 2 pregunta 1","Opción 2 pregunta 2"]}]}```
    - Respuesta:
    ```
    {
    	"estado": 201,
    	"mensaje": "Votación creada correctamente",
    	"id_votacion": 3
    }
    ```
    Devuelve también el ID asignado a la votación recién creada.

### Obtención de clave pública
####Devuelve la clave pública RSA para el encriptado de votos mediante el módulo de [Verificación](https://github.com/AgoraUS-G1-1617/Verification).
- URL: `(GET) URL_BASE/api/clavePublica`
- Parámetros: ninguno
- Ejemplo de respuesta:
`
[48, -126, 1, 34, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -126, 1, 15, 0, 48, -126, 1, 10, 2, -126, 1, 1, 0, -101, -77, 98, -23, 22, 109, -13, -80, 91, 125, -83, 2, 115, -56, -119, 69, -111, 103, 104, 22, -33, -86, 29, 108, 37, -64, -104, -6, -46, -116, -121, -96, -18, 90, -33, -102, 49, 80, 120, -95, -110, 127, 40, -47, 110, 63, 63, -117, 43, 6, 19, -26, 99, -66, 106, 18, -12, 25, -71, 28, -104, 6, -79, -62, 58, -20, 63, -17, -107, 81, -119, -68, 55, 5, 10, -81, 67, -121, -122, 69, 10, 118, 65, 17, 71, -78, 100, -72, 118, -15, -65, 127, -64, -121, -80, 67, 38, -120, -86, -9, -46, 6, -109, 113, 98, 73, 72, 120, -3, -104, -82, 78, -71, -127, -82, 76, 70, -96, -63, 61, 17, 42, 92, -81, 100, -22, 70, 25, -1, 89, -36, 118, 62, 91, 36, 49, -98, 29, 1, -36, -89, 101, 118, 19, 95, -15, 120, -29, -56, 26, -6, 61, -15, -81, 78, -122, 121, -45, -70, 23, -123, 69, -40, -70, 32, -22, 76, -86, 91, 22, 10, 105, -72, -113, -79, 32, 53, 73, -14, -115, 90, 90, 23, 76, -84, 27, 56, 63, -43, 103, 40, -8, 86, -114, -113, 81, 111, 127, 95, 1, -106, -113, 62, -105, 34, 60, 20, -4, 81, -44, -105, 55, -62, -103, -32, 100, -75, -110, 113, -65, -113, -114, -71, 127, -56, 64, -40, 72, 127, 51, -43, -113, 21, 18, 88, 35, -94, -35, 15, -53, -116, 16, -39, 126, -77, 21, 77, -101, -34, 2, -79, -32, -27, -94, -31, 93, 2, 3, 1, 0, 1]
`

**Nota:** El formato de la clave puede estar sujeto a cambios impuestos por el módulo de [Verificación](https://github.com/AgoraUS-G1-1617/Verification). En cualquier caso, el código que se desarrolle debe ser ajeno a este formato, limitándose a obtener la clave y pasarla a Verificación para el encriptado del dato.

# Tokens de usuario
Los tokens de usuario que se envíen se verificarán contra el módulo de Autenticación para comprobar su validez. Si este módulo no está disponible, se comprobará contra nuestra base local de tokens. Para mayor comodidad, se considerarán válidos todos los tokens que comiencen por "test_" para facilitar las pruebas.

# Encriptado de votos
Los votos emitidos en la cabina de votación deben ser encriptados antes de guardarse mediante el módulo de Almacenamiento, para que nadie sepa qué opción votó cada persona. Lógicamente, es el módulo de Recuento el que debe ser capaz de, llegado el momento de recontar una votación, desencriptar cada voto.

En caso de que aún no exista, en el arranque se genera un par de claves RSA y se guardan en la carpeta keypair. La clave privada está añadida a .gitignore, de forma que nunca se sube al repositorio. Cada miembro del equipo tiene una copia en local de la misma, al igual que el servidor de integración continua. La clave pública es expuesta en la API, para que cualquiera pueda conocerla, en especial la cabina de votación.

Nótese que la pérdida de la clave privada provocaría que se deba generar un par de claves nuevo y todos los votos que se hayan encriptado con la clave pública anterior serían irrecuperables.

Las tareas de encriptado, desencriptado y generación de claves las realiza el módulo de [Verificación](https://github.com/AgoraUS-G1-1617/Verification), integrado en el nuestro en forma de .jar que usamos por línea de comandos.
