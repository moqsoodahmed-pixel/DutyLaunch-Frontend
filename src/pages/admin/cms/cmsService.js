import { api } from '../../../services/api.js';
import { INITIAL_CMS_ITEMS, INITIAL_CMS_CONFIG } from './defaultCmsData.js';

const STORAGE_KEY_ITEMS = 'dl_cms_pricing_items';
const STORAGE_KEY_CONFIG = 'dl_cms_pricing_config';

function getLocalItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local CMS items:', e);
  }
  return INITIAL_CMS_ITEMS;
}

function setLocalItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('dl_cms_updated', { detail: { items } }));
  } catch (e) {
    console.warn('Error saving local CMS items:', e);
  }
}

function getLocalConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { ...INITIAL_CMS_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading local CMS config:', e);
  }
  return INITIAL_CMS_CONFIG;
}

function setLocalConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('dl_cms_updated', { detail: { config } }));
  } catch (e) {
    console.warn('Error saving local CMS config:', e);
  }
}

function computeStats(items) {
  const published = items.filter((i) => i.status === 'published');
  const bundlePrices = published.filter((i) => i.category === 'bundle').map((i) => i.price);
  const avgBundlePrice = bundlePrices.length
    ? Math.round(bundlePrices.reduce((a, b) => a + b, 0) / bundlePrices.length)
    : 0;

  return {
    totalItems: items.length,
    activeOfferings: published.length,
    bundlesCount: items.filter((i) => i.category === 'bundle').length,
    addonsCount: items.filter((i) => i.category === 'addon').length,
    avgBundlePrice,
  };
}

export const cmsService = {
  // Public (for website pages)
  async getPublicPricing() {
    try {
      const res = await api.get('/cms/pricing');
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Graceful fallback to client storage/defaults
    }

    const items = getLocalItems();
    const config = getLocalConfig();
    const published = items.filter((i) => i.status === 'published');

    return {
      items: published,
      bundles: published.filter((i) => i.category === 'bundle'),
      cvOnly: published.filter((i) => i.category === 'cv_only'),
      addons: published.filter((i) => i.category === 'addon'),
      subscriptions: published.filter((i) => i.category === 'subscription'),
      services: published.filter((i) => i.category === 'service'),
      config,
    };
  },

  // Admin
  async getAdminPricing() {
    try {
      const res = await api.get('/cms/admin/pricing');
      if (res.data?.success && res.data?.data) {
        setLocalItems(res.data.data.items || []);
        if (res.data.data.config) setLocalConfig(res.data.data.config);
        return res.data;
      }
    } catch {
      // Graceful fallback to client storage/defaults
    }

    const items = getLocalItems();
    const config = getLocalConfig();
    const stats = computeStats(items);

    return {
      success: true,
      data: {
        items,
        config,
        stats,
      },
    };
  },

  async createItem(payload) {
    const items = getLocalItems();
    const newItem = {
      ...payload,
      _id: 'item_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    setLocalItems(updated);

    try {
      const res = await api.post('/cms/admin/pricing', payload);
      return res.data;
    } catch {
      return { success: true, data: newItem };
    }
  },

  async updateItem(id, payload) {
    const items = getLocalItems();
    const updated = items.map((it) => (it._id === id || it.key === id ? { ...it, ...payload, updatedAt: new Date().toISOString() } : it));
    setLocalItems(updated);

    try {
      const res = await api.put(`/cms/admin/pricing/${id}`, payload);
      return res.data;
    } catch {
      return { success: true, data: { _id: id, ...payload } };
    }
  },

  async deleteItem(id) {
    const items = getLocalItems();
    const updated = items.filter((it) => it._id !== id && it.key !== id);
    setLocalItems(updated);

    try {
      const res = await api.delete(`/cms/admin/pricing/${id}`);
      return res.data;
    } catch {
      return { success: true, message: 'Item deleted' };
    }
  },

  async updateGlobalConfig(payload) {
    const prev = getLocalConfig();
    const updated = { ...prev, ...payload };
    setLocalConfig(updated);

    try {
      const res = await api.put('/cms/admin/config', payload);
      return res.data;
    } catch {
      return { success: true, data: updated };
    }
  },

  async resetDefaults() {
    setLocalItems(INITIAL_CMS_ITEMS);
    setLocalConfig(INITIAL_CMS_CONFIG);

    try {
      const res = await api.post('/cms/admin/reset-defaults');
      return res.data;
    } catch {
      return { success: true, message: 'Reset to default configurations' };
    }
  },
};
