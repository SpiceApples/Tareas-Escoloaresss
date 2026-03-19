# Tareas-Escolares - Frontend

Frontend del proyecto **Tareas-Escolares**. Una aplicación web moderna y progresiva (PWA) diseñada para ayudar a los estudiantes a organizar sus tareas, materias y horarios con una experiencia visual premium.

## Contenido
- Descripción
- Características Principales
- Tecnologías Usadas
- Instalación y Ejecución
- Configuración
- PWA (Instalación)

## Descripción
Este es el cliente del proyecto **Tareas-Escolares**, desarrollado con React y Vite. Ofrece una interfaz intuitiva, bilingüe y altamente personalizable, permitiendo a los usuarios gestionar sus periodos académicos de manera eficiente.

## Características Principales

- **Multilingüe**: Sistema de traducción integrado (Español/Inglés) que permite cambiar el idioma de toda la interfaz al instante.
- **PWA (Progressive Web App)**: La aplicación es instalable en Android, iOS y Escritorio, funcionando como una App nativa.
- **Interfaz Premium**: Diseño moderno con efectos de glassmorphism, gradientes suaves y micro-animaciones para una mejor experiencia de usuario.
- **Personalización Total**: Permite asignar colores específicos a cada periodo, materia o tarea para una organización visual rápida.
- **Modo Oscuro/Claro**: Soporte completo para temas claro y oscuro, adaptándose a las preferencias del usuario.
- **Google Login**: Integración simplificada para iniciar sesión mediante cuentas de Google.

## Tecnologías Usadas

| Categoría | Herramienta / Librería | Versión | Propósito |
| --- | --- | --- | --- |
| Framework | React | ^18.3.1 | Biblioteca principal para la UI |
| Build Tool | Vite | ^5.4.11 | Herramienta de compilación ultra rápida |
| Styling | CSS Vanilla | N/A | Estilos personalizados y variables CSS (Theming) |
| Auth | Google GSI | N/A | SDK de Google para autenticación |
| Icons | SVG / Emojis | N/A | Iconografía ligera y compatible |

## Instalación y Ejecución

1. Asegúrate de estar en el directorio `backend/frontend`:
   ```bash
   cd backend/frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Configuración

Crea un archivo `.env` en la carpeta `frontend` con las siguientes variables:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=tu_cliente_id_de_google
```

## PWA (Instalación)

La aplicación incluye un botón interactivo "Instalar App" en la barra lateral para guiar al usuario según su dispositivo:
- **Android/Chrome**: Abre el menú de opciones y selecciona "Instalar aplicación".
- **iOS/Safari**: Toca el botón de compartir y selecciona "Agregar a la pantalla de inicio".

---
Universidad Politécnica de Bacalar  
Desarrollador: Edward Daniel Allen  
Fecha: 12 de Marzo de 2026
