import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

// Lightweight debug to confirm API base URL at runtime (browser console)
try {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[API] Base URL:', (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'));
  }
} catch {}

// Request queue to throttle requests
let requestQueue = [];
let isProcessing = false;
const REQUEST_DELAY = 50; // 50ms between requests to avoid rate limiting

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  const nextRequest = requestQueue.shift();
  
  try {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    nextRequest.resolver();
  } catch (err) {
    nextRequest.rejector(err);
  }
  
  isProcessing = false;
  processQueue(); // Process next item
};

axiosClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore in non-browser env
  }
  
  // Initialize retry count
  if (!config.retryCount) {
    config.retryCount = 0;
  }
  
  return config;
});

// Retry logic for 429 (rate limit) and 5xx errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Don't retry if no config (edge case)
    if (!config) return Promise.reject(error);

    // Retry on 429 (too many requests) or 5xx errors, max 3 times
    const shouldRetry =
      (error.response?.status === 429 || (error.response?.status >= 500 && error.response?.status < 600)) &&
      config.retryCount < 3;

    if (shouldRetry) {
      config.retryCount += 1;
      // Exponential backoff: 2s, 4s, 8s (longer delays for 429)
      const delayMs = Math.pow(2, config.retryCount) * 1000;
      
      console.warn(`Request failed with status ${error.response?.status}. Retrying in ${delayMs}ms... (Attempt ${config.retryCount}/3)`);
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return axiosClient(config);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
