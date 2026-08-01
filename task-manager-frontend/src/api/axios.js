import axios from 'axios';

// En un despliegue compartido (Docker en red privada/VPN), cada persona del
// equipo abre el frontend desde una URL distinta (IP o hostname del servidor).
// En vez de fijar "localhost:3000", inferimos el backend usando el mismo host
// desde el que se sirvió la app, así funciona igual para todos sin recompilar.
// VITE_API_URL permite forzar una URL específica si se necesita.
const inferredBaseURL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
const baseURL = import.meta.env.VITE_API_URL || inferredBaseURL;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
