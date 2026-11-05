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
