class AuthSystem {
    constructor() {
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
    }

    async adminLogin(username, password) {
        // Check hardcoded admin credentials
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            // Get stored admin account details
            const storedAdmin = JSON.parse(localStorage.getItem('admin_account')) || {
                username: 'admin',
                fullName: 'System Administrator',
                email: 'admin@rentarium.com',
                role: 'admin'
            };
            
            // Store current user session
            localStorage.setItem('current_user', JSON.stringify({
                ...storedAdmin,
                role: 'admin',
                loginTime: new Date().toISOString()
            }));
            
            return { success: true, user: storedAdmin };
        }
        
        return { success: false, message: 'Invalid admin credentials' };
    }

    async tenantLogin(username, password) {
        // Get all tenants from localStorage
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        
        // Find tenant with matching username
        const tenant = tenants.find(t => t.username === username);
        
        if (!tenant) {
            return { success: false, message: 'Tenant account not found' };
        }
        
        // In production, you should hash passwords!
        if (tenant.password !== password) {
            return { success: false, message: 'Invalid password' };
        }
        
        if (tenant.status !== 'active') {
            return { success: false, message: 'Account is not active' };
        }
        
        // Store current user session
        localStorage.setItem('current_user', JSON.stringify({
            ...tenant,
            role: 'tenant',
            loginTime: new Date().toISOString()
        }));
        
        return { success: true, user: tenant };
    }

    createTenantAccount(tenantData) {
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        
        // Check if username or email already exists
        const existingUser = tenants.find(t => 
            t.username === tenantData.username || t.email === tenantData.email
        );
        
        if (existingUser) {
            return { 
                success: false, 
                message: 'Username or email already exists' 
            };
        }
        
        // Generate tenant ID
        const tenantId = 'TEN' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        const newTenant = {
            id: tenantId,
            username: tenantData.username,
            password: tenantData.password, // In production, hash this!
            email: tenantData.email,
            fullName: tenantData.fullName,
            phone: tenantData.phone,
            emergencyContact: tenantData.emergencyContact,
            occupation: tenantData.occupation,
            status: 'active',
            createdAt: new Date().toISOString(),
            roomId: null,
            moveInDate: null
        };
        
        tenants.push(newTenant);
        localStorage.setItem('tenants', JSON.stringify(tenants));
        
        return { 
            success: true, 
            message: 'Tenant account created successfully',
            tenant: newTenant
        };
    }

    updateTenantPassword(tenantId, newPassword) {
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        const tenantIndex = tenants.findIndex(t => t.id === tenantId);
        
        if (tenantIndex === -1) {
            return { success: false, message: 'Tenant not found' };
        }
        
        tenants[tenantIndex].password = newPassword;
        localStorage.setItem('tenants', JSON.stringify(tenants));
        
        return { success: true, message: 'Password updated successfully' };
    }

    deactivateTenantAccount(tenantId) {
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        const tenantIndex = tenants.findIndex(t => t.id === tenantId);
        
        if (tenantIndex === -1) {
            return { success: false, message: 'Tenant not found' };
        }
        
        tenants[tenantIndex].status = 'inactive';
        localStorage.setItem('tenants', JSON.stringify(tenants));
        
        return { success: true, message: 'Tenant account deactivated' };
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('current_user'));
    }

    logout() {
        localStorage.removeItem('current_user');
        window.location.href = '../index.html';
    }

    isAuthenticated() {
        return localStorage.getItem('current_user') !== null;
    }

    requireAuth(role = null) {
        const user = this.getCurrentUser();
        
        if (!user) {
            // Only redirect if not already on login page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('login')) {
                const loginPage = role === 'admin' ? '../admin-login.html' : '../tenant-login.html';
                window.location.href = loginPage;
            }
            return false;
        }
        
        if (role && user.role !== role) {
            // User has a role but it's not the required one
            const redirectPage = user.role === 'admin' ? 'admin-dashboard.html' : 'tenant-dashboard.html';
            window.location.href = redirectPage;
            return false;
        }
        
        return true;
    }
    
    // NEW: Refresh session timestamp to prevent auto-logout
    refreshSession() {
        const user = this.getCurrentUser();
        if (user) {
            user.loginTime = new Date().toISOString();
            localStorage.setItem('current_user', JSON.stringify(user));
        }
    }
    
    // NEW: Check if session is still valid (optional: add timeout)
    isSessionValid() {
        const user = this.getCurrentUser();
        if (!user || !user.loginTime) return false;
        
        const loginTime = new Date(user.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        // Session valid for 24 hours
        return hoursDiff < 24;
    }
}

// Initialize auth system
window.authSystem = new AuthSystem();

// Refresh session on every page load
document.addEventListener('DOMContentLoaded', function() {
    if (authSystem.isAuthenticated()) {
        authSystem.refreshSession();
    }
});

// Admin Login Handler
if (document.getElementById('adminLoginForm')) {
    document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = await authSystem.adminLogin(username, password);
        
        if (result.success) {
            RentariumUtils.showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'admin/admin-dashboard.html';
            }, 1000);
        } else {
            RentariumUtils.showNotification(result.message, 'error');
        }
    });
}

// Tenant Login Handler
if (document.getElementById('tenantLoginForm')) {
    document.getElementById('tenantLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = await authSystem.tenantLogin(username, password);
        
        if (result.success) {
            RentariumUtils.showNotification('Login successful! Welcome back.', 'success');
            setTimeout(() => {
                window.location.href = 'tenant/tenant-dashboard.html';
            }, 1000);
        } else {
            RentariumUtils.showNotification(result.message, 'error');
        }
    });
}