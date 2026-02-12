import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Don't intercept errors from login, register, or token endpoints
        const isAuthEndpoint = originalRequest.url?.includes('login') || 
                              originalRequest.url?.includes('register') ||
                              originalRequest.url?.includes('token/');
        
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && error.response.statusText === "Unauthorized") {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

                    // exp date in token is expressed in seconds, while now() returns milliseconds:
                    const now = Math.ceil(Date.now() / 1000);

                    if (tokenParts.exp > now) {
                        const response = await axios.post(baseURL + 'token/refresh/', { refresh: refreshToken });
                        
                        localStorage.setItem('access_token', response.data.access);
                        localStorage.setItem('refresh_token', response.data.refresh);
            
                        api.defaults.headers['Authorization'] = "Bearer " + response.data.access;
                        originalRequest.headers['Authorization'] = "Bearer " + response.data.access;
            
                        return api(originalRequest);
                    } else {
                        console.log("Refresh token is expired", tokenParts.exp, now);
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                    }
                } catch (err) {
                    console.log("Refresh token is expired or invalid", err);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                console.log("Refresh token not available.");
                // Don't redirect if already on login page
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login';
                }
            }
        }
      
        return Promise.reject(error);
    }
);

export default api;
