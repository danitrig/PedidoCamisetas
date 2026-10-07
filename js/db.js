/**
 * ============================================================================
 * CAPA DE BASE DE DATOS Y ALMACENAMIENTO (FIREBASE + MODO LOCAL INDEXEDDB)
 * ============================================================================
 */

class DatabaseService {
  constructor() {
    this.isCloud = false;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
    this.currentUser = null;
    this.localDBName = 'customwear_local_db';
    this.dbPromise = null;
    this.init();
  }

  async init() {
    if (window.isFirebaseConfigured && window.isFirebaseConfigured() && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        try {
          this.storage = firebase.storage();
        } catch (e) {
          this.storage = null;
        }
        this.isCloud = true;

        this.auth.onAuthStateChanged((user) => {
          this.currentUser = user;
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user } }));
        });

        console.log("⚡ Firebase conectado exitosamente a la nube.");
        return;
      } catch (err) {
        console.error("Error al inicializar Firebase, usando almacenamiento local:", err);
      }
    }

    // Modo Local (IndexedDB / LocalStorage)
    this.isCloud = false;
    console.log("ℹ️ Funcionando en Modo Local (IndexedDB / Demo). Los pedidos se guardarán en tu navegador.");
    this.initLocalIndexedDB();
    
    // Auth local dummy check
    const localUser = localStorage.getItem('customwear_local_admin_session');
    if (localUser) {
      this.currentUser = JSON.parse(localUser);
    }
  }

  /* --------------------------------------------------------------------------
     UTILIDAD: COMPRESIÓN DE IMÁGENES
     -------------------------------------------------------------------------- */
  async compressImage(file, maxWidth = 900, maxHeight = 900, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Exportar como blob JPEG optimizado
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Error al procesar la imagen en el lienzo"));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  /* --------------------------------------------------------------------------
     GESTIÓN DE PEDIDOS: CREACIÓN Y SUBIDA DE FOTOS
     -------------------------------------------------------------------------- */
  async createOrder(orderData, onProgress = null) {
    const orderId = 'PED-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
    orderData.orderCode = orderId;
    orderData.createdAt = new Date().toISOString();
    orderData.status = orderData.status || 'pendiente';
    orderData.trackingNumber = orderData.trackingNumber || '';
    orderData.shippingCarrier = orderData.shippingCarrier || '';

    orderData.globalManagementFee = parseFloat(orderData.globalManagementFee) || 0;

    // Subir y procesar las imágenes de cada prenda
    const processedItems = [];
    const totalItems = orderData.items.length;

    for (let i = 0; i < totalItems; i++) {
      const item = orderData.items[i];
      let imageUrl = '';

      if (onProgress) {
        onProgress({
          step: 'uploading',
          itemIndex: i + 1,
          totalItems: totalItems,
          percent: Math.round(((i + 0.3) / totalItems) * 100)
        });
      }

      if (item.imageFile) {
        // Comprimir imagen para optimizar datos
        const compressedBlob = await this.compressImage(item.imageFile);

        if (this.isCloud && this.storage) {
          try {
            // Subir a Firebase Storage si está habilitado
            const storageRef = this.storage.ref(`orders/${orderId}/prenda_${i + 1}_${Date.now()}.jpg`);
            const uploadTask = await storageRef.put(compressedBlob);
            imageUrl = await uploadTask.ref.getDownloadURL();
          } catch (storageErr) {
            console.warn("Firebase Storage no activo o requiere facturación Blaze. Guardando foto comprimida directamente en Firestore:", storageErr);
            imageUrl = await this.blobToDataURL(compressedBlob);
          }
        } else {
          // Guardar como DataURL directamente en Firestore / Local
          imageUrl = await this.blobToDataURL(compressedBlob);
        }
      } else if (item.existingImageUrl || item.imageUrl) {
        imageUrl = item.existingImageUrl || item.imageUrl;
      }

      processedItems.push({
        version: item.version || 'FAN',
        size: item.size,
        customName: item.customName || '',
        customNumber: item.customNumber || '',
        patch: item.patch || 'NO',
        salePrice: parseFloat(item.salePrice) || 0,
        costPrice: parseFloat(item.costPrice) || 0,
        imageUrl: imageUrl,
        notes: item.notes || ''
      });

      if (onProgress) {
        onProgress({
          step: 'uploading',
          itemIndex: i + 1,
          totalItems: totalItems,
          percent: Math.round(((i + 1) / totalItems) * 100)
        });
      }
    }

    const finalOrder = {
      ...orderData,
      items: processedItems
    };

    if (this.isCloud && this.firestore) {
      await this.firestore.collection('orders').doc(orderId).set(finalOrder);
    } else {
      await this.saveLocalOrder(finalOrder);
    }

    return finalOrder;
  }

  /* --------------------------------------------------------------------------
     OBTENCIÓN DE PEDIDOS (ADMIN & SEGUIMIENTO)
     -------------------------------------------------------------------------- */
  async getOrders() {
    if (this.isCloud && this.firestore) {
      const snapshot = await this.firestore.collection('orders').orderBy('createdAt', 'desc').get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } else {
      return await this.getLocalOrders();
    }
  }

  async getOrderByCode(orderCode) {
    const cleanCode = (orderCode || '').trim().toUpperCase();
    if (this.isCloud && this.firestore) {
      const doc = await this.firestore.collection('orders').doc(cleanCode).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      // Búsqueda alternativa por teléfono
      const queryPhone = await this.firestore.collection('orders').where('phone', '==', cleanCode).get();
      if (!queryPhone.empty) {
        const first = queryPhone.docs[0];
        return { id: first.id, ...first.data() };
      }
      return null;
    } else {
      const localList = await this.getLocalOrders();
      return localList.find(o => 
        (o.orderCode && o.orderCode.toUpperCase() === cleanCode) || 
        (o.phone && o.phone.trim() === cleanCode)
      ) || null;
    }
  }

  /* --------------------------------------------------------------------------
     ACTUALIZACIONES: NÚMERO DE SEGUIMIENTO Y ESTADO
     -------------------------------------------------------------------------- */
  async updateOrderTracking(orderCode, trackingNumber, shippingCarrier) {
    const updates = {
      trackingNumber: (trackingNumber || '').trim(),
      shippingCarrier: (shippingCarrier || '').trim(),
      updatedAt: new Date().toISOString()
    };

    // Si se agrega tracking y estaba en preparación o pendiente, cambiar sugerido a 'enviado'
    if (updates.trackingNumber) {
      updates.status = 'enviado';
    }

    if (this.isCloud && this.firestore) {
      await this.firestore.collection('orders').doc(orderCode).update(updates);
    } else {
      await this.updateLocalOrder(orderCode, updates);
    }

    return updates;
  }

  async updateOrderStatus(orderCode, status) {
    const updates = {
      status: status,
      updatedAt: new Date().toISOString()
    };

    if (this.isCloud && this.firestore) {
      await this.firestore.collection('orders').doc(orderCode).update(updates);
    } else {
      await this.updateLocalOrder(orderCode, updates);
    }

    return updates;
  }

  async updateOrder(orderCode, updates) {
    updates.updatedAt = new Date().toISOString();
    if (this.isCloud && this.firestore) {
      await this.firestore.collection('orders').doc(orderCode).update(updates);
    } else {
      await this.updateLocalOrder(orderCode, updates);
    }
    return updates;
  }

  async deleteOrder(orderCode) {
    if (this.isCloud && this.firestore) {
      await this.firestore.collection('orders').doc(orderCode).delete();
    } else {
      await this.deleteLocalOrder(orderCode);
    }
  }

  /* --------------------------------------------------------------------------
     AUTENTICACIÓN DE ADMINISTRADOR
     -------------------------------------------------------------------------- */
  async loginAdmin(email, password) {
    if (this.isCloud && this.auth) {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } else {
      // Modo Demo/Local
      if (
        (email === 'admin@customwear.com' && password === 'admin1234') ||
        (password === 'admin1234') ||
        (email && password.length >= 6)
      ) {
        const dummyUser = { email: email || 'admin@customwear.com', uid: 'admin-local-1' };
        this.currentUser = dummyUser;
        localStorage.setItem('customwear_local_admin_session', JSON.stringify(dummyUser));
        window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user: dummyUser } }));
        return dummyUser;
      } else {
        throw new Error('Credenciales incorrectas. Para modo demo use: admin@customwear.com / admin1234');
      }
    }
  }

  async logoutAdmin() {
    if (this.isCloud && this.auth) {
      await this.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem('customwear_local_admin_session');
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user: null } }));
  }

  /* --------------------------------------------------------------------------
     ALMACENAMIENTO LOCAL (INDEXED DB)
     -------------------------------------------------------------------------- */
  initLocalIndexedDB() {
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.localDBName, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'orderCode' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e);
    });
  }

  async saveLocalOrder(order) {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const req = store.put(order);
      req.onsuccess = () => resolve(order);
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalOrders() {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const req = store.getAll();
      req.onsuccess = () => {
        const res = req.result || [];
        res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(res);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async updateLocalOrder(orderCode, updates) {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const getReq = store.get(orderCode);
      getReq.onsuccess = () => {
        const order = getReq.result;
        if (!order) return reject(new Error('Pedido no encontrado'));
        const updated = { ...order, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deleteLocalOrder(orderCode) {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const req = store.delete(orderCode);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Instancia global
window.dbService = new DatabaseService();
