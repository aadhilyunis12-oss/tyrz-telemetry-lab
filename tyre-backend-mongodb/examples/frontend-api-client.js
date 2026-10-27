/*
 * Optional plain-JavaScript API helper for your existing frontend.
 * Load this after your current page scripts, or copy only the functions you need.
 * It does not create or redesign any UI.
 */
const TYRE_API_BASE = 'http://localhost:5000/api';

async function tyreApiRequest(path, options = {}) {
  const response = await fetch(`${TYRE_API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Backend request failed (${response.status}).`);
  return data;
}

window.tyreBackend = {
  async getCategories() {
    return tyreApiRequest('/catalog/categories');
  },

  async searchVehicles({ category, search = '', market = 'IN' }) {
    const params = new URLSearchParams({ category, market });
    if (search) params.set('search', search);
    return tyreApiRequest(`/catalog/vehicles?${params}`);
  },

  async getVehicleYears(vehicleId) {
    return tyreApiRequest(`/catalog/vehicles/${encodeURIComponent(vehicleId)}/years`);
  },

  async getFitments({ category, make, model, year, market = 'IN' }) {
    const params = new URLSearchParams({ category, make, model, market });
    if (year) params.set('year', String(year));
    return tyreApiRequest(`/catalog/fitments?${params}`);
  },

  async getTyreOptions({ category, make, model, year, variant, position, market = 'IN' }) {
    const params = new URLSearchParams({ category, make, model, year: String(year), variant, position, market });
    return tyreApiRequest(`/catalog/options?${params}`);
  },

  async getTyresBySize({ category, size, market = 'IN' }) {
    const params = new URLSearchParams({ category, size, market });
    return tyreApiRequest(`/catalog/tyres?${params}`);
  },

  async getCalibrationReferences() {
    return tyreApiRequest('/catalog/calibration-references');
  },

  async saveInspection(inspectionPayload) {
    return tyreApiRequest('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionPayload)
    });
  }
};
