import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // --- Get the token from wherever you stored it ---
    const token = localStorage.getItem('access_token'); // Or sessionStorage, or context

    if (token) {
      // --- Add the Authorization header ---
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Attaching Auth header:', config.headers.Authorization); // For debugging
    } else {
      console.log('No token found, sending request without Auth header.'); // For debugging
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'provider';
    serviceType?: 'Electrician' | 'Carpentry' | 'CarWasher' | 'Plumbing' | 'ApplianceRepair';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Slot API functions
export const slotApi = {
  createSlots: async (slotData: {
    date: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    price: number;
  }) => {
    const response = await api.post('/slot', slotData);
    return response.data;
  },

  getProviderSlots: async () => {
    const response = await api.get('/slot/provider');
    return response.data;
  },

  deleteSlot: async (slotId: number) => {
    const response = await api.delete(`/slot/${slotId}`);
    return response.data;
  },

  getSlotById: async (slotId: number) => {
    const response = await api.get(`/slot/${slotId}`);
    // console.log(response)
    return response.data;
  },

  getAvailableSlots: async (date: string, serviceType: string) => {
    const response = await api.get(`/slot/available?date=${date}&serviceType=${serviceType}`);
    return response.data;
  },
};

// Reservation API functions
export const reservationApi = {
  createReservation: async (slotId: number) => {
    const response = await api.post('/reservation', { slotId });
    return response.data;
  },

  getCustomerReservations: async () => {
    const response = await api.get('/reservation/customer');
    return response.data;
  },

  getProviderReservations: async () => {
    const response = await api.get('/reservation/provider');
    return response.data;
  },

  updateReservationStatus: async (reservationId: number, status: 'pending' | 'confirmed' | 'cancelled') => {
    const response = await api.put(`/reservation/${reservationId}/status`, { status });
    return response.data;
  },

  cancelReservation: async (reservationId: number) => {
    const response = await api.put(`/reservation/${reservationId}/cancel`);
    return response.data;
  },

  confirmReservation: async (reservationId: number) => {
    const response = await api.put(`/reservation/${reservationId}/confirm`);
    return response.data;
  },
};