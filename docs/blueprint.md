Documentación de Proyecto: Luz Control
Luz Control es una solución de software diseñada para la gestión centralizada y el control de iluminación inteligente basado en microcontroladores ESP32 y ESP8266, priorizando la autonomía del usuario y la comunicación local eficiente.

🛠 Características Funcionales
1. Gestión Inteligente de Dispositivos
Auto-Discovery: Escaneo automático de la red local (LAN) para la detección de nodos ESP mediante peticiones HTTP.

Administración CRUD: Interfaz completa para agregar (vía IP), editar y eliminar dispositivos.

Persistencia de Datos: Almacenamiento local de configuraciones mediante AsyncStorage, garantizando que la lista de dispositivos se mantenga tras el cierre de la app.

2. Centro de Control de Iluminación
Protocolo de Comunicación: Ejecución de comandos mediante solicitudes HTTP locales (encendido/apagado y niveles de brillo).

Monitoreo en Tiempo Real: Visualización dinámica del estado de cada luminaria mediante sondeo (polling) constante para reflejar cambios inmediatos.

3. Asistente de Configuración Integrado
Onboarding para Desarrolladores: Guía paso a paso (Conectar, Cargar, Monitor serie, Agregar IP) integrada en la interfaz.

Code-Sharing: Sección de ejemplos de código listos para copiar y cargar en el IDE de Arduino, facilitando la implementación de nuevos nodos sin salir de la aplicación.

🎨 Identidad Visual y UI/UX
Concepto de Diseño
La interfaz sigue una estética tecnológica, minimalista y de alto contraste, enfocada en la legibilidad y la precisión operativa.

Paleta de Colores:

Representa precisión y limpieza.

Identifica elementos interactivos clave.

Proporciona un lienzo limpio y moderno.

Tipografía: Inter (Sans-serif) por su naturaleza neutra y excelente legibilidad en pantallas móviles.

Componentes y Experiencia
Layout basado en Tarjetas: Los dispositivos se organizan en contenedores visualmente diferenciados para facilitar la interacción rápida.

Iconografía Lineal: Uso de símbolos concisos (bombillas, sliders, interruptores) para una interpretación intuitiva de acciones.

Micro-interacciones: Retroalimentación háptica y animaciones sutiles en pulsaciones y cambios de estado, mejorando la percepción de respuesta del sistema.
