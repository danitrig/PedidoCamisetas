# 👕 CustomWear Orders - Aplicación de Pedidos de Ropa Personalizada

Aplicación web moderna, elegante y totalmente adaptada a dispositivos móviles (smartphones y tablets) para gestionar pedidos de ropa deportiva y textil personalizada, con base de datos en la nube (Firebase) y hosting 100% gratuito.

---

## 🚀 Características Principales

### 👤 Para los Clientes (Formulario Web en el Móvil)
1. **Cabecera del Pedido**:
   - Fecha del pedido (automática y editable).
   - Nombre y Apellidos.
   - Dirección de envío completa (calle, número, código postal, localidad).
   - Teléfono móvil (integrado con enlace directo de WhatsApp).
   - Correo electrónico.
   - Notas e indicaciones para la entrega.
2. **Prendas del Pedido (Ropa / Camisetas)**:
   - **Subida obligatoria de imagen**: Para cada prenda el cliente debe adjuntar una foto del diseño, camiseta o estampado de referencia (cámara móvil o galería).
   - **Compresión inteligente en el navegador**: Las fotos de 10-15 MB tomadas con el smartphone se optimizan automáticamente a ~300 KB antes de subirse para que la carga sea ultrarrápida y no gaste datos ni espacio.
   - **Talla**: Botones rápidos (XS, S, M, L, XL, 2XL, 3XL, Niño) o talla personalizada.
   - **Nombre a estampar**: Nombre en mayúsculas para la espalda.
   - **Número a estampar**: Dorsal personalizado.
   - **Previsualización en vivo**: Tarjeta dinámica estilo dorsal deportivo que muestra cómo quedará el estampado en tiempo real.
   - Botón para **añadir múltiples prendas** en el mismo pedido.
3. **Confirmación y Seguimiento**:
   - Generación de Código de Pedido único (ej: `PED-839210`).
   - Botón directo para que el cliente envíe una copia del pedido por WhatsApp al vendedor.
   - Pestaña de **"Rastrear Pedido"**: El cliente puede consultar en cualquier momento el estado de su pedido introduciendo su código o teléfono.

---

### 👑 Para el Administrador (Panel de Control)
1. **Acceso Seguro**:
   - Inicio de sesión con correo y contraseña.
   - *Acceso demo inicial para pruebas*: `admin@customwear.com` / contraseña: `admin1234`.
2. **Métricas en tiempo real (KPIs)**:
   - Total de pedidos, pedidos pendientes, en fabricación, enviados y total de prendas.
3. **Búsqueda y Filtros**:
   - Búsqueda instantánea por cliente, teléfono, email, código de pedido o número de seguimiento.
   - Filtros por estado (*Pendientes, 💳 Pagados, En Fabricación, Enviados, Entregados*).
4. **Control Económico (Costes, Precios y Beneficios)**:
   - **Precio de Venta (PVP)**: Lo que se le cobra al cliente por cada prenda.
   - **Precio de Compra**: Lo que se le paga a la fábrica o proveedor.
   - **Precio de Gestión / Portes (Global)**: Campo editable para gastos fijos, cambio de moneda, envíos o comisiones (ej. `+5.00 €`).
   - **Beneficio / Margen Neto**: Cálculo automático en tiempo real (`Total Cobrado - Total Proveedor - Gastos de Gestión`).
5. **Nuevo Estado: `Pagado`**:
   - Flujo de estados: `Pendiente` ➔ `💳 Pagado` ➔ `En Fabricación / Proceso` ➔ `Enviado` ➔ `Entregado`.
6. **Gestión y Edición de Artículos en el Pedido**:
   - Tabla interactiva con columnas: *Foto, Versión (FAN, PLAYER, RETRO, KIDS, etc.), Talla, Nombre/Nº, Parche (YES/NO), Precio Venta y Coste Proveedor*.
   - Botón **`+ Producto`** para añadir artículos nuevos a un pedido existente en cualquier momento.
   - Botón **`✏️ Editar`** y **`🗑️ Borrar`** para modificar o eliminar prendas rápidamente.
7. **Generador de Recibo en PDF para el Cliente**:
   - Botón **`📄 Recibo PDF`**: Genera y descarga al instante un PDF maquetado profesionalmente con el logo, fecha, código de pedido, datos del cliente y desglose de prendas con sus fotos, tallas y dorsales.
   - **Privacidad Total**: En el PDF del cliente **SÓLO aparece el precio que paga el cliente** y el total a pagar, manteniendo completamente ocultos los costes de proveedor y los márgenes de beneficio.
8. **Gestión de Número de Seguimiento (Tracking)**:
   - Selector de empresa de transporte (Correos, Correos Express, SEUR, GLS, MRW, DHL, Nacex, etc.).
   - Campo para introducir el **Número de Seguimiento**.
   - Al guardar, el estado pasa automáticamente a "Enviado".
   - **Botón "Notificar Seguimiento por WhatsApp"**: Redacta y abre WhatsApp automáticamente con un mensaje listo para el cliente con su código de seguimiento y enlace directo de rastreo.
