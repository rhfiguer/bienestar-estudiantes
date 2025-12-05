# 🎓 Bienestar Estudiantes App

Una aplicación móvil diseñada para mejorar el bienestar estudiantil, ofreciendo contenido multimedia sobre salud mental, productividad, técnicas de estudio y habilidades sociales.

## ✨ Características Principales

*   **📱 Experiencia Móvil Completa**: Navegación fluida, diseño moderno y modo oscuro.
*   **🔐 Autenticación Segura**: Registro e inicio de sesión gestionado por Firebase Auth.
*   **👤 Perfil Personalizado**: Los usuarios pueden actualizar su nombre y foto de perfil.
*   **☁️ Contenido Dinámico**: Todo el contenido (Audio, Video, Texto) se gestiona desde la nube (Firebase Firestore & Storage).
*   **❤️ Favoritos**: Guarda tu contenido preferido en tu biblioteca personal.
*   **🔍 Búsqueda Inteligente**: Encuentra rápidamente lo que necesitas.
*   **🛠️ Panel de Administración**: Interfaz web exclusiva para subir y gestionar contenido (Restringido a administradores).

## 🛠️ Tecnologías

*   **Frontend**: React Native (Expo), TypeScript.
*   **Backend**: Firebase (Authentication, Firestore Database, Storage).
*   **Navegación**: Expo Router.
*   **Multimedia**: Expo AV (Audio/Video).

## 🚀 Cómo Iniciar

### Prerrequisitos
*   Node.js instalado.
*   Cuenta de Expo (opcional pero recomendado).

### Instalación

1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/rhfiguer/bienestar-estudiantes.git
    cd bienestar-estudiantes
    ```

2.  Instalar dependencias:
    ```bash
    npm install
    ```

3.  Configurar Firebase:
    *   Asegúrate de tener el archivo `firebaseConfig.ts` en la raíz del proyecto con tus credenciales.

### Ejecutar la App

**Para Móvil (iOS/Android):**
```bash
npx expo start
```
*   Escanea el código QR con la app **Expo Go** en tu teléfono.

**Para Panel de Administración (Web):**
```bash
npx expo start --web
```
*   Presiona `w` en la terminal o abre el enlace en tu navegador.
*   Ruta de administración: `/admin/upload` (Solo accesible para el admin configurado).

## 📱 Capturas

*(Aquí puedes agregar capturas de pantalla de tu app más adelante)*

---
Desarrollado con ❤️ para el bienestar estudiantil.
