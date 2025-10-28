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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Unified fetch function that automatically attaches:
 * - Authorization token (if available)
 * - API Key (always included)
 */
export const fetchApi = async (endpoint, options = {}) => {
    try {
        const token = localStorage.getItem('token');

        // Merge default headers
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY,
            ...(token && { 'Authorization': token }), // only add if token exists
            ...options.headers
        };

        const defaultOptions = {
            method: options.method || 'GET',
            headers,
            credentials: 'include',
            ...(options.body && { body: options.body }),
        };

        const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

        // Handle errors
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Unauthorized: Please log in again.');
            }

            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: 'An unexpected error occurred' };
            }

            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Return JSON or empty object if no content
        return response.status !== 204 ? await response.json() : {};
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
