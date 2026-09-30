# 💍 Invitación de Boda Fredy & Yanet + Carta Interactiva & Control de Asistencias

Landing page para invitación de boda con **carta interactiva de apertura**, **música nupcial automática al presionar el sello** y **control de confirmación de asistencia (RSVP)** conectado a un Excel compartido en **Google Drive (Google Sheets)**.

---

## 📁 Estructura del Proyecto

```text
fredyyanet/
│
├── index.html                     # Invitación principal (Carta interactiva + Folio completo)
├── README.md                      # Documentación completa y guía paso a paso
│
├── assets/
│   ├── css/
│   │   └── style.css              # Placas concéntricas, ramas botánicas, sobre y animaciones
│   │
│   ├── audio/
│   │   ├── musica.mp3             # Canción de fondo (Pachelbel - Canon in D como referencia)
│   │   └── README.md              # Cómo cambiar la canción fácilmente
│   │
│   ├── js/
│   │   ├── envelope.js            # Apertura animada del sobre, solapa y activación musical
│   │   ├── music.js               # Reproductor musical (MP3 con fallback a sintetizador)
│   │   ├── countdown.js           # Cuenta regresiva al 23 de Diciembre de 2026
│   │   ├── rsvp.js                # Validación y envío a Google Sheets + WhatsApp
│   │   └── main.js                # Navegación y modales
│   │
│   └── images/                    # Fotografías locales listas para reemplazar
│       ├── hero-novios.jpg        # Foto principal (enmarcada con flores en 4 esquinas)
│       ├── galeria-1.jpg          # Foto historia 1: "La Alianza Sagrada"
│       ├── galeria-2.jpg          # Foto historia 2: "Caminando Hacia el Futuro"
│       ├── mapa-bg.jpg            # Fondo visual de la tarjeta de ubicación
│       └── README.md              # Medidas recomendadas para cada imagen
│
└── google-sheets-script/
    └── Code.gs                    # Código de Google Apps Script para recibir datos en Google Sheets
```

---

## 🎨 Compilar Estilos Tailwind

La página carga Tailwind desde `assets/css/tailwind.css`, por lo que funciona sin depender del CDN. Para regenerar esa hoja después de modificar clases Tailwind:

```powershell
npm install
npm run build
```

## 💌 1. Carta Interactiva y Reproducción Automática de Música

- Al ingresar a la página web, el invitado es recibido por un **sobre ceremonial con sello en relieve de oro (`F • Y`)**.
- Al presionar el botón **"Tocar Para Abrir Invitación"**:
  1. Suena una campanilla ceremonial armónica.
  2. La solapa triangular del sobre se abre hacia arriba con animación realista.
  3. El sello dorado se desvanece suavemente.
  4. La tarjeta con los nombres y datos asciende desde el interior del sobre.
  5. **La música de fondo (`assets/audio/musica.mp3`) comienza a sonar automáticamente**.
  6. Toda la invitación (contador, itinerario, vestimenta, formulario RSVP, mapa, galería y bendición) se revela para navegar.

### 🎶 ¿Cómo cambiar la canción de fondo?
1. Consigue tu canción favorita en formato **MP3** (vals, balada, instrumental, etc.).
2. Renómbrala exactamente: `musica.mp3`.
3. Pégala en la carpeta `assets/audio/` reemplazando la actual. ¡Listo!

---

## 🚀 2. Cómo Conectar el Formulario a tu Excel de Google Drive (Google Sheets)

### Paso 1: Crear tu Hoja en Google Drive
1. Entra a [Google Drive](https://drive.google.com).
2. Haz clic en **Nuevo > Hojas de cálculo de Google** (Google Sheets).
3. Nómbrala: `Asistencia Boda - Fredy y Yanet`.

### Paso 2: Pegar el Código en Apps Script
1. En el menú superior de tu hoja de cálculo, haz clic en **Extensiones > Apps Script**.
2. Borra el código de ejemplo.
3. Copia todo el contenido de [`google-sheets-script/Code.gs`](file:///d:/Proyectos/PaginasWeb/fredyyanet/google-sheets-script/Code.gs) y pégalo allí.
4. Haz clic en el icono de **Guardar** (disquete).

### Paso 3: Publicar como Aplicación Web
1. Haz clic en **Implementar > Nueva implementación**.
2. En el engranaje ⚙️ (*Seleccionar tipo*), elige **Aplicación web**.
3. Configura:
   - **Descripción**: `RSVP Boda Fredy y Yanet`
   - **Ejecutar como**: `Yo (tu_correo@gmail.com)`
   - **Quién tiene acceso**: **`Cualquier persona`** *(Indispensable para que tus invitados envíen sin iniciar sesión)*
4. Haz clic en **Implementar** y autoriza los permisos requeridos por Google.
5. Copia la **URL de la aplicación web** (la que termina en `/exec`).

### Paso 4: Pegar tu URL en JavaScript
Abre el archivo [`assets/js/rsvp.js`](file:///d:/Proyectos/PaginasWeb/fredyyanet/assets/js/rsvp.js) y en la línea 12 pega tu URL:
```javascript
const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycb...TU_URL.../exec";
```

---

## 🖼️ 3. Reemplazo de Fotografías
Guarda tus fotos en [`assets/images/`](file:///d:/Proyectos/PaginasWeb/fredyyanet/assets/images/) con los mismos nombres:
- `hero-novios.jpg`
- `galeria-1.jpg`
- `galeria-2.jpg`
- `mapa-bg.jpg`
