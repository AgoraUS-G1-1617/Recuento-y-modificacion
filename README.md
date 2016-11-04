# Introducción
Este proyecto corresponde al módulo de Recuento y Modificación de votos de Agora@US 2016/17 del grupo 1.

El [proyecto del año anterior](https://github.com/AgoraUS1516/G01) de este mismo módulo presentaba graves deficiencias: no tenía integración con ningún otro módulo y la interfaz de usuario no funcionaba adecuadamente mostrando Panics. Por tanto, se va a rehacer en NodeJS, ya que es un lenguaje que ayuda a la simplificación y modularización de los componentes internos del módulo.

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

# Peticiones a la API Rest
*Por determinar*
