# Frontend Connection Guide

Create this file in React frontend:

```text
src/services/api.js
```

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('agro-token')

  const headers = {
    ...(options.headers || {})
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}
```

Add frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

After backend deploy:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
```
