class AnnouncementManager {
    constructor() {
        // Make sure announcements exist in localStorage
        if (!localStorage.getItem('announcements')) {
            localStorage.setItem('announcements', JSON.stringify([]));
        }
        this.announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    }

    getAllAnnouncements() {
        return this.announcements;
    }

    getPublishedAnnouncements() {
        // For tenant view - only get active announcements
        const now = new Date();
        return this.announcements.filter(announcement => {
            // Check if announcement has expiry date and if it's expired
            if (announcement.expiryDate) {
                const expiryDate = new Date(announcement.expiryDate);
                if (expiryDate < now) {
                    return false; // Skip expired announcements
                }
            }
            
            // Check if announcement is active (not archived)
            if (announcement.status === 'archived') {
                return false;
            }
            
            return true;
        });
    }

    getAnnouncementById(announcementId) {
        return this.announcements.find(a => a.id === announcementId);
    }

    getAnnouncementsByPriority(priority) {
        return this.announcements.filter(a => a.priority === priority);
    }

    getRecentAnnouncements(limit = 5) {
        return this.getPublishedAnnouncements()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    createAnnouncement(announcementData) {
        console.log('Creating announcement with data:', announcementData); // Debug log
        
        // Generate unique ID
        const announcementId = 'ANN' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        // Validate required fields
        if (!announcementData.title || !announcementData.content || !announcementData.priority) {
            console.error('Missing required fields:', announcementData); // Debug log
            return { success: false, message: 'Missing required announcement information' };
        }

        const newAnnouncement = {
            id: announcementId,
            title: announcementData.title,
            content: announcementData.content,
            priority: announcementData.priority,
            category: announcementData.category || 'general',
            pinned: announcementData.pinned || false,
            date: new Date().toISOString(),
            createdBy: 'admin',
            views: 0,
            status: 'active',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };

        console.log('New announcement:', newAnnouncement); // Debug log
        
        // Get current announcements
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        announcements.push(newAnnouncement);
        
        // Save to localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        // Update local array
        this.announcements = announcements;
        
        console.log('Announcements after save:', this.announcements); // Debug log
        
        return { success: true, announcement: newAnnouncement };
    }

    updateAnnouncement(announcementId, updateData) {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        const announcementIndex = announcements.findIndex(a => a.id === announcementId);
        
        if (announcementIndex === -1) {
            return { success: false, message: 'Announcement not found' };
        }

        // Update announcement properties
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                announcements[announcementIndex][key] = updateData[key];
            }
        });

        announcements[announcementIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        // Update local array
        this.announcements = announcements;
        
        return { success: true, announcement: announcements[announcementIndex] };
    }

    deleteAnnouncement(announcementId) {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        const announcementIndex = announcements.findIndex(a => a.id === announcementId);
        
        if (announcementIndex === -1) {
            return { success: false, message: 'Announcement not found' };
        }

        // Remove the announcement
        announcements.splice(announcementIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        // Update local array
        this.announcements = announcements;
        
        return { success: true };
    }

    incrementViews(announcementId) {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        const announcementIndex = announcements.findIndex(a => a.id === announcementId);
        
        if (announcementIndex !== -1) {
            announcements[announcementIndex].views = (announcements[announcementIndex].views || 0) + 1;
            localStorage.setItem('announcements', JSON.stringify(announcements));
            this.announcements = announcements;
        }
    }

    togglePin(announcementId) {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        const announcementIndex = announcements.findIndex(a => a.id === announcementId);
        
        if (announcementIndex !== -1) {
            announcements[announcementIndex].pinned = !announcements[announcementIndex].pinned;
            localStorage.setItem('announcements', JSON.stringify(announcements));
            this.announcements = announcements;
            return { success: true, pinned: announcements[announcementIndex].pinned };
        }
        return { success: false };
    }

    // Get announcement statistics
    getAnnouncementStatistics() {
        const total = this.announcements.length;
        const highPriority = this.announcements.filter(a => a.priority === 'high').length;
        const mediumPriority = this.announcements.filter(a => a.priority === 'medium').length;
        const lowPriority = this.announcements.filter(a => a.priority === 'low').length;
        
        return {
            total,
            highPriority,
            mediumPriority,
            lowPriority,
            last30Days: this.announcements.filter(a => {
                const announcementDate = new Date(a.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return announcementDate >= thirtyDaysAgo;
            }).length
        };
    }

    // Search announcements
    searchAnnouncements(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.announcements.filter(announcement => 
            announcement.title.toLowerCase().includes(term) ||
            announcement.content.toLowerCase().includes(term) ||
            (announcement.category && announcement.category.toLowerCase().includes(term))
        );
    }
}

// Initialize announcement manager
window.announcementManager = new AnnouncementManager();