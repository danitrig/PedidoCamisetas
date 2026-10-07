/**
 * ============================================================================
 * CONTROLADOR DE CLIENTE: FORMULARIO DE PEDIDOS Y CONSULTA DE ESTADO
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado local del formulario
  const state = {
    items: [],
    itemCounter: 0
  };

  // Elementos DOM
  const form = document.getElementById('order-form');
  const itemsContainer = document.getElementById('garments-container');
  const btnAddItem = document.getElementById('btn-add-garment');
  const totalItemsCountEl = document.getElementById('total-items-count');
  const submitBtn = document.getElementById('btn-submit-order');
  const uploadProgressModal = document.getElementById('upload-progress-modal');
  const uploadProgressBar = document.getElementById('upload-progress-bar');
  const uploadProgressText = document.getElementById('upload-progress-text');

  // Modal de Éxito
  const successModal = document.getElementById('order-success-modal');
  const successOrderCodeEl = document.getElementById('success-order-code');
  const successWhatsappBtn = document.getElementById('btn-whatsapp-order');

  // Modal de Consulta / Tracking
  const trackModal = document.getElementById('track-order-modal');
  const btnOpenTrack = document.getElementById('btn-open-track');
  const btnSearchTrack = document.getElementById('btn-search-track');
  const trackInput = document.getElementById('track-code-input');
  const trackResultContainer = document.getElementById('track-result-container');

  // Modal de Zoom de Imagen
  const zoomModal = document.getElementById('image-zoom-modal');
  const zoomImg = document.getElementById('zoomed-image');

  // Inicializar fecha de hoy por defecto
  const dateInput = document.getElementById('order-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  /* --------------------------------------------------------------------------
     AÑADIR PRENDA AL PEDIDO
     -------------------------------------------------------------------------- */
  function addGarment(initialData = null) {
    state.itemCounter++;
    const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const garment = {
      id: itemId,
      number: state.items.length + 1,
      size: initialData?.size || 'M',
      customName: initialData?.customName || '',
      customNumber: initialData?.customNumber || '',
      notes: initialData?.notes || '',
      imageFile: initialData?.imageFile || null,
      imagePreviewUrl: initialData?.imagePreviewUrl || ''
    };

    state.items.push(garment);
    renderGarmentCard(garment);
    updateTotalCounter();
  }

  function renderGarmentCard(garment) {
    const card = document.createElement('div');
    card.className = 'garment-card';
    card.id = `card-${garment.id}`;

    card.innerHTML = `
      <div class="garment-card-header">
        <div class="garment-number-tag">
          <span class="badge-num">${garment.number}</span>
          <span>Prenda #${garment.number}</span>
        </div>
        ${state.items.length > 1 ? `
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-garment" data-id="${garment.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
            Eliminar prenda
          </button>
        ` : ''}
      </div>

      <!-- ZONA DE SUBIDA DE IMAGEN (OBLIGATORIA) -->
      <div class="image-upload-wrapper">
        <label class="form-label">
          <span>Foto o Diseño de la Prenda</span>
          <span class="req">* Obligatoria</span>
        </label>
        
        <div class="image-dropzone ${garment.imagePreviewUrl ? 'has-image' : ''}" id="dropzone-${garment.id}">
          <input type="file" id="file-${garment.id}" accept="image/*" style="display:none">
          
          <div class="dropzone-prompt" style="${garment.imagePreviewUrl ? 'display:none' : 'display:flex'}">
            <div class="dropzone-icon">📷</div>
            <div class="dropzone-title">Haz clic o arrastra la foto de la prenda</div>
            <div class="dropzone-subtitle">JPG, PNG o WEBP (Foto de la camiseta, logo o diseño a estampar)</div>
          </div>

          <div class="image-preview-box" style="${garment.imagePreviewUrl ? 'display:flex' : 'display:none'}">
            <img src="${garment.imagePreviewUrl}" alt="Previsualización" class="preview-thumb btn-zoom-trigger" id="thumb-${garment.id}">
            <div class="preview-details">
              <span class="preview-status">✓ Imagen adjuntada</span>
              <span class="preview-filename" id="fname-${garment.id}">${garment.imageFile ? garment.imageFile.name : 'Imagen seleccionada'}</span>
              <div style="margin-top: 0.4rem; display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-sm btn-secondary btn-change-img" data-id="${garment.id}">Cambiar foto</button>
                <button type="button" class="btn btn-sm btn-secondary btn-zoom-trigger" data-src="${garment.imagePreviewUrl}">Ver ampliada</button>
              </div>
            </div>
          </div>
        </div>
        <div class="image-error-msg" id="err-img-${garment.id}" style="color: var(--accent-rose); font-size: 0.8rem; margin-top: 0.35rem; display: none;">
          ⚠️ Debes adjuntar una foto para esta prenda.
        </div>
      </div>

      <!-- PERSONALIZACIÓN: TALLA, NOMBRE Y NÚMERO -->
      <div class="grid-3">
        <!-- TALLA -->
        <div class="form-group">
          <label class="form-label">Talla <span class="req">*</span></label>
          <div class="size-selector-grid" id="sizes-${garment.id}">
            ${['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Niño'].map(s => `
              <div class="size-btn ${garment.size === s ? 'active' : ''}" data-size="${s}">${s}</div>
            `).join('')}
          </div>
          <input type="text" class="form-control" id="custom-size-${garment.id}" placeholder="O escribe talla especial..." value="${['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Niño'].includes(garment.size) ? '' : garment.size}" style="margin-top: 0.4rem; font-size: 0.82rem; padding: 0.45rem 0.75rem;">
        </div>

        <!-- NOMBRE A ESTAMPAR -->
        <div class="form-group">
          <label class="form-label">Nombre a Estampar</label>
          <input type="text" class="form-control input-custom-name" data-id="${garment.id}" placeholder="Ej: RODRÍGUEZ, CARLOS..." value="${garment.customName}" maxlength="18">
          <small style="color: var(--text-muted); font-size: 0.76rem;">Dejar vacío si no lleva nombre</small>
        </div>

        <!-- NÚMERO A ESTAMPAR -->
        <div class="form-group">
          <label class="form-label">Número a Estampar</label>
          <input type="text" class="form-control input-custom-number" data-id="${garment.id}" placeholder="Ej: 10, 7, 23..." value="${garment.customNumber}" maxlength="4">
          <small style="color: var(--text-muted); font-size: 0.76rem;">Dejar vacío si no lleva dorsal</small>
        </div>
      </div>

      <!-- PREVISUALIZACIÓN EN VIVO ESTILO DORSAL DEPORTIVO -->
      <div class="custom-preview-badge" id="badge-preview-${garment.id}">
        <div class="preview-badge-label">Previsualización de estampado:</div>
        <div class="jersey-back-preview">
          <span class="jersey-preview-name" id="prev-name-${garment.id}">${garment.customName || 'TU NOMBRE'}</span>
          <span class="jersey-preview-num" id="prev-num-${garment.id}">${garment.customNumber || '00'}</span>
        </div>
      </div>
    `;

    itemsContainer.appendChild(card);
    setupGarmentEvents(garment.id);
  }

  /* --------------------------------------------------------------------------
     EVENTOS DE CADA TARJETA DE PRENDA
     -------------------------------------------------------------------------- */
  function setupGarmentEvents(itemId) {
    const card = document.getElementById(`card-${itemId}`);
    if (!card) return;

    const garment = state.items.find(i => i.id === itemId);
    const dropzone = document.getElementById(`dropzone-${itemId}`);
    const fileInput = document.getElementById(`file-${itemId}`);
    const nameInput = card.querySelector('.input-custom-name');
    const numInput = card.querySelector('.input-custom-number');
    const customSizeInput = document.getElementById(`custom-size-${itemId}`);
    const prevName = document.getElementById(`prev-name-${itemId}`);
    const prevNum = document.getElementById(`prev-num-${itemId}`);
    const errImg = document.getElementById(`err-img-${itemId}`);

    // Selección de Talla
    card.querySelectorAll(`#sizes-${itemId} .size-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll(`#sizes-${itemId} .size-btn`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        garment.size = btn.dataset.size;
        customSizeInput.value = '';
      });
    });

    customSizeInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) {
        card.querySelectorAll(`#sizes-${itemId} .size-btn`).forEach(b => b.classList.remove('active'));
        garment.size = e.target.value.trim().toUpperCase();
      }
    });

    // Actualización de Nombre y Número en tiempo real
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.toUpperCase();
      e.target.value = val;
      garment.customName = val;
      prevName.textContent = val || 'TU NOMBRE';
    });

    numInput.addEventListener('input', (e) => {
      const val = e.target.value;
      garment.customNumber = val;
      prevNum.textContent = val || '00';
    });

    // Subida de Imagen por Clic
    dropzone.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-zoom-trigger')) return;
      fileInput.click();
    });

    // Drag and Drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processGarmentImage(itemId, e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processGarmentImage(itemId, e.target.files[0]);
      }
    });

    // Botón eliminar prenda
    const delBtn = card.querySelector('.btn-delete-garment');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteGarment(itemId);
      });
    }

    // Botón Ver Ampliada
    card.querySelectorAll('.btn-zoom-trigger').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = el.dataset.src || garment.imagePreviewUrl;
        if (src) openImageZoom(src);
      });
    });
  }

  function processGarmentImage(itemId, file) {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    const garment = state.items.find(i => i.id === itemId);
    if (!garment) return;

    garment.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      garment.imagePreviewUrl = e.target.result;

      // Actualizar UI del dropzone
      const dropzone = document.getElementById(`dropzone-${itemId}`);
      const prompt = dropzone.querySelector('.dropzone-prompt');
      const previewBox = dropzone.querySelector('.image-preview-box');
      const thumb = document.getElementById(`thumb-${itemId}`);
      const fname = document.getElementById(`fname-${itemId}`);
      const errImg = document.getElementById(`err-img-${itemId}`);

      dropzone.classList.add('has-image');
      prompt.style.display = 'none';
      previewBox.style.display = 'flex';
      thumb.src = e.target.result;
      fname.textContent = file.name;
      if (errImg) errImg.style.display = 'none';

      // Actualizar trigger zoom
      const zoomBtn = previewBox.querySelector('.btn-zoom-trigger');
      if (zoomBtn) zoomBtn.dataset.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function deleteGarment(itemId) {
    if (state.items.length <= 1) {
      showToast('El pedido debe tener al menos una prenda', 'error');
      return;
    }

    state.items = state.items.filter(i => i.id !== itemId);
    const card = document.getElementById(`card-${itemId}`);
    if (card) card.remove();

    // Renumerar prendas restantes
    state.items.forEach((item, index) => {
      item.number = index + 1;
      const c = document.getElementById(`card-${item.id}`);
      if (c) {
        const numTag = c.querySelector('.garment-number-tag');
        if (numTag) {
          numTag.innerHTML = `
            <span class="badge-num">${item.number}</span>
            <span>Prenda #${item.number}</span>
          `;
        }
      }
    });

    updateTotalCounter();
    updateDeleteButtonsVisibility();
  }

  function updateDeleteButtonsVisibility() {
    const isSingle = state.items.length <= 1;
    document.querySelectorAll('.btn-delete-garment').forEach(btn => {
      btn.style.display = isSingle ? 'none' : 'inline-flex';
    });
  }

  function updateTotalCounter() {
    if (totalItemsCountEl) {
      totalItemsCountEl.textContent = state.items.length;
    }
    updateDeleteButtonsVisibility();
  }

  // Evento botón añadir prenda
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
      addGarment();
      // Scroll suave a la nueva prenda
      setTimeout(() => {
        const lastCard = itemsContainer.lastElementChild;
        if (lastCard) {
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    });
  }

  /* --------------------------------------------------------------------------
     VALIDACIÓN Y ENVÍO DEL PEDIDO
     -------------------------------------------------------------------------- */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar Cabecera
      const orderDate = document.getElementById('order-date').value;
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const address = document.getElementById('shipping-address').value.trim();
      const phone = document.getElementById('phone-number').value.trim();
      const email = document.getElementById('email-address').value.trim();
      const notes = document.getElementById('order-notes')?.value.trim() || '';

      if (!firstName || !lastName || !address || !phone || !email) {
        showToast('Por favor completa todos los datos obligatorios de la cabecera', 'error');
        return;
      }

      // Validar Obligatoriedad de Imágenes en todas las prendas
      let hasMissingImages = false;
      state.items.forEach(item => {
        const errImg = document.getElementById(`err-img-${item.id}`);
        if (!item.imageFile && !item.existingImageUrl) {
          hasMissingImages = true;
          if (errImg) errImg.style.display = 'block';
          const card = document.getElementById(`card-${item.id}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          if (errImg) errImg.style.display = 'none';
        }
      });

      if (hasMissingImages) {
        showToast('⚠️ Es obligatorio adjuntar una foto por cada prenda del pedido', 'error');
        return;
      }

      // Preparar Payload
      const orderPayload = {
        orderDate,
        firstName,
        lastName,
        customerName: `${firstName} ${lastName}`,
        address,
        phone,
        email,
        notes,
        status: 'pendiente',
        trackingNumber: '',
        shippingCarrier: '',
        globalManagementFee: 0,
        items: state.items.map(item => ({
          version: item.version || 'FAN',
          size: item.size,
          customName: item.customName,
          customNumber: item.customNumber,
          patch: item.patch || 'NO',
          salePrice: item.salePrice || 15.00,
          costPrice: item.costPrice || 10.00,
          imageFile: item.imageFile,
          notes: item.notes
        }))
      };

      // Desplegar Modal de Progreso
      showUploadProgress(true);
      submitBtn.disabled = true;

      try {
        const createdOrder = await window.dbService.createOrder(orderPayload, (progress) => {
          if (uploadProgressBar && uploadProgressText) {
            uploadProgressBar.style.width = `${progress.percent}%`;
            uploadProgressText.textContent = `Procesando y subiendo prenda ${progress.itemIndex} de ${progress.totalItems} (${progress.percent}%)...`;
          }
        });

        showUploadProgress(false);
        submitBtn.disabled = false;

        // Mostrar Modal de Confirmación
        openSuccessModal(createdOrder);

        // Resetear Formulario
        form.reset();
        itemsContainer.innerHTML = '';
        state.items = [];
        state.itemCounter = 0;
        addGarment(); // Añadir la primera prenda por defecto

      } catch (err) {
        console.error("Error al enviar el pedido:", err);
        showUploadProgress(false);
        submitBtn.disabled = false;
        showToast('Ocurrió un error al guardar el pedido: ' + err.message, 'error');
      }
    });
  }

  function showUploadProgress(show) {
    if (uploadProgressModal) {
      uploadProgressModal.classList.toggle('active', show);
      if (show) {
        uploadProgressBar.style.width = '10%';
        uploadProgressText.textContent = 'Iniciando subida y compresión...';
      }
    }
  }

  function openSuccessModal(order) {
    if (successModal) {
      successOrderCodeEl.textContent = order.orderCode;

      // Generar mensaje de WhatsApp con resumen
      const phoneClean = order.phone.replace(/[^0-9]/g, '');
      const itemsText = order.items.map((it, idx) => 
        `Prenda ${idx + 1}: Talla ${it.size}${it.customName ? ' | Nombre: ' + it.customName : ''}${it.customNumber ? ' | Dorsal: ' + it.customNumber : ''}`
      ).join('%0A');

      const waMsg = `¡Hola! Acabo de enviar un pedido de ropa personalizada.%0A%0A*Código de Pedido:* ${order.orderCode}%0A*Cliente:* ${order.customerName}%0A*Teléfono:* ${order.phone}%0A*Dirección:* ${order.address}%0A%0A*Prendas (${order.items.length}):*%0A${itemsText}`;

      if (successWhatsappBtn) {
        // Enlace para enviar al vendedor o auto-copia
        successWhatsappBtn.href = `https://wa.me/?text=${waMsg}`;
      }

      successModal.classList.add('active');
    }
  }

  /* --------------------------------------------------------------------------
     CONSULTA DE ESTADO DE PEDIDO (TRACKING CLIENTE)
     -------------------------------------------------------------------------- */
  if (btnOpenTrack) {
    btnOpenTrack.addEventListener('click', (e) => {
      e.preventDefault();
      trackModal.classList.add('active');
      trackResultContainer.innerHTML = '';
      if (trackInput) trackInput.value = '';
    });
  }

  if (btnSearchTrack) {
    btnSearchTrack.addEventListener('click', searchOrderTracking);
  }

  if (trackInput) {
    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchOrderTracking();
    });
  }

  async function searchOrderTracking() {
    const code = trackInput.value.trim();
    if (!code) {
      showToast('Introduce tu código de pedido o número de teléfono', 'error');
      return;
    }

    trackResultContainer.innerHTML = '<div style="text-align:center; padding:1.5rem;"><div class="spinner"></div><p style="margin-top:0.5rem; color:var(--text-secondary);">Buscando pedido...</p></div>';

    try {
      const order = await window.dbService.getOrderByCode(code);
      if (!order) {
        trackResultContainer.innerHTML = `
          <div style="text-align:center; padding:1.5rem; background:rgba(244,63,94,0.08); border-radius:var(--radius-md); border:1px solid rgba(244,63,94,0.25);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
            <h4 style="color:#fda4af;">Pedido no encontrado</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Verifica que el código (ej: PED-123456) o el teléfono coincidan con el registrado.</p>
          </div>
        `;
        return;
      }

      // Timeline de Estados
      const statusList = ['pendiente', 'pedido', 'pagado', 'enviado', 'recibido', 'entregado'];
      const currentIdx = statusList.indexOf(order.status) >= 0 ? statusList.indexOf(order.status) : 0;

      trackResultContainer.innerHTML = `
        <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-medium); border-radius:var(--radius-md); padding:1.25rem; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.75rem;">
            <div>
              <span style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan); font-size:1.1rem;">${order.orderCode}</span>
              <div style="font-size:0.8rem; color:var(--text-muted);">${order.customerName} - ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>
            </div>
          </div>

          <!-- NÚMERO DE SEGUIMIENTO (SI EXISTE) -->
          ${order.trackingNumber ? `
            <div style="background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.35); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.04em;">Número de Seguimiento de Envío</div>
                  <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:800; color:#a5b4fc; margin-top:0.2rem;">
                    ${order.shippingCarrier ? `[${order.shippingCarrier}] ` : ''}${order.trackingNumber}
                  </div>
                </div>
                ${getTrackingUrl(order.shippingCarrier, order.trackingNumber) ? `
                  <a href="${getTrackingUrl(order.shippingCarrier, order.trackingNumber)}" target="_blank" class="btn btn-sm btn-accent" style="text-decoration:none;">
                    Rastrear Envío 🚀
                  </a>
                ` : ''}
              </div>
            </div>
          ` : `
            <div style="background:rgba(255,255,255,0.03); border:1px dashed var(--border-subtle); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:1.25rem; font-size:0.84rem; color:var(--text-secondary); text-align:center;">
              📦 El número de seguimiento se asignará una vez que el pedido sea despachado en la empresa de transporte.
            </div>
          `}

          <!-- PRENDAS DEL PEDIDO -->
          <div style="font-size:0.85rem; font-weight:700; margin-bottom:0.75rem;">Prendas incluidas (${order.items.length}):</div>
          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            ${order.items.map((it, idx) => `
              <div style="display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.25); border-radius:var(--radius-sm); padding:0.5rem 0.75rem;">
                <img src="${it.imageUrl}" alt="Prenda" style="width:40px; height:40px; border-radius:4px; object-fit:cover; border:1px solid var(--border-medium); cursor:pointer;" onclick="window.openImageZoom('${it.imageUrl}')">
                <div style="flex:1; font-size:0.84rem;">
                  <span style="font-weight:700; color:var(--accent-cyan);">Talla ${it.size}</span>
                  ${it.customName ? ` | <span>Nombre: <b>${it.customName}</b></span>` : ''}
                  ${it.customNumber ? ` | <span>Número: <b>#${it.customNumber}</b></span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      console.error(err);
      trackResultContainer.innerHTML = `<p style="color:var(--accent-rose); font-size:0.85rem;">Error al consultar: ${err.message}</p>`;
    }
  }

  /* --------------------------------------------------------------------------
     ZOOM DE IMÁGENES
     -------------------------------------------------------------------------- */
  window.openImageZoom = function(src) {
    if (zoomModal && zoomImg) {
      zoomImg.src = src;
      zoomModal.classList.add('active');
    }
  };

  function openImageZoom(src) {
    window.openImageZoom(src);
  }

  // Cerrar modales al hacer clic fuera o en botón cerrar
  document.querySelectorAll('.modal-close-btn, .btn-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Inicializar con la primera prenda obligatoria
  addGarment();
});

/* Helpers Globales */
function getStatusBadgeClass(status) {
  switch (status) {
    case 'pendiente': return 'badge-pending';
    case 'pedido': return 'badge-ordered';
    case 'pagado': return 'badge-paid';
    case 'enviado': return 'badge-shipped';
    case 'recibido': return 'badge-received';
    case 'entregado': return 'badge-completed';
    case 'en_proceso': return 'badge-processing';
    case 'cancelado': return 'badge-cancelled';
    default: return 'badge-pending';
  }
}

function formatStatus(status) {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'pedido': return 'Pedido';
    case 'pagado': return 'Pagado';
    case 'enviado': return 'Enviado';
    case 'recibido': return 'Recibido';
    case 'entregado': return 'Entregado';
    case 'en_proceso': return 'En Fabricación';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
}

function getTrackingUrl(carrier, code) {
  if (!code) return '';
  const cleanCode = encodeURIComponent(code.trim());
  const c = (carrier || '').toLowerCase();

  if (c.includes('correos express')) return `https://www.correosexpress.com/web/correosexpress/consultaseguimiento?envio=${cleanCode}`;
  if (c.includes('correos')) return `https://www.correos.es/es/es/herramientas/localizador/envios/detalle?numero=${cleanCode}`;
  if (c.includes('seur')) return `https://www.seur.com/seguimiento-online.do?identificador=${cleanCode}`;
  if (c.includes('gls')) return `https://www.gls-spain.es/es/servicios-para-destinatarios/seguimiento-envios/?match=${cleanCode}`;
  if (c.includes('mrw')) return `https://www.mrw.es/seguimiento_envios/mrw_seguimiento_envio.asp?numero_envio=${cleanCode}`;
  if (c.includes('dhl')) return `https://www.dhl.com/es-es/home/tracking/tracking-express.html?submit=1&tracking-id=${cleanCode}`;
  if (c.includes('nacex')) return `https://www.nacex.com/seguimientoDetalle.do?agencia_origen=&numero_albaran=${cleanCode}`;
  return `https://www.google.com/search?q=seguimiento+envio+${cleanCode}`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;
