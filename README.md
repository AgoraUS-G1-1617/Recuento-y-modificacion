# Introducción
Este proyecto corresponde al módulo de Recuento y Modificación de votos de Agora@US 2016/17 del grupo 1.

El [proyecto del año anterior](https://github.com/AgoraUS1516/G01) de este mismo módulo presentaba graves deficiencias: no tenía integración con ningún otro módulo y la interfaz de usuario no funcionaba adecuadamente mostrando Panics. Por tanto, se va a rehacer en NodeJS, ya que es un lenguaje que ayuda a la simplificación y modularización de los componentes internos del módulo.

# Miembros del equipo
- Agustín Borrego Díaz
- David de los Santos Boix
- Rafael García Domínguez
- Manuel Tejero Vela
- Jesús Enrique Bozada Márquez

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
5. Ejecutar el módulo usando `node WebServer.js`

# Peticiones a la API Rest
###URL Base: *Por determinar*

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
- URL: `(GET) /api/recontarVotacion`
- Parámetros:
    - **token**: Obligatorio. Token de sesión del usuario que solicita el recuento.
    - **idVotacion**: Obligatorio. Identificador de la votación que se desea recontar.
- Ejemplo de uso:
    - Petición: `(GET) http://URL_BASE/api/recontarVotacion?token=1234abcde&idVotacion=288`
    - Respuesta: 
    `{"estado":200,"opciones":[{"nombre":"Mariano Rajoy","votos":10},{"nombre":"Pdro Snchz","votos":9},{"nombre":"Pablo Iglesias","votos":8},{"nombre":"Albert Rivera","votos":7}]}`

### Modificar votos
- URL: `(POST) /api/modificarVoto`
- Parámetros:
    - **token**: Obligatorio. Token de sesión del usuario que solicita el cambio de su voto.
    - **idVotacion**: Obligatorio. Identificador de la votación en la que se encuentra el voto a modificar.
    - **nuevoVoto**: Obligatorio. Identificador de la opción a votar.
- Ejemplo de uso:
    - Petición: `(POST) http://URL_BASE/api/modificarVoto?token=1234abcde&idVotacion=288&nuevoVoto=3`
    - Respuesta: *Por determinar*

### Eliminar votos
- URL: `(DELETE) /api/eliminarVoto`
- Parámetros:
  - **token**: Obligatorio. Token de sesión del usuario que solicita la eliminación de su voto.
  - **idVotacion**: Obligatorio. Identificador de la votación en la que se encuentra el voto a eliminar.
- Ejemplo de uso:
    - Petición: `(DELETE) http://URL_BASE/api/eliminarVoto?token=1234abcde&idVotacion=288`
    - Respuesta: *Por determinar*
