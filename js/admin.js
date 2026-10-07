/**
 * ============================================================================
 * CONTROLADOR DEL PANEL DE ADMINISTRACIÓN
 * Gestión de Pedidos, Costes, Precios, Edición de Prendas y Generación de PDF
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  let allOrders = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let activeOrder = null;

  // Elementos DOM
  const adminView = document.getElementById('view-admin-dashboard');
  const customerView = document.getElementById('view-customer-order');
  const btnToggleAdmin = document.getElementById('btn-nav-admin');
  const btnBackToShop = document.getElementById('btn-back-to-shop');
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminLoginForm = document.getElementById('admin-login-form');
  const btnAdminLogout = document.getElementById('btn-admin-logout');
  const adminEmailDisplay = document.getElementById('admin-user-email');

  // KPIs
  const kpiTotalEl = document.getElementById('kpi-total-orders');
  const kpiPendingEl = document.getElementById('kpi-pending-orders');
  const kpiOrderedEl = document.getElementById('kpi-ordered-orders');
  const kpiPaidEl = document.getElementById('kpi-paid-orders');
  const kpiShippedEl = document.getElementById('kpi-shipped-orders');
  const kpiReceivedEl = document.getElementById('kpi-received-orders');
  const kpiDeliveredEl = document.getElementById('kpi-delivered-orders');
  const kpiGarmentsEl = document.getElementById('kpi-total-garments');

  // Listado y Filtros
  const ordersListEl = document.getElementById('admin-orders-list');
  const searchInput = document.getElementById('admin-search-input');
  const statusTabs = document.querySelectorAll('.status-tabs .tab-btn');
  const btnRefresh = document.getElementById('btn-refresh-orders');

  // Modal de Detalle de Pedido
  const orderDetailModal = document.getElementById('admin-order-detail-modal');
  const detailOrderCodeEl = document.getElementById('detail-order-code');
  const detailDateEl = document.getElementById('detail-order-date');
  const detailCustomerEl = document.getElementById('detail-customer-name');
  const detailPhoneEl = document.getElementById('detail-phone');
  const detailEmailEl = document.getElementById('detail-email');
  const detailAddressEl = document.getElementById('detail-address');
  const detailNotesEl = document.getElementById('detail-notes');
  const detailStatusSelect = document.getElementById('detail-status-select');
  const detailCarrierSelect = document.getElementById('detail-carrier-select');
  const detailTrackingInput = document.getElementById('detail-tracking-input');
  const btnSaveTracking = document.getElementById('btn-save-tracking');
  const btnNotifyWhatsapp = document.getElementById('btn-notify-whatsapp');
  const btnPrintOrder = document.getElementById('btnPrintOrder');
  const btnDeleteOrder = document.getElementById('btn-delete-order');
  const btnDirectWhatsappCustomer = document.getElementById('btn-direct-whatsapp-customer');
  const btnDownloadPdfReceipt = document.getElementById('btn-download-pdf-receipt');

  // Resumen Económico
  const finTotalSaleEl = document.getElementById('fin-total-sale');
  const finTotalCostEl = document.getElementById('fin-total-cost');
  const finGlobalFeeEl = document.getElementById('fin-global-fee');
  const finTotalProfitEl = document.getElementById('fin-total-profit');
  const btnSaveGlobalFee = document.getElementById('btn-save-global-fee');

  // Tabla de Productos en Detalle
  const detailProductsTbody = document.getElementById('detail-products-tbody');
  const detailItemsCountBadge = document.getElementById('detail-items-count-badge');
  const btnAdminAddProduct = document.getElementById('btn-admin-add-product');
  const btnAddProductTable = document.getElementById('btn-add-product-table');

  // Modal Añadir / Editar Producto
  const productEditModal = document.getElementById('product-edit-modal');
  const productEditForm = document.getElementById('product-edit-form');
  const productModalTitle = document.getElementById('product-modal-title');
  const editItemIndex = document.getElementById('edit-item-index');
  const editItemVersion = document.getElementById('edit-item-version');
  const editItemSize = document.getElementById('edit-item-size');
  const editItemName = document.getElementById('edit-item-name');
  const editItemNumber = document.getElementById('edit-item-number');
  const editItemPatch = document.getElementById('edit-item-patch');
  const editItemSalePrice = document.getElementById('edit-item-saleprice');
  const editItemCostPrice = document.getElementById('edit-item-costprice');
  const editItemFileInput = document.getElementById('edit-item-file-input');
  const editItemExistingImgUrl = document.getElementById('edit-item-existing-img-url');
  const editItemPreviewImg = document.getElementById('edit-item-preview-img');
  const btnSaveEditedProduct = document.getElementById('btn-save-edited-product');

  // Modal de Configuración de Firebase
  const btnOpenFirebaseConfig = document.getElementById('btn-open-firebase-config');
  const firebaseConfigModal = document.getElementById('firebase-config-modal');
  const firebaseConfigForm = document.getElementById('firebase-config-form');
  const dbStatusIndicator = document.getElementById('db-status-indicator');

  /* --------------------------------------------------------------------------
     GESTIÓN DE AUTENTICACIÓN
     -------------------------------------------------------------------------- */
  function updateAuthUI(user) {
    if (user) {
      if (adminEmailDisplay) adminEmailDisplay.textContent = user.email || 'Admin';
      if (btnToggleAdmin) {
        btnToggleAdmin.innerHTML = `<span>⚙️</span><span>Panel Admin</span>`;
      }
    } else {
      if (adminEmailDisplay) adminEmailDisplay.textContent = '';
      if (btnToggleAdmin) {
        btnToggleAdmin.innerHTML = `<span>🔒</span><span>Acceso Admin</span>`;
      }
      if (adminView && adminView.style.display !== 'none') {
        showCustomerView();
      }
    }
    updateCloudStatusBadge();
  }

  function updateCloudStatusBadge() {
    if (!dbStatusIndicator) return;
    const isCloud = window.dbService.isCloud;
    if (isCloud) {
      dbStatusIndicator.innerHTML = `
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
        <span style="font-size:0.75rem; color:#6ee7b7; font-weight:600;">Nube Activa (Firebase)</span>
      `;
    } else {
      dbStatusIndicator.innerHTML = `
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span>
        <span style="font-size:0.75rem; color:#fcd34d; font-weight:600;">Modo Local (IndexedDB)</span>
      `;
    }
  }

  window.addEventListener('auth-state-changed', (e) => {
    updateAuthUI(e.detail.user);
  });

  // Botón Navbar Administrador
  if (btnToggleAdmin) {
    btnToggleAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.dbService.currentUser) {
        showAdminView();
      } else {
        if (adminLoginModal) adminLoginModal.classList.add('active');
      }
    });
  }

  // Formulario Login
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email-input').value.trim();
      const password = document.getElementById('admin-password-input').value.trim();
      const loginBtn = document.getElementById('btn-submit-login');

      loginBtn.disabled = true;
      loginBtn.innerHTML = `<div class="spinner"></div> Verificando...`;

      try {
        await window.dbService.loginAdmin(email, password);
        if (adminLoginModal) adminLoginModal.classList.remove('active');
        showToast('Sesión de administrador iniciada', 'success');
        showAdminView();
      } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `Entrar al Panel`;
      }
    });
  }

  // Cerrar Sesión
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', async () => {
      await window.dbService.logoutAdmin();
      showToast('Sesión cerrada', 'info');
      showCustomerView();
    });
  }

  if (btnBackToShop) {
    btnBackToShop.addEventListener('click', showCustomerView);
  }

  function showAdminView() {
    if (customerView) customerView.style.display = 'none';
    if (adminView) {
      adminView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    loadOrders();
  }

  function showCustomerView() {
    if (adminView) adminView.style.display = 'none';
    if (customerView) {
      customerView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* --------------------------------------------------------------------------
     CARGAR Y GESTIONAR PEDIDOS
     -------------------------------------------------------------------------- */
  async function loadOrders() {
    if (ordersListEl) {
      ordersListEl.innerHTML = `
        <div style="text-align:center; padding:3rem;">
          <div class="spinner"></div>
          <p style="margin-top:0.75rem; color:var(--text-secondary);">Cargando pedidos...</p>
        </div>
      `;
    }

    try {
      allOrders = await window.dbService.getOrders();
      updateKPIs(allOrders);
      renderOrdersList();
    } catch (err) {
      console.error(err);
      if (ordersListEl) {
        ordersListEl.innerHTML = `<div style="text-align:center; color:var(--accent-rose); padding:2rem;">Error al cargar pedidos: ${err.message}</div>`;
      }
    }
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadOrders();
      showToast('Listado actualizado', 'info');
    });
  }

  function updateKPIs(orders) {
    let pending = 0;
    let ordered = 0;
    let paid = 0;
    let shipped = 0;
    let received = 0;
    let delivered = 0;
    let totalGarments = 0;

    orders.forEach(o => {
      if (o.status === 'pendiente') pending++;
      else if (o.status === 'pedido') ordered++;
      else if (o.status === 'pagado') paid++;
      else if (o.status === 'enviado') shipped++;
      else if (o.status === 'recibido') received++;
      else if (o.status === 'entregado') delivered++;
      if (o.items && Array.isArray(o.items)) totalGarments += o.items.length;
    });

    if (kpiTotalEl) kpiTotalEl.textContent = orders.length;
    if (kpiPendingEl) kpiPendingEl.textContent = pending;
    if (kpiOrderedEl) kpiOrderedEl.textContent = ordered;
    if (kpiPaidEl) kpiPaidEl.textContent = paid;
    if (kpiShippedEl) kpiShippedEl.textContent = shipped;
    if (kpiReceivedEl) kpiReceivedEl.textContent = received;
    if (kpiDeliveredEl) kpiDeliveredEl.textContent = delivered;
    if (kpiGarmentsEl) kpiGarmentsEl.textContent = totalGarments;
  }

  /* --------------------------------------------------------------------------
     FILTRADO Y BÚSQUEDA
     -------------------------------------------------------------------------- */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderOrdersList();
    });
  }

  statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderOrdersList();
    });
  });

  function renderOrdersList() {
    if (!ordersListEl) return;

    let filtered = allOrders.filter(order => {
      if (currentFilter !== 'all' && order.status !== currentFilter) {
        return false;
      }

      if (searchQuery) {
        const matchCode = (order.orderCode || '').toLowerCase().includes(searchQuery);
        const matchName = (order.customerName || '').toLowerCase().includes(searchQuery);
        const matchPhone = (order.phone || '').toLowerCase().includes(searchQuery);
        const matchEmail = (order.email || '').toLowerCase().includes(searchQuery);
        const matchTracking = (order.trackingNumber || '').toLowerCase().includes(searchQuery);
        return matchCode || matchName || matchPhone || matchEmail || matchTracking;
      }

      return true;
    });

    if (filtered.length === 0) {
      ordersListEl.innerHTML = `
        <div style="text-align:center; padding:3rem; background:rgba(255,255,255,0.02); border-radius:var(--radius-md); border:1px dashed var(--border-subtle);">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">📭</div>
          <h3 style="font-size:1.1rem; color:var(--text-primary);">No hay pedidos en esta sección</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Prueba a cambiar el filtro o el término de búsqueda.</p>
        </div>
      `;
      return;
    }

    ordersListEl.innerHTML = '';
    filtered.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-row-card';

      // Calcular Total Venta para mostrar en tarjeta
      const totalOrderSale = (order.items || []).reduce((acc, it) => acc + (parseFloat(it.salePrice) || 0), 0);

      // Miniaturas de prendas
      const thumbsHtml = (order.items || []).slice(0, 3).map(it => `
        <img src="${it.imageUrl}" alt="Prenda" class="item-thumb-mini" title="${it.version || 'FAN'} | Talla: ${it.size} ${it.customName ? '| ' + it.customName : ''}">
      `).join('') + ((order.items || []).length > 3 ? `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">+${order.items.length - 3}</span>` : '');

      const phoneClean = (order.phone || '').replace(/[^0-9]/g, '');

      card.innerHTML = `
        <div class="order-id-cell">
          <span class="order-code-badge">${order.orderCode}</span>
          <span class="order-date-text">${order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}</span>
          <div style="margin-top:0.35rem; display:flex; gap:0.4rem; align-items:center;">
            <span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>
            ${totalOrderSale > 0 ? `<span style="font-size:0.82rem; font-weight:800; color:#34d399;">${totalOrderSale.toFixed(2)} €</span>` : ''}
          </div>
        </div>

        <div class="customer-info-cell">
          <h4>${order.customerName}</h4>
          <p>📞 ${order.phone} | ✉️ ${order.email}</p>
          <p style="font-size:0.78rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${order.address}">📍 ${order.address}</p>
        </div>

        <div class="items-preview-cell">
          <div style="display:flex; align-items:center; gap:0.35rem;">
            ${thumbsHtml}
          </div>
          <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); margin-left:0.35rem;">
            ${order.items ? order.items.length : 0} prenda(s)
          </div>
        </div>

        <div class="tracking-cell">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Seguimiento:</div>
          ${order.trackingNumber ? `
            <span class="tracking-code-text">${order.shippingCarrier ? `[${order.shippingCarrier}] ` : ''}${order.trackingNumber}</span>
          ` : `
            <span style="font-size:0.78rem; color:var(--text-muted);">Sin asignar</span>
          `}
        </div>

        <div class="actions-cell">
          <button class="btn btn-sm btn-secondary btn-view-detail" data-code="${order.orderCode}" title="Ver detalle completo y gestionar">
            👁️ Ver Detalle
          </button>
          <button class="btn btn-sm btn-accent btn-quick-receipt" data-code="${order.orderCode}" title="Ver e imprimir Recibo Oficial del Cliente (PDF)">
            📄 Recibo
          </button>
          <button class="btn btn-sm btn-secondary btn-quick-workshop" data-code="${order.orderCode}" title="Ver e imprimir Ficha de Taller / Producción">
            🖨️ Taller
          </button>
          ${phoneClean ? `
            <a href="https://wa.me/${phoneClean}" target="_blank" class="btn btn-sm btn-secondary" title="Abrir WhatsApp">
              💬
            </a>
          ` : ''}
        </div>
      `;

      ordersListEl.appendChild(card);
    });

    // Eventos de botones de la lista
    ordersListEl.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const found = allOrders.find(o => o.orderCode === code);
        if (found) openOrderDetail(found);
      });
    });

    ordersListEl.querySelectorAll('.btn-quick-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const found = allOrders.find(o => o.orderCode === code);
        if (found) openClientReceipt(found);
      });
    });

    ordersListEl.querySelectorAll('.btn-quick-workshop').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const found = allOrders.find(o => o.orderCode === code);
        if (found) openWorkshopSheet(found);
      });
    });
  }

  /* --------------------------------------------------------------------------
     MODAL DE DETALLE DEL PEDIDO, GESTIÓN DE COSTES Y PRENDAS
     -------------------------------------------------------------------------- */
  function openOrderDetail(order) {
    activeOrder = order;

    if (detailOrderCodeEl) detailOrderCodeEl.textContent = order.orderCode;
    if (detailDateEl) detailDateEl.textContent = order.createdAt ? new Date(order.createdAt).toLocaleString('es-ES') : '';
    if (detailCustomerEl) detailCustomerEl.textContent = order.customerName;
    if (detailPhoneEl) detailPhoneEl.textContent = order.phone;
    if (detailEmailEl) detailEmailEl.textContent = order.email;
    if (detailAddressEl) detailAddressEl.textContent = order.address;
    if (detailNotesEl) detailNotesEl.textContent = order.notes || 'Ninguna nota';

    if (detailStatusSelect) detailStatusSelect.value = order.status || 'pendiente';
    if (detailCarrierSelect) detailCarrierSelect.value = order.shippingCarrier || 'Correos';
    if (detailTrackingInput) detailTrackingInput.value = order.trackingNumber || '';

    // Direct WhatsApp Button
    if (btnDirectWhatsappCustomer) {
      const phoneClean = (order.phone || '').replace(/[^0-9]/g, '');
      btnDirectWhatsappCustomer.href = `https://wa.me/${phoneClean}`;
    }

    // Renderizar Económicos y Tabla de Prendas
    renderOrderFinancials();
    renderProductsTable();

    if (orderDetailModal) orderDetailModal.classList.add('active');
  }

  /* --------------------------------------------------------------------------
     CÁLCULO Y GESTIÓN FINANCIERA (VENTA, COMPRA, GESTIÓN Y MARGEN)
     -------------------------------------------------------------------------- */
  function renderOrderFinancials() {
    if (!activeOrder) return;

    const items = activeOrder.items || [];
    let totalSale = 0;
    let totalCost = 0;

    items.forEach(it => {
      totalSale += parseFloat(it.salePrice) || 0;
      totalCost += parseFloat(it.costPrice) || 0;
    });

    const globalFee = parseFloat(activeOrder.globalManagementFee) || 0;
    const netProfit = totalSale - totalCost - globalFee;

    if (finTotalSaleEl) finTotalSaleEl.textContent = totalSale.toFixed(2) + ' €';
    if (finTotalCostEl) finTotalCostEl.textContent = totalCost.toFixed(2) + ' €';
    if (finGlobalFeeEl) finGlobalFeeEl.value = globalFee.toFixed(2);
    if (finTotalProfitEl) {
      finTotalProfitEl.textContent = netProfit.toFixed(2) + ' €';
      finTotalProfitEl.style.color = netProfit >= 0 ? '#c084fc' : '#fda4af';
    }
  }

  // Guardar Gasto de Gestión Global
  if (btnSaveGlobalFee) {
    btnSaveGlobalFee.addEventListener('click', async () => {
      if (!activeOrder) return;
      const fee = parseFloat(finGlobalFeeEl.value) || 0;
      try {
        await window.dbService.updateOrder(activeOrder.orderCode, { globalManagementFee: fee });
        activeOrder.globalManagementFee = fee;
        renderOrderFinancials();
        showToast('Gasto de gestión actualizado', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al guardar gasto de gestión: ' + err.message, 'error');
      }
    });
  }

  /* --------------------------------------------------------------------------
     TABLA DE PRODUCTOS EN DETALLE (ESTILO CAPTURA DEL USUARIO)
     -------------------------------------------------------------------------- */
  function renderProductsTable() {
    if (!detailProductsTbody || !activeOrder) return;

    const items = activeOrder.items || [];
    if (detailItemsCountBadge) detailItemsCountBadge.textContent = items.length;

    if (items.length === 0) {
      detailProductsTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
            No hay prendas en este pedido. Usa el botón "+ Añadir Producto" para agregar una.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    let sumSale = 0;
    let sumCost = 0;

    items.forEach((item, idx) => {
      const sale = parseFloat(item.salePrice) || 0;
      const cost = parseFloat(item.costPrice) || 0;
      sumSale += sale;
      sumCost += cost;

      const patch = (item.patch || 'NO').toUpperCase();
      const patchClass = patch === 'YES' || patch === 'LIGA' || patch === 'CHAMPIONS' ? 'pill-patch-yes' : 'pill-patch-no';

      rowsHtml += `
        <tr>
          <td>
            <img src="${item.imageUrl}" alt="Prenda" class="product-thumb-table" onclick="window.openImageZoom('${item.imageUrl}')" title="Clic para ampliar">
          </td>
          <td>
            <span class="pill-version">${item.version || 'FAN'}</span>
          </td>
          <td style="font-weight:700; color:#fff;">
            ${item.size || 'M'}
          </td>
          <td>
            <div style="font-weight:700; color:#fff;">${item.customName || '<span style="color:var(--text-muted); font-weight:normal;">—</span>'}</div>
            <div style="font-family:var(--font-heading); font-size:1rem; font-weight:800; color:var(--accent-cyan);">${item.customNumber ? '#' + item.customNumber : ''}</div>
          </td>
          <td>
            <span class="pill-patch ${patchClass}">${patch}</span>
          </td>
          <td style="font-family:var(--font-heading); font-weight:800; color:#34d399; font-size:1.05rem;">
            ${sale.toFixed(2)} €
          </td>
          <td style="font-family:var(--font-heading); font-weight:700; color:#38bdf8; font-size:0.95rem;">
            ${cost.toFixed(2)} €
          </td>
          <td style="text-align: right;">
            <div style="display:inline-flex; gap:0.35rem;">
              <button type="button" class="action-icon-btn btn-edit-product" data-index="${idx}" title="Editar artículo">
                ✏️
              </button>
              <button type="button" class="action-icon-btn btn-trash btn-delete-product" data-index="${idx}" title="Eliminar artículo">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    // Fila de Total / Subtotal
    rowsHtml += `
      <tr style="background: rgba(255,255,255,0.03); font-weight:800; border-top: 2px solid var(--border-medium);">
        <td colspan="5" style="text-align:right; font-size:0.8rem; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.04em;">
          Subtotal Artículos (${items.length}):
        </td>
        <td style="color:#34d399; font-size:1.15rem; font-family:var(--font-heading);">
          ${sumSale.toFixed(2)} €
        </td>
        <td style="color:#38bdf8; font-size:1.05rem; font-family:var(--font-heading);">
          ${sumCost.toFixed(2)} €
        </td>
        <td></td>
      </tr>
    `;

    detailProductsTbody.innerHTML = rowsHtml;

    // Conectar eventos de Edición y Borrado
    detailProductsTbody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        openEditProductModal(idx);
      });
    });

    detailProductsTbody.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        deleteProductFromActiveOrder(idx);
      });
    });
  }

  /* --------------------------------------------------------------------------
     MODAL DE AÑADIR / EDITAR ARTÍCULO
     -------------------------------------------------------------------------- */
  function openAddProductModal() {
    if (!activeOrder) return;
    productModalTitle.textContent = 'Añadir Nuevo Producto al Pedido';
    editItemIndex.value = '-1';
    editItemVersion.value = 'FAN';
    editItemSize.value = 'M';
    editItemName.value = '';
    editItemNumber.value = '';
    editItemPatch.value = 'YES';
    editItemSalePrice.value = '15.00';
    editItemCostPrice.value = '10.00';
    editItemExistingImgUrl.value = '';
    editItemFileInput.value = '';
    editItemPreviewImg.style.display = 'none';
    editItemPreviewImg.src = '';

    productEditModal.classList.add('active');
  }

  function openEditProductModal(index) {
    if (!activeOrder || !activeOrder.items[index]) return;
    const item = activeOrder.items[index];

    productModalTitle.textContent = `Editar Artículo #${index + 1}`;
    editItemIndex.value = index;
    editItemVersion.value = item.version || 'FAN';
    editItemSize.value = item.size || 'M';
    editItemName.value = item.customName || '';
    editItemNumber.value = item.customNumber || '';
    editItemPatch.value = item.patch || 'YES';
    editItemSalePrice.value = (parseFloat(item.salePrice) || 0).toFixed(2);
    editItemCostPrice.value = (parseFloat(item.costPrice) || 0).toFixed(2);
    editItemExistingImgUrl.value = item.imageUrl || '';
    editItemFileInput.value = '';

    if (item.imageUrl) {
      editItemPreviewImg.src = item.imageUrl;
      editItemPreviewImg.style.display = 'block';
    } else {
      editItemPreviewImg.style.display = 'none';
    }

    productEditModal.classList.add('active');
  }

  // Previsualización instantánea al seleccionar foto nueva
  if (editItemFileInput) {
    editItemFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          editItemPreviewImg.src = ev.target.result;
          editItemPreviewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnAdminAddProduct) btnAdminAddProduct.addEventListener('click', openAddProductModal);
  if (btnAddProductTable) btnAddProductTable.addEventListener('click', openAddProductModal);

  if (productEditForm) {
    productEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeOrder) return;

      const idx = parseInt(editItemIndex.value, 10);
      const version = editItemVersion.value;
      const size = editItemSize.value.trim().toUpperCase();
      const customName = editItemName.value.trim().toUpperCase();
      const customNumber = editItemNumber.value.trim();
      const patch = editItemPatch.value;
      const salePrice = parseFloat(editItemSalePrice.value) || 0;
      const costPrice = parseFloat(editItemCostPrice.value) || 0;
      let imageUrl = editItemExistingImgUrl.value;

      const file = editItemFileInput.files && editItemFileInput.files[0];

      if (!file && !imageUrl) {
        imageUrl = 'assets/sample-jersey.jpg';
      }

      btnSaveEditedProduct.disabled = true;
      btnSaveEditedProduct.innerHTML = `<div class="spinner"></div> Guardando...`;

      try {
        if (file) {
          const compressedBlob = await window.dbService.compressImage(file);
          imageUrl = await window.dbService.blobToDataURL(compressedBlob);
        }

        const productData = {
          version,
          size,
          customName,
          customNumber,
          patch,
          salePrice,
          costPrice,
          imageUrl,
          notes: ''
        };

        if (idx === -1) {
          // Añadir producto nuevo
          activeOrder.items = activeOrder.items || [];
          activeOrder.items.push(productData);
        } else {
          // Actualizar producto existente
          activeOrder.items[idx] = productData;
        }

        // Guardar en la base de datos
        await window.dbService.updateOrder(activeOrder.orderCode, { items: activeOrder.items });

        productEditModal.classList.remove('active');
        renderOrderFinancials();
        renderProductsTable();
        loadOrders(); // refrescar lista general
        showToast(idx === -1 ? 'Artículo añadido al pedido' : 'Artículo actualizado', 'success');

      } catch (err) {
        console.error(err);
        showToast('Error al guardar artículo: ' + err.message, 'error');
      } finally {
        btnSaveEditedProduct.disabled = false;
        btnSaveEditedProduct.innerHTML = `Guardar Artículo 💾`;
      }
    });
  }

  async function deleteProductFromActiveOrder(idx) {
    if (!activeOrder || !activeOrder.items[idx]) return;
    if (confirm(`¿Eliminar la prenda #${idx + 1} de este pedido?`)) {
      activeOrder.items.splice(idx, 1);
      try {
        await window.dbService.updateOrder(activeOrder.orderCode, { items: activeOrder.items });
        renderOrderFinancials();
        renderProductsTable();
        loadOrders();
        showToast('Artículo eliminado', 'info');
      } catch (err) {
        console.error(err);
        showToast('Error al eliminar artículo: ' + err.message, 'error');
      }
    }
  }

  /* ==========================================================================
     DOCUMENTO 1: RECIBO OFICIAL DEL CLIENTE (INTERACTIVO, PDF & IMPRESIÓN)
     (CONFIDENCIALIDAD: SOLO MUESTRA PRECIOS DEL CLIENTE, NUNCA COSTES PROVEEDOR)
     ========================================================================== */
  const modalClientReceipt = document.getElementById('modal-client-receipt');
  const modalWorkshopSheet = document.getElementById('modal-workshop-sheet');

  const btnReceiptDownloadPdf = document.getElementById('btn-receipt-download-pdf');
  const btnReceiptPrintNative = document.getElementById('btn-receipt-print-native');
  const btnReceiptSendWa = document.getElementById('btn-receipt-send-wa');

  const btnWorkshopPrintNative = document.getElementById('btn-workshop-print-native');
  const btnWorkshopDownloadPdf = document.getElementById('btn-workshop-download-pdf');

  function openClientReceipt(order) {
    if (!order) return;
    activeOrder = order;

    // Rellenar cabecera y metadatos
    const codeEl = document.getElementById('receipt-order-code');
    const dateEl = document.getElementById('receipt-order-date');
    const badgeEl = document.getElementById('receipt-status-badge');

    if (codeEl) codeEl.textContent = order.orderCode;
    if (dateEl) {
      dateEl.textContent = order.createdAt 
        ? new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleDateString('es-ES');
    }
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="badge ${getStatusBadgeClass(order.status)}">${formatStatus(order.status)}</span>`;
    }

    // Datos del Cliente y Envío
    const nameEl = document.getElementById('receipt-customer-name');
    const phoneEl = document.getElementById('receipt-customer-phone');
    const emailEl = document.getElementById('receipt-customer-email');
    const addrEl = document.getElementById('receipt-customer-address');
    const trackEl = document.getElementById('receipt-customer-tracking');

    if (nameEl) nameEl.textContent = order.customerName || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Cliente';
    if (phoneEl) phoneEl.textContent = order.phone || 'No especificado';
    if (emailEl) emailEl.textContent = order.email || 'No especificado';
    if (addrEl) addrEl.textContent = order.address || 'Recogida en taller / Dirección no indicada';

    if (trackEl) {
      if (order.trackingNumber) {
        trackEl.innerHTML = `<strong style="color:#0284c7; font-family:monospace; font-size:13px;">[${escapeHtml(order.shippingCarrier || 'Transporte')}] ${escapeHtml(order.trackingNumber)}</strong>`;
      } else {
        trackEl.innerHTML = `<span style="color:#64748b; font-style:italic;">En preparación (código pendiente de asignación)</span>`;
      }
    }

    // Tabla de Prendas (SOLO PRECIO VENTA DEL CLIENTE)
    const tbody = document.getElementById('receipt-items-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      let totalCliente = 0;
      const items = order.items || [];

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#64748b;">No hay prendas en este pedido.</td></tr>`;
      } else {
        items.forEach((it, idx) => {
          const sale = parseFloat(it.salePrice) || 0;
          totalCliente += sale;

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <img src="${it.imageUrl || 'assets/jersey-preview.jpg'}" class="receipt-thumb" alt="Prenda #${idx + 1}" onerror="this.src='assets/jersey-preview.jpg'">
            </td>
            <td>
              <div style="font-weight:700; color:#0f172a; font-size:14px;">${escapeHtml(it.version || 'FAN')}</div>
              <div style="font-size:11px; color:#64748b;">Artículo #${idx + 1}</div>
            </td>
            <td>
              <span style="font-weight:800; font-size:14px; background:#f1f5f9; padding:3px 10px; border-radius:4px; border:1px solid #cbd5e1; display:inline-block;">${escapeHtml(it.size || 'M')}</span>
            </td>
            <td>
              ${it.customName ? `<div><strong style="color:#334155; font-size:11px; text-transform:uppercase;">Nombre:</strong> <span style="font-weight:800; color:#0f172a;">${escapeHtml(it.customName.toUpperCase())}</span></div>` : ''}
              ${it.customNumber ? `<div><strong style="color:#334155; font-size:11px; text-transform:uppercase;">Dorsal:</strong> <span style="font-weight:800; color:#0284c7; font-size:15px;">#${escapeHtml(it.customNumber)}</span></div>` : ''}
              ${!it.customName && !it.customNumber ? '<span style="color:#94a3b8; font-style:italic;">Sin dorsal / estampado</span>' : ''}
            </td>
            <td>
              <span style="font-weight:700; font-size:12px; color:${it.patch && it.patch !== 'NO' ? '#ea580c' : '#64748b'};">${escapeHtml((it.patch || 'NO').toUpperCase())}</span>
            </td>
            <td style="text-align: right; font-weight:800; font-size:15px; color:#15803d; white-space:nowrap;">
              ${sale.toFixed(2)} €
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      const totalEl = document.getElementById('receipt-total-amount');
      if (totalEl) totalEl.textContent = totalCliente.toFixed(2) + ' €';

      const feeNote = document.getElementById('receipt-fee-note');
      if (feeNote) {
        if (order.status === 'pagado') {
          feeNote.innerHTML = '💳 Estado: <strong>PAGADO</strong> (Importe abonado íntegramente)';
        } else {
          feeNote.innerHTML = `📌 Estado actual: <strong>${formatStatus(order.status).toUpperCase()}</strong>`;
        }
      }
    }

    if (modalClientReceipt) modalClientReceipt.classList.add('active');
  }

  // Descarga del Recibo en PDF con html2pdf
  if (btnReceiptDownloadPdf) {
    btnReceiptDownloadPdf.addEventListener('click', async () => {
      if (!activeOrder) return;
      const sheet = document.getElementById('printable-client-receipt');
      if (!sheet) return;

      btnReceiptDownloadPdf.disabled = true;
      btnReceiptDownloadPdf.innerHTML = `<div class="spinner"></div> Generando PDF...`;

      try {
        if (typeof html2pdf !== 'undefined') {
          const clientClean = (activeOrder.customerName || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_');
          const opt = {
            margin: [8, 8, 8, 8],
            filename: `Recibo_${activeOrder.orderCode}_${clientClean}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          await html2pdf().set(opt).from(sheet).save();
          showToast('📥 Recibo descargado como PDF', 'success');
        } else {
          showToast('Abriendo ventana de impresión / Guardar como PDF...', 'info');
          printNativeDocument('receipt');
        }
      } catch (err) {
        console.error('Error generando PDF recibo:', err);
        showToast('Error al generar PDF: ' + err.message, 'error');
      } finally {
        btnReceiptDownloadPdf.disabled = false;
        btnReceiptDownloadPdf.innerHTML = `📥 Descargar PDF`;
      }
    });
  }

  // Impresión nativa limpia A4 del Recibo
  if (btnReceiptPrintNative) {
    btnReceiptPrintNative.addEventListener('click', () => {
      printNativeDocument('receipt');
    });
  }

  // Enviar copia del Recibo por WhatsApp
  if (btnReceiptSendWa) {
    btnReceiptSendWa.addEventListener('click', () => {
      if (!activeOrder) return;
      const phoneClean = (activeOrder.phone || '').replace(/[^0-9]/g, '');
      const totalSale = (activeOrder.items || []).reduce((acc, it) => acc + (parseFloat(it.salePrice) || 0), 0);
      const msg = `¡Hola ${activeOrder.firstName || activeOrder.customerName}! 👋%0A%0ATe enviamos el comprobante oficial de tu pedido *${activeOrder.orderCode}* en CustomWear Orders:%0A%0A*Importe Total:* ${totalSale.toFixed(2)} €%0A*Prendas:* ${(activeOrder.items || []).length}%0A*Estado:* ${formatStatus(activeOrder.status)}%0A%0A¡Muchas gracias por tu confianza!`;
      window.open(`https://wa.me/${phoneClean}?text=${msg}`, '_blank');
    });
  }

  /* ==========================================================================
     DOCUMENTO 2: FICHA DE TALLER & PRODUCCIÓN (OPTIMIZADA PARA OPERARIOS)
     (FOTOS GRANDES 135px, TALLA VISIBLE, DORSALES GIGANTES Y CHECKLIST QC)
     ========================================================================== */
  function openWorkshopSheet(order) {
    if (!order) return;
    activeOrder = order;

    const codeEl = document.getElementById('workshop-order-code');
    const dateEl = document.getElementById('workshop-order-date');
    const nameEl = document.getElementById('workshop-customer-name');
    const phoneEl = document.getElementById('workshop-customer-phone');
    const countEl = document.getElementById('workshop-items-count');

    if (codeEl) codeEl.textContent = order.orderCode;
    if (dateEl) {
      dateEl.textContent = order.createdAt 
        ? new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleDateString('es-ES');
    }
    if (nameEl) nameEl.textContent = order.customerName || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Cliente';
    if (phoneEl) phoneEl.textContent = order.phone || 'Sin teléfono';

    const items = order.items || [];
    if (countEl) countEl.textContent = `${items.length} ${items.length === 1 ? 'PRENDA' : 'PRENDAS'}`;

    // Observaciones o notas especiales
    const notesBanner = document.getElementById('workshop-notes-banner');
    const notesText = document.getElementById('workshop-notes-text');
    if (order.notes && order.notes.trim()) {
      if (notesText) notesText.textContent = order.notes.trim();
      if (notesBanner) notesBanner.style.display = 'block';
    } else {
      if (notesBanner) notesBanner.style.display = 'none';
    }

    // Fichas individuales de confección con fotos grandes y dorsales claros
    const container = document.getElementById('workshop-cards-container');
    if (container) {
      container.innerHTML = '';

      if (items.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:2rem; color:#64748b;">No hay prendas en este pedido para confeccionar.</div>`;
      } else {
        items.forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'workshop-card';

          const patchStr = item.patch && item.patch !== 'NO' ? `<span style="color:#c2410c; margin-left:8px; font-weight:800;">★ PARCHE: ${escapeHtml(item.patch.toUpperCase())}</span>` : '';

          card.innerHTML = `
            <div class="workshop-card-top">
              <div class="workshop-garment-title">
                <span>👕 PRENDA #${idx + 1}</span>
                <span style="font-weight:600; font-size:13px; color:#475569;">&bull; Versión: <strong style="color:#0f172a;">${escapeHtml(item.version || 'FAN')}</strong></span>
                ${patchStr}
              </div>
              <div class="workshop-size-badge-large">
                TALLA: ${(escapeHtml(item.size || 'M')).toUpperCase()}
              </div>
            </div>

            <div class="workshop-card-body">
              <div>
                <img src="${item.imageUrl || 'assets/jersey-preview.jpg'}" alt="Prenda #${idx + 1}" class="workshop-img-large" onerror="this.src='assets/jersey-preview.jpg'">
              </div>

              <div class="workshop-custom-box">
                <div class="workshop-custom-label">Personalización Trasera / Dorsal:</div>
                <div class="workshop-name-text">
                  ${item.customName ? escapeHtml(item.customName.toUpperCase()) : '<span style="color:#94a3b8; font-size:15px; font-weight:600;">(SIN NOMBRE)</span>'}
                </div>
                <div class="workshop-num-text">
                  ${item.customNumber ? '#' + escapeHtml(item.customNumber) : '<span style="color:#94a3b8; font-size:18px; font-weight:600;">(SIN DORSAL)</span>'}
                </div>
                <div style="margin-top:8px; font-size:12px; color:#475569;">
                  Talla: <strong style="color:#0f172a; font-size:13px;">${escapeHtml(item.size || 'M')}</strong> | Versión: <strong>${escapeHtml(item.version || 'FAN')}</strong>
                </div>
              </div>

              <div class="workshop-checklist">
                <div class="workshop-check-item">
                  <span class="workshop-square"></span>
                  <span>Prenda base verificada</span>
                </div>
                <div class="workshop-check-item">
                  <span class="workshop-square"></span>
                  <span>Vinilo / Estampado OK</span>
                </div>
                <div class="workshop-check-item">
                  <span class="workshop-square"></span>
                  <span>Planchado & fijación</span>
                </div>
                <div class="workshop-check-item">
                  <span class="workshop-square"></span>
                  <span>Control de calidad final</span>
                </div>
              </div>
            </div>
          `;
          container.appendChild(card);
        });
      }
    }

    if (modalWorkshopSheet) modalWorkshopSheet.classList.add('active');
  }

  // Impresión nativa limpia A4 de la Ficha de Taller
  if (btnWorkshopPrintNative) {
    btnWorkshopPrintNative.addEventListener('click', () => {
      printNativeDocument('workshop');
    });
  }

  // Guardar Ficha de Taller como PDF
  if (btnWorkshopDownloadPdf) {
    btnWorkshopDownloadPdf.addEventListener('click', async () => {
      if (!activeOrder) return;
      const sheet = document.getElementById('printable-workshop-sheet');
      if (!sheet) return;

      btnWorkshopDownloadPdf.disabled = true;
      btnWorkshopDownloadPdf.innerHTML = `<div class="spinner"></div> Guardando PDF...`;

      try {
        if (typeof html2pdf !== 'undefined') {
          const opt = {
            margin: [8, 8, 8, 8],
            filename: `Ficha_Taller_${activeOrder.orderCode}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          await html2pdf().set(opt).from(sheet).save();
          showToast('📥 Ficha de taller guardada como PDF', 'success');
        } else {
          printNativeDocument('workshop');
        }
      } catch (err) {
        console.error('Error generando PDF taller:', err);
        showToast('Error al exportar PDF de taller: ' + err.message, 'error');
      } finally {
        btnWorkshopDownloadPdf.disabled = false;
        btnWorkshopDownloadPdf.innerHTML = `📥 Guardar PDF`;
      }
    });
  }

  // Función común para aislar e imprimir documentos en formato papel A4
  function printNativeDocument(type) {
    const className = type === 'receipt' ? 'print-receipt-active' : 'print-workshop-active';
    document.body.classList.add(className);

    const cleanup = () => {
      document.body.classList.remove(className);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    setTimeout(() => {
      document.body.classList.remove(className);
    }, 4000);

    window.print();
  }

  // Botones en la cabecera del Detalle de Pedido
  if (btnDownloadPdfReceipt) {
    btnDownloadPdfReceipt.addEventListener('click', () => {
      if (!activeOrder) return;
      openClientReceipt(activeOrder);
    });
  }

  if (btnPrintOrder) {
    btnPrintOrder.addEventListener('click', () => {
      if (!activeOrder) return;
      openWorkshopSheet(activeOrder);
    });
  }

  // Guardar Número de Seguimiento y Cambiar a Enviado
  if (btnSaveTracking) {
    btnSaveTracking.addEventListener('click', async () => {
      if (!activeOrder) return;
      const tracking = detailTrackingInput.value.trim();
      const carrier = detailCarrierSelect.value;

      btnSaveTracking.disabled = true;
      btnSaveTracking.innerHTML = `<div class="spinner"></div> Guardando...`;

      try {
        await window.dbService.updateOrderTracking(activeOrder.orderCode, tracking, carrier);
        activeOrder.trackingNumber = tracking;
        activeOrder.shippingCarrier = carrier;
        if (tracking) {
          activeOrder.status = 'enviado';
          if (detailStatusSelect) detailStatusSelect.value = 'enviado';
        }

        showToast('Número de seguimiento guardado y pedido actualizado a "Enviado"', 'success');
        loadOrders();
      } catch (err) {
        console.error(err);
        showToast('Error al guardar seguimiento: ' + err.message, 'error');
      } finally {
        btnSaveTracking.disabled = false;
        btnSaveTracking.innerHTML = `Guardar Seguimiento 💾`;
      }
    });
  }

  // Cambio Manual de Estado (incluyendo el nuevo estado 'pagado')
  if (detailStatusSelect) {
    detailStatusSelect.addEventListener('change', async (e) => {
      if (!activeOrder) return;
      const newStatus = e.target.value;
      try {
        await window.dbService.updateOrderStatus(activeOrder.orderCode, newStatus);
        activeOrder.status = newStatus;
        showToast(`Estado cambiado a "${formatStatus(newStatus)}"`, 'success');
        loadOrders();
      } catch (err) {
        console.error(err);
        showToast('Error al actualizar estado: ' + err.message, 'error');
      }
    });
  }

  // Notificar Seguimiento por WhatsApp al Cliente
  if (btnNotifyWhatsapp) {
    btnNotifyWhatsapp.addEventListener('click', () => {
      if (!activeOrder) return;
      const tracking = detailTrackingInput.value.trim() || activeOrder.trackingNumber;
      const carrier = detailCarrierSelect.value || activeOrder.shippingCarrier || 'Transporte';

      if (!tracking) {
        showToast('Debes ingresar primero un número de seguimiento', 'error');
        return;
      }

      const trackingUrl = getTrackingUrl(carrier, tracking);
      const phoneClean = (activeOrder.phone || '').replace(/[^0-9]/g, '');

      const msg = `¡Hola ${activeOrder.firstName}! 👋%0A%0ATe informamos que tu pedido *${activeOrder.orderCode}* de ropa personalizada ha sido ENVIADO 📦✈️%0A%0A*Empresa de transporte:* ${carrier}%0A*Número de seguimiento:* ${tracking}%0A${trackingUrl ? `*Rastreo del paquete:* ${trackingUrl}%0A` : ''}%0A¡Muchas gracias por confiar en nosotros!`;

      const waLink = `https://wa.me/${phoneClean}?text=${msg}`;
      window.open(waLink, '_blank');
    });
  }

  // Eliminar Pedido
  if (btnDeleteOrder) {
    btnDeleteOrder.addEventListener('click', async () => {
      if (!activeOrder) return;
      if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el pedido ${activeOrder.orderCode}? Esta acción no se puede deshacer.`)) {
        try {
          await window.dbService.deleteOrder(activeOrder.orderCode);
          if (orderDetailModal) orderDetailModal.classList.remove('active');
          showToast('Pedido eliminado', 'info');
          loadOrders();
        } catch (err) {
          console.error(err);
          showToast('Error al eliminar: ' + err.message, 'error');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     MODAL DE CONFIGURACIÓN DE FIREBASE
     -------------------------------------------------------------------------- */
  if (btnOpenFirebaseConfig) {
    btnOpenFirebaseConfig.addEventListener('click', () => {
      if (firebaseConfigModal) {
        const cfg = window.FIREBASE_CONFIG || {};
        document.getElementById('cfg-api-key').value = cfg.apiKey !== 'TU_API_KEY_AQUI' ? cfg.apiKey : '';
        document.getElementById('cfg-auth-domain').value = cfg.authDomain !== 'tu-proyecto.firebaseapp.com' ? cfg.authDomain : '';
        document.getElementById('cfg-project-id').value = cfg.projectId !== 'tu-proyecto' ? cfg.projectId : '';
        document.getElementById('cfg-storage-bucket').value = cfg.storageBucket !== 'tu-proyecto.appspot.com' ? cfg.storageBucket : '';
        document.getElementById('cfg-sender-id').value = cfg.messagingSenderId !== '1234567890' ? cfg.messagingSenderId : '';
        document.getElementById('cfg-app-id').value = cfg.appId !== '1:1234567890:web:abcdef123456' ? cfg.appId : '';

        firebaseConfigModal.classList.add('active');
      }
    });
  }

  if (firebaseConfigForm) {
    firebaseConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newConfig = {
        apiKey: document.getElementById('cfg-api-key').value.trim(),
        authDomain: document.getElementById('cfg-auth-domain').value.trim(),
        projectId: document.getElementById('cfg-project-id').value.trim(),
        storageBucket: document.getElementById('cfg-storage-bucket').value.trim(),
        messagingSenderId: document.getElementById('cfg-sender-id').value.trim(),
        appId: document.getElementById('cfg-app-id').value.trim()
      };

      localStorage.setItem('customwear_firebase_config', JSON.stringify(newConfig));
      showToast('Configuración de Firebase guardada. Recargando...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }

  const btnResetToDemo = document.getElementById('btn-reset-to-demo');
  if (btnResetToDemo) {
    btnResetToDemo.addEventListener('click', () => {
      if (confirm('¿Restablecer al modo local de demostración?')) {
        localStorage.removeItem('customwear_firebase_config');
        showToast('Restablecido a modo local. Recargando...', 'info');
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }
});

/* Helpers Globales de Estado */
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

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