9. **Impresión de Ficha de Taller**: Formato limpio optimizado para imprimir en papel para el equipo de producción con las fotos en alta resolución.

---

## 🛠️ Cómo Probar la Aplicación en tu Ordenador (Modo Local)

1. Haz doble clic en el archivo **`abrir_app.bat`** (o ejecuta en la terminal `python server.py`).
2. Se abrirá automáticamente tu navegador en `http://localhost:8000`.
3. La aplicación cuenta con un **Modo Local (IndexedDB)** automático: puedes crear pedidos de prueba, subir fotos y gestionar el panel de administración de inmediato sin tener que configurar nada primero.

---

## ☁️ Conexión con Firebase (Base de Datos en la Nube 100% Gratuita)

Firebase (de Google) ofrece un plan gratuito permanente (*Spark Plan*) que incluye:
- **Firestore Database**: 50.000 lecturas y 20.000 escrituras al día (mucho más de lo necesario).
- **Firebase Storage**: 5 GB de almacenamiento para las fotos de las prendas.
- **Firebase Authentication**: Usuarios y contraseñas ilimitados.
- **Firebase Hosting**: Alojamiento web gratis con certificado SSL seguro (`https://`).

### Pasos para configurar Firebase en 5 minutos:

1. Ve a [console.firebase.google.com](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google.
2. Pulsa en **"Agregar proyecto"** (nómbralo por ejemplo `pedidos-ropa`).
3. En el menú lateral izquierdo:
   - **Authentication**: Pulsa "Comenzar" -> Pestaña "Método de acceso" -> Habilita **"Correo electrónico/contraseña"**. Luego ve a la pestaña "Users" y crea tu usuario administrador (ej: `tu-email@gmail.com` y tu contraseña).
   - **Firestore Database**: Pulsa "Crear base de datos" -> Selecciona la región (ej: `europe-west`) -> Inicia en modo de prueba.
   - **Storage**: Pulsa "Comenzar" en modo de prueba.
4. En el menú superior izquierdo, pulsa en el engranaje ⚙️ **Configuración del proyecto**.
5. Abajo en "Tus apps", haz clic en el icono web **`</>`**, dale un nombre (ej: `web`) y pulsa registrar.
6. Firebase te mostrará un código con:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
7. **Para conectarlo a tu app**:
   - Puedes abrir el panel de administración en la web, pulsar el botón **"⚙️ Firebase Cloud"** y pegar estos valores directamente en la ventana emergente.
   - O bien pegarlos en el archivo [`js/firebase-config.js`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/js/firebase-config.js).

---

## 🌐 Cómo Publicar la Web Gratis en Internet (Hosting)

Para que cualquier persona pueda entrar desde su teléfono móvil mediante un enlace (ej: pasárselo por WhatsApp o ponerlo en Instagram):

### Opción A: Firebase Hosting (Recomendado y Gratis)
1. Instala Firebase CLI si no lo tienes: `npm install -g firebase-tools`
2. En la terminal dentro de esta carpeta:
   ```bash
   firebase login
   firebase init
   # Selecciona 'Hosting'
   # Usa el proyecto que creaste
   # Directorio público: . (un punto)
   # Configure as a single-page app: Yes
   ```
3. Ejecuta:
   ```bash
   firebase deploy
   ```
4. Te dará un enlace oficial gratuito como: `https://tu-proyecto.web.app`

### Opción B: Vercel o Netlify (Sin usar comandos)
1. Ve a [netlify.com](https://www.netlify.com/) o [vercel.com](https://vercel.com/) (ambos 100% gratuitos).
2. Simplemente arrastra la carpeta `PedidoCamisetas` a su panel de control ("Drop folder to deploy").
3. En 10 segundos tendrás un enlace web público funcional con HTTPS.

---

## 📁 Estructura del Proyecto

- [`index.html`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/index.html) - Página principal (Formulario del cliente + Panel de administrador + Modales).
- [`css/index.css`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/css/index.css) - Sistema de diseño visual moderno, responsive móvil y modo oscuro con toques neón.
- [`js/app.js`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/js/app.js) - Lógica de pedidos, validación de imagen obligatoria y dorsal en vivo.
- [`js/admin.js`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/js/admin.js) - Panel de administración, gestión de número de seguimiento y avisos por WhatsApp.
- [`js/db.js`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/js/db.js) - Capa de base de datos híbrida (Firebase Cloud + Fallback local IndexedDB).
- [`js/firebase-config.js`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/js/firebase-config.js) - Credenciales de Firebase.
- [`firestore.rules`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/firestore.rules) y [`storage.rules`](file:///c:/Users/LAP01/Desktop/Apps%20Propias/PedidoCamisetas/storage.rules) - Reglas de seguridad para Firestore y subida de imágenes.
