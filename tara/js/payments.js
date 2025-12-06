class PaymentManager {
    constructor() {
        this.payments = JSON.parse(localStorage.getItem('payments')) || [];
    }

    getAllPayments() {
        return this.payments;
    }

    getPaymentById(paymentId) {
        return this.payments.find(p => p.id === paymentId);
    }

    getPaymentsByTenant(tenantId) {
        return this.payments.filter(p => p.tenantId === tenantId);
    }

    getPaymentsByRoom(roomId) {
        return this.payments.filter(p => p.roomId === roomId);
    }

    getPaymentsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.payments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= start && paymentDate <= end;
        });
    }

    recordPayment(paymentData) {
        const paymentId = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        const newPayment = {
            id: paymentId,
            ...paymentData,
            recordedAt: new Date().toISOString(),
            recordedBy: 'admin' // In real system, get from current user
        };

        // Validate required fields
        if (!paymentData.tenantId || !paymentData.amount || !paymentData.paymentDate) {
            return { success: false, message: 'Missing required payment information' };
        }

        this.payments.push(newPayment);
        this.savePayments();
        
        return { success: true, payment: newPayment };
    }

    updatePayment(paymentId, updateData) {
        const paymentIndex = this.payments.findIndex(p => p.id === paymentId);
        
        if (paymentIndex === -1) {
            return { success: false, message: 'Payment not found' };
        }

        // Update payment properties
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                this.payments[paymentIndex][key] = updateData[key];
            }
        });

        this.payments[paymentIndex].updatedAt = new Date().toISOString();
        this.savePayments();
        
        return { success: true, payment: this.payments[paymentIndex] };
    }

    deletePayment(paymentId) {
        const paymentIndex = this.payments.findIndex(p => p.id === paymentId);
        
        if (paymentIndex === -1) {
            return { success: false, message: 'Payment not found' };
        }

        this.payments.splice(paymentIndex, 1);
        this.savePayments();
        
        return { success: true };
    }

    markAsPaid(paymentId) {
        const paymentIndex = this.payments.findIndex(p => p.id === paymentId);
        
        if (paymentIndex === -1) {
            return { success: false, message: 'Payment not found' };
        }

        this.payments[paymentIndex].status = 'paid';
        this.payments[paymentIndex].paidAt = new Date().toISOString();
        this.savePayments();
        
        return { success: true, payment: this.payments[paymentIndex] };
    }

    markAsPending(paymentId) {
        const paymentIndex = this.payments.findIndex(p => p.id === paymentId);
        
        if (paymentIndex === -1) {
            return { success: false, message: 'Payment not found' };
        }

        this.payments[paymentIndex].status = 'pending';
        this.savePayments();
        
        return { success: true, payment: this.payments[paymentIndex] };
    }

    savePayments() {
        localStorage.setItem('payments', JSON.stringify(this.payments));
    }

    // Get payment statistics
    getPaymentStatistics(startDate, endDate) {
        const paymentsInRange = this.getPaymentsByDateRange(startDate, endDate);
        
        const totalAmount = paymentsInRange.reduce((sum, p) => sum + p.amount, 0);
        const paidCount = paymentsInRange.filter(p => p.status === 'paid').length;
        const pendingCount = paymentsInRange.filter(p => p.status === 'pending').length;
        const overdueCount = paymentsInRange.filter(p => p.status === 'overdue').length;
        
        return {
            totalAmount,
            paidCount,
            pendingCount,
            overdueCount,
            collectionRate: paymentsInRange.length > 0 ? (paidCount / paymentsInRange.length * 100).toFixed(1) : 0
        };
    }

    // Check for overdue payments
    checkOverduePayments() {
        const today = new Date();
        const overduePayments = [];
        
        this.payments.forEach(payment => {
            if (payment.status === 'pending' && payment.dueDate) {
                const dueDate = new Date(payment.dueDate);
                if (dueDate < today) {
                    overduePayments.push({
                        ...payment,
                        overdueDays: Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
                    });
                }
            }
        });
        
        return overduePayments;
    }

    // Generate payment summary for dashboard
    getDashboardSummary() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        const monthlyPayments = this.payments.filter(p => {
            const paymentDate = new Date(p.paymentDate);
            return paymentDate.getMonth() + 1 === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'paid';
        });
        
        const totalCollected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
        const overduePayments = this.checkOverduePayments().length;
        
        return {
            totalCollected,
            pendingPayments,
            overduePayments,
            monthlyPayments: monthlyPayments.length
        };
    }

    // Generate unique receipt number
    generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `RCPT-${year}${month}${day}-${random}`;
    }
}

// Initialize payment manager
window.paymentManager = new PaymentManager();