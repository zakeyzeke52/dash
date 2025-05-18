async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return false;
    }

    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (!data.valid) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
} 