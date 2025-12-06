class RoomManager {
    constructor() {
        this.rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    }

    getAllRooms() {
        return this.rooms;
    }

    getAvailableRooms() {
        return this.rooms.filter(room => room.status === 'available');
    }

    getRoomById(roomId) {
        return this.rooms.find(room => room.id === roomId);
    }

    addRoom(roomData) {
        const roomId = 'ROOM' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        const newRoom = {
            id: roomId,
            roomNumber: roomData.roomNumber,
            type: roomData.type,
            floor: roomData.floor,
            price: parseFloat(roomData.price),
            size: roomData.size,
            amenities: roomData.amenities ? roomData.amenities.split(',').map(a => a.trim()) : [],
            status: 'available',
            description: roomData.description || '',
            createdAt: new Date().toISOString()
        };

        this.rooms.push(newRoom);
        this.saveRooms();
        
        return { success: true, room: newRoom };
    }

    updateRoom(roomId, updateData) {
        const roomIndex = this.rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
            return { success: false, message: 'Room not found' };
        }

        // Update room properties
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                this.rooms[roomIndex][key] = updateData[key];
            }
        });

        this.saveRooms();
        return { success: true, room: this.rooms[roomIndex] };
    }

    deleteRoom(roomId) {
        const roomIndex = this.rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
            return { success: false, message: 'Room not found' };
        }

        // Check if room is occupied
        if (this.rooms[roomIndex].status === 'occupied') {
            return { success: false, message: 'Cannot delete occupied room' };
        }

        this.rooms.splice(roomIndex, 1);
        this.saveRooms();
        
        return { success: true };
    }

    changeRoomStatus(roomId, newStatus) {
        const roomIndex = this.rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
            return { success: false, message: 'Room not found' };
        }

        this.rooms[roomIndex].status = newStatus;
        this.saveRooms();
        
        return { success: true, room: this.rooms[roomIndex] };
    }

    saveRooms() {
        localStorage.setItem('rooms', JSON.stringify(this.rooms));
    }

    // Generate room statistics
    getRoomStatistics() {
        const totalRooms = this.rooms.length;
        const availableRooms = this.rooms.filter(r => r.status === 'available').length;
        const occupiedRooms = this.rooms.filter(r => r.status === 'occupied').length;
        const maintenanceRooms = this.rooms.filter(r => r.status === 'maintenance').length;

        return {
            totalRooms,
            availableRooms,
            occupiedRooms,
            maintenanceRooms,
            occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
        };
    }

    // Search rooms based on criteria
    searchRooms(criteria) {
        return this.rooms.filter(room => {
            if (criteria.status && room.status !== criteria.status) return false;
            if (criteria.type && room.type !== criteria.type) return false;
            if (critriteria.minPrice && room.price < criteria.minPrice) return false;
            if (criteria.maxPrice && room.price > criteria.maxPrice) return false;
            if (criteria.floor && room.floor !== criteria.floor) return false;
            return true;
        });
    }

    // Assign tenant to room
    assignTenantToRoom(roomId, tenantId) {
        const room = this.getRoomById(roomId);
        if (!room) return { success: false, message: 'Room not found' };
        if (room.status === 'occupied') return { success: false, message: 'Room is already occupied' };

        room.status = 'occupied';
        room.tenantId = tenantId;
        room.occupiedSince = new Date().toISOString();
        
        this.saveRooms();
        return { success: true };
    }

    // Remove tenant from room
    vacateRoom(roomId) {
        const room = this.getRoomById(roomId);
        if (!room) return { success: false, message: 'Room not found' };
        if (room.status !== 'occupied') return { success: false, message: 'Room is not occupied' };

        room.status = 'available';
        delete room.tenantId;
        delete room.occupiedSince;
        
        this.saveRooms();
        return { success: true };
    }
}

// Initialize room manager
window.roomManager = new RoomManager();