// const API_KEY = import.meta.env.VITE_API_KEY;
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// export const apiConfig = {
//     baseUrl: API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//         'X-API-KEY': API_KEY
//     }
// };

// export const fetchWithAuth = async (endpoint, options = {}) => {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             throw new Error('No authentication token found');
//         }

//         const defaultOptions = {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': token,
//                 ...options.headers
//             },
//             credentials: 'include',
//             ...options
//         };

//         const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 localStorage.removeItem('token');
//                 // window.location.href = '/login';
//                 throw new Error('Please login to access this resource');
//             }
//             const error = await response.json();
//             throw new Error(error.message || `HTTP error! status: ${response.status}`);
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('API Error:', error);
//         throw error;
//     }
// };

// export const fetchWithApiKey = async (endpoint, options = {}) => {
//     try {
//         const defaultOptions = {
//             method: options.method || 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-API-Key': import.meta.env.VITE_API_KEY,
//                 ...options.headers
//             },
//             body: options.body
//         };

//         const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);
//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.error || `HTTP error! status: ${response.status}`);
//         }

//         return data;
//     } catch (error) {
//         console.error('API Error:', error);
//         throw error;
//     }
// };

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchApi = async (endpoint, options = {}) => {
  try {
    const isPublic = endpoint.includes("/public/");
    const token = !isPublic ? localStorage.getItem("token") : null;

    const headers = {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body,
    });

    const data = await res.json();

    if (res.status === 401) {
      localStorage.clear();
      throw new Error("Session expired. Please login again.");
    }

    if (!res.ok) {
      throw new Error(data.message || `HTTP Error ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchApiFormData = async (endpoint, formData, options = {}) => {
  try {
    const token = !endpoint.includes("/public/")
      ? localStorage.getItem("token")
      : null;
    const apiKey = import.meta.env.VITE_API_KEY;

    const headers = {
      "X-API-KEY": apiKey,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
      // DO NOT set Content-Type - let browser set it with multipart/form-data boundary
    };

    const defaultOptions = {
      method: options.method || "POST",
      headers,
      body: formData, // formData handles serialization automatically
    };

    const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API FormData Error:", error);
    throw error;
  }
};
