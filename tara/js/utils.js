// Utility functions for Rentarium system

class RentariumUtils {
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-success {
                    background-color: #27ae60;
                    border-left: 4px solid #219653;
                }
                .notification-error {
                    background-color: #e74c3c;
                    border-left: 4px solid #c0392b;
                }
                .notification-warning {
                    background-color: #f39c12;
                    border-left: 4px solid #e67e22;
                }
                .notification-info {
                    background-color: #3498db;
                    border-left: 4px solid #2980b9;
                }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 20px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    static confirmAction(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Confirm Action</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
                        <button class="btn btn-primary" id="confirm-btn">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const closeModal = () => modal.remove();
            
            modal.querySelector('.close-modal').addEventListener('click', closeModal);
            modal.querySelector('#cancel-btn').addEventListener('click', () => {
                closeModal();
                resolve(false);
            });
            modal.querySelector('#confirm-btn').addEventListener('click', () => {
                closeModal();
                resolve(true);
            });
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    static generateID(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('current_user'));
        return user;
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static isTenant() {
        const user = this.getCurrentUser();
        return user && user.role === 'tenant';
    }

    static redirectIfNotLoggedIn(requiredRole = null) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = requiredRole === 'admin' ? 'admin-login.html' : 'tenant-login.html';
            return false;
        }
        if (requiredRole && user.role !== requiredRole) {
            window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'tenant-dashboard.html';
            return false;
        }
        return true;
    }

    static logout() {
        localStorage.removeItem('current_user');
        window.location.href = 'index.html';
    }

    static loadSampleData() {
        // Sample rooms
        const sampleRooms = [
            {
                id: 'room001',
                roomNumber: '101',
                type: 'Studio',
                floor: '1st Floor',
                price: 8000,
                size: '25 sqm',
                amenities: ['Aircon', 'Private CR', 'Kitchenette'],
                status: 'available',
                description: 'Cozy studio apartment with basic amenities'
            },
            {
                id: 'room002',
                roomNumber: '102',
                type: '1 Bedroom',
                floor: '1st Floor',
                price: 12000,
                size: '35 sqm',
                amenities: ['Aircon', 'Private CR', 'Kitchen', 'Balcony'],
                status: 'occupied',
                description: 'Spacious 1 bedroom unit'
            },
            {
                id: 'room003',
                roomNumber: '201',
                type: 'Studio',
                floor: '2nd Floor',
                price: 8500,
                size: '28 sqm',
                amenities: ['Aircon', 'Private CR', 'Kitchenette', 'WiFi'],
                status: 'available',
                description: 'Renovated studio with WiFi'
            },
            {
                id: 'room004',
                roomNumber: '202',
                type: '2 Bedrooms',
                floor: '2nd Floor',
                price: 15000,
                size: '45 sqm',
                amenities: ['Aircon', 'Private CR', 'Full Kitchen', 'Balcony', 'WiFi'],
                status: 'maintenance',
                description: 'Family unit with two bedrooms'
            }
        ];

        // Sample tenants (created by admin)
        const sampleTenants = [
            {
                id: 'tenant001',
                username: 'john_doe',
                password: 'password123',
                email: 'john.doe@email.com',
                fullName: 'John Doe',
                phone: '+639123456789',
                roomId: 'room002',
                emergencyContact: 'Jane Doe (09123456788)',
                occupation: 'Software Engineer',
                moveInDate: '2024-01-15',
                status: 'active',
                createdAt: '2024-01-10'
            }
        ];

        // Sample rental requests
        const sampleRequests = [
            {
                id: 'req001',
                tenantId: 'tenant001',
                roomId: 'room002',
                requestDate: '2024-01-10',
                moveInDate: '2024-01-15',
                status: 'approved',
                notes: 'Requested early move-in'
            }
        ];

        // Sample payments
        const samplePayments = [
            {
                id: 'pay001',
                tenantId: 'tenant001',
                tenantName: 'John Doe',
                roomId: 'room002',
                roomNumber: '102',
                amount: 12000,
                paymentDate: '2024-02-01',
                dueDate: '2024-02-01',
                paymentMethod: 'Bank Transfer',
                status: 'paid',
                receiptNumber: 'REC001',
                notes: 'February rent'
            }
        ];

        // Sample announcements
        const sampleAnnouncements = [
            {
                id: 'ann001',
                title: 'Monthly Maintenance',
                content: 'Please be informed that there will be water interruption on February 15 from 9 AM to 5 PM for monthly maintenance.',
                date: '2024-02-10',
                priority: 'high',
                category: 'maintenance'
            },
            {
                id: 'ann002',
                title: 'Rent Payment Reminder',
                content: 'Reminder: Rent for February is due on February 5. Please pay on time to avoid penalties.',
                date: '2024-02-01',
                priority: 'medium',
                category: 'payment'
            }
        ];

        // Save to localStorage
        localStorage.setItem('rooms', JSON.stringify(sampleRooms));
        localStorage.setItem('tenants', JSON.stringify(sampleTenants));
        localStorage.setItem('rental_requests', JSON.stringify(sampleRequests));
        localStorage.setItem('payments', JSON.stringify(samplePayments));
        localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));

        return true;
    }
}

// Make utils globally available
window.RentariumUtils = RentariumUtils;

// Add this to your main script file or utils.js
class SessionMonitor {
    constructor() {
        this.checkInterval = null;
        this.start();
    }
    
    start() {
        // Check session every 30 seconds
        this.checkInterval = setInterval(() => {
            const user = authSystem.getCurrentUser();
            if (user) {
                // Refresh session timestamp
                user.loginTime = new Date().toISOString();
                localStorage.setItem('current_user', JSON.stringify(user));
            }
        }, 30000);
    }
    
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Initialize session monitor
window.sessionMonitor = new SessionMonitor();