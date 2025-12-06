class XMLLoader {
    constructor() {
        this.xmlData = {};
    }

    // Load XML from file
    async loadXMLFile(filename) {
        try {
            const response = await fetch(`../xml/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Parse XML based on file type
            switch(filename) {
                case 'rooms.xml':
                    return this.parseRoomsXML(xmlDoc);
                case 'tenants.xml':
                    return this.parseTenantsXML(xmlDoc);
                case 'payments.xml':
                    return this.parsePaymentsXML(xmlDoc);
                case 'rental_requests.xml':
                    return this.parseRentalRequestsXML(xmlDoc);
                case 'announcements.xml':
                    return this.parseAnnouncementsXML(xmlDoc);
                default:
                    return this.parseGenericXML(xmlDoc);
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    // Parse rooms XML
    parseRoomsXML(xmlDoc) {
        const rooms = [];
        const roomElements = xmlDoc.getElementsByTagName('room');
        
        for (let room of roomElements) {
            rooms.push({
                id: this.getChildValue(room, 'id'),
                roomNumber: this.getChildValue(room, 'roomNumber'),
                type: this.getChildValue(room, 'type'),
                floor: this.getChildValue(room, 'floor'),
                price: parseFloat(this.getChildValue(room, 'price')),
                size: this.getChildValue(room, 'size'),
                amenities: this.getChildValues(room, 'amenities', 'amenity'),
                status: this.getChildValue(room, 'status'),
                description: this.getChildValue(room, 'description'),
                tenantId: this.getChildValue(room, 'tenantId'),
                occupiedSince: this.getChildValue(room, 'occupiedSince')
            });
        }
        
        return rooms;
    }

    // Parse tenants XML
    parseTenantsXML(xmlDoc) {
        const tenants = [];
        const tenantElements = xmlDoc.getElementsByTagName('tenant');
        
        for (let tenant of tenantElements) {
            tenants.push({
                id: this.getChildValue(tenant, 'id'),
                username: this.getChildValue(tenant, 'username'),
                password: this.getChildValue(tenant, 'password'),
                email: this.getChildValue(tenant, 'email'),
                fullName: this.getChildValue(tenant, 'fullName'),
                phone: this.getChildValue(tenant, 'phone'),
                emergencyContact: this.getChildValue(tenant, 'emergencyContact'),
                occupation: this.getChildValue(tenant, 'occupation'),
                roomId: this.getChildValue(tenant, 'roomId'),
                moveInDate: this.getChildValue(tenant, 'moveInDate'),
                status: this.getChildValue(tenant, 'status'),
                createdAt: this.getChildValue(tenant, 'createdAt'),
                notes: this.getChildValue(tenant, 'notes')
            });
        }
        
        return tenants;
    }

    // Parse payments XML
    parsePaymentsXML(xmlDoc) {
        const payments = [];
        const paymentElements = xmlDoc.getElementsByTagName('payment');
        
        for (let payment of paymentElements) {
            payments.push({
                id: this.getChildValue(payment, 'id'),
                tenantId: this.getChildValue(payment, 'tenantId'),
                tenantName: this.getChildValue(payment, 'tenantName'),
                roomId: this.getChildValue(payment, 'roomId'),
                roomNumber: this.getChildValue(payment, 'roomNumber'),
                amount: parseFloat(this.getChildValue(payment, 'amount')),
                paymentDate: this.getChildValue(payment, 'paymentDate'),
                dueDate: this.getChildValue(payment, 'dueDate'),
                paymentMethod: this.getChildValue(payment, 'paymentMethod'),
                status: this.getChildValue(payment, 'status'),
                receiptNumber: this.getChildValue(payment, 'receiptNumber'),
                notes: this.getChildValue(payment, 'notes'),
                recordedAt: this.getChildValue(payment, 'recordedAt'),
                recordedBy: this.getChildValue(payment, 'recordedBy')
            });
        }
        
        return payments;
    }

    // Parse rental requests XML
    parseRentalRequestsXML(xmlDoc) {
        const requests = [];
        const requestElements = xmlDoc.getElementsByTagName('request');
        
        for (let request of requestElements) {
            requests.push({
                id: this.getChildValue(request, 'id'),
                tenantId: this.getChildValue(request, 'tenantId'),
                tenantName: this.getChildValue(request, 'tenantName'),
                roomId: this.getChildValue(request, 'roomId'),
                roomNumber: this.getChildValue(request, 'roomNumber'),
                requestDate: this.getChildValue(request, 'requestDate'),
                moveInDate: this.getChildValue(request, 'moveInDate'),
                contractDuration: this.getChildValue(request, 'contractDuration'),
                occupants: this.getChildValue(request, 'occupants'),
                emergencyContact: this.getChildValue(request, 'emergencyContact'),
                notes: this.getChildValue(request, 'notes'),
                status: this.getChildValue(request, 'status'),
                approvedBy: this.getChildValue(request, 'approvedBy'),
                approvedDate: this.getChildValue(request, 'approvedDate'),
                declinedBy: this.getChildValue(request, 'declinedBy'),
                declinedDate: this.getChildValue(request, 'declinedDate'),
                declineReason: this.getChildValue(request, 'declineReason'),
                monthlyRent: parseFloat(this.getChildValue(request, 'monthlyRent')),
                securityDeposit: parseFloat(this.getChildValue(request, 'securityDeposit')),
                advancePayment: parseFloat(this.getChildValue(request, 'advancePayment'))
            });
        }
        
        return requests;
    }

    // Parse announcements XML
    parseAnnouncementsXML(xmlDoc) {
        const announcements = [];
        const announcementElements = xmlDoc.getElementsByTagName('announcement');
        
        for (let announcement of announcementElements) {
            announcements.push({
                id: this.getChildValue(announcement, 'id'),
                title: this.getChildValue(announcement, 'title'),
                content: this.getChildValue(announcement, 'content'),
                priority: this.getChildValue(announcement, 'priority'),
                category: this.getChildValue(announcement, 'category'),
                date: this.getChildValue(announcement, 'date'),
                expiryDate: this.getChildValue(announcement, 'expiryDate'),
                status: this.getChildValue(announcement, 'status'),
                pinned: this.getChildValue(announcement, 'pinned') === 'true',
                createdBy: this.getChildValue(announcement, 'createdBy'),
                views: parseInt(this.getChildValue(announcement, 'views') || 0)
            });
        }
        
        return announcements;
    }

    // Parse generic XML (fallback)
    parseGenericXML(xmlDoc) {
        const data = {};
        const root = xmlDoc.documentElement;
        data[root.nodeName] = this.xmlToObject(root);
        return data;
    }

    // Convert XML node to JavaScript object
    xmlToObject(node) {
        const obj = {};
        
        // Handle attributes
        if (node.attributes && node.attributes.length > 0) {
            obj['@attributes'] = {};
            for (let attr of node.attributes) {
                obj['@attributes'][attr.name] = attr.value;
            }
        }
        
        // Handle child nodes
        for (let child of node.childNodes) {
            if (child.nodeType === 1) { // Element node
                const childName = child.nodeName;
                
                if (obj[childName]) {
                    // If already exists, convert to array
                    if (!Array.isArray(obj[childName])) {
                        obj[childName] = [obj[childName]];
                    }
                    obj[childName].push(this.xmlToObject(child));
                } else {
                    obj[childName] = this.xmlToObject(child);
                }
            } else if (child.nodeType === 3 && child.textContent.trim()) { // Text node
                return child.textContent.trim();
            }
        }
        
        return obj;
    }

    // Helper method to get child element value
    getChildValue(parent, childName) {
        const element = parent.getElementsByTagName(childName)[0];
        return element ? element.textContent : '';
    }

    // Helper method to get multiple child element values as array
    getChildValues(parent, containerName, childName) {
        const container = parent.getElementsByTagName(containerName)[0];
        if (!container) return [];
        
        const children = container.getElementsByTagName(childName);
        return Array.from(children).map(child => child.textContent);
    }

    // Load all XML files
    async loadAllData() {
        try {
            const files = [
                'rooms.xml',
                'tenants.xml',
                'payments.xml',
                'rental_requests.xml',
                'announcements.xml'
            ];
            
            const promises = files.map(file => this.loadXMLFile(file));
            const results = await Promise.allSettled(promises);
            
            const data = {
                rooms: [],
                tenants: [],
                payments: [],
                rental_requests: [],
                announcements: []
            };
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const fileName = files[index].replace('.xml', '');
                    data[fileName] = result.value;
                }
            });
            
            this.xmlData = data;
            return data;
        } catch (error) {
            console.error('Error loading all XML data:', error);
            return null;
        }
    }

    // Save data to localStorage
    saveToLocalStorage(data) {
        if (data.rooms) localStorage.setItem('rooms', JSON.stringify(data.rooms));
        if (data.tenants) localStorage.setItem('tenants', JSON.stringify(data.tenants));
        if (data.payments) localStorage.setItem('payments', JSON.stringify(data.payments));
        if (data.rental_requests) localStorage.setItem('rental_requests', JSON.stringify(data.rental_requests));
        if (data.announcements) localStorage.setItem('announcements', JSON.stringify(data.announcements));
        
        RentariumUtils.showNotification('Data loaded from XML successfully!', 'success');
    }

    // Export data to XML
    exportToXML(dataType, data) {
        let xmlString = '';
        
        switch(dataType) {
            case 'rooms':
                xmlString = this.createRoomsXML(data);
                break;
            case 'tenants':
                xmlString = this.createTenantsXML(data);
                break;
            case 'payments':
                xmlString = this.createPaymentsXML(data);
                break;
            case 'announcements':
                xmlString = this.createAnnouncementsXML(data);
                break;
            default:
                xmlString = this.createGenericXML(dataType, data);
        }
        
        return xmlString;
    }

    // Create rooms XML
    createRoomsXML(rooms) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rooms>\n';
        
        rooms.forEach(room => {
            xml += '  <room>\n';
            xml += `    <id>${room.id || ''}</id>\n`;
            xml += `    <roomNumber>${room.roomNumber || ''}</roomNumber>\n`;
            xml += `    <type>${room.type || ''}</type>\n`;
            xml += `    <floor>${room.floor || ''}</floor>\n`;
            xml += `    <price>${room.price || 0}</price>\n`;
            xml += `    <size>${room.size || ''}</size>\n`;
            
            if (room.amenities && room.amenities.length > 0) {
                xml += '    <amenities>\n';
                room.amenities.forEach(amenity => {
                    xml += `      <amenity>${amenity}</amenity>\n`;
                });
                xml += '    </amenities>\n';
            }
            
            xml += `    <status>${room.status || 'available'}</status>\n`;
            xml += `    <description>${room.description || ''}</description>\n`;
            xml += `    <tenantId>${room.tenantId || ''}</tenantId>\n`;
            xml += `    <occupiedSince>${room.occupiedSince || ''}</occupiedSince>\n`;
            xml += '  </room>\n';
        });
        
        xml += '</rooms>';
        return xml;
    }

    // Create tenants XML
    createTenantsXML(tenants) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tenants>\n';
        
        tenants.forEach(tenant => {
            xml += '  <tenant>\n';
            xml += `    <id>${tenant.id || ''}</id>\n`;
            xml += `    <username>${tenant.username || ''}</username>\n`;
            xml += `    <password>${tenant.password || ''}</password>\n`;
            xml += `    <email>${tenant.email || ''}</email>\n`;
            xml += `    <fullName>${tenant.fullName || ''}</fullName>\n`;
            xml += `    <phone>${tenant.phone || ''}</phone>\n`;
            xml += `    <emergencyContact>${tenant.emergencyContact || ''}</emergencyContact>\n`;
            xml += `    <occupation>${tenant.occupation || ''}</occupation>\n`;
            xml += `    <roomId>${tenant.roomId || ''}</roomId>\n`;
            xml += `    <moveInDate>${tenant.moveInDate || ''}</moveInDate>\n`;
            xml += `    <status>${tenant.status || 'active'}</status>\n`;
            xml += `    <createdAt>${tenant.createdAt || ''}</createdAt>\n`;
            xml += `    <notes>${tenant.notes || ''}</notes>\n`;
            xml += '  </tenant>\n';
        });
        
        xml += '</tenants>';
        return xml;
    }

    // Create generic XML (fallback)
    createGenericXML(rootName, data) {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
        
        if (Array.isArray(data)) {
            data.forEach(item => {
                xml += '  <item>\n';
                Object.entries(item).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        xml += `    <${key}>\n`;
                        value.forEach(subItem => {
                            xml += `      <item>${subItem}</item>\n`;
                        });
                        xml += `    </${key}>\n`;
                    } else {
                        xml += `    <${key}>${value || ''}</${key}>\n`;
                    }
                });
                xml += '  </item>\n';
            });
        } else {
            Object.entries(data).forEach(([key, value]) => {
                xml += `  <${key}>${value || ''}</${key}>\n`;
            });
        }
        
        xml += `</${rootName}>`;
        return xml;
    }

    // Download XML file
    downloadXML(filename, xmlContent) {
        const blob = new Blob([xmlContent], { type: 'text/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Import data from XML file input
    async importFromXMLFile(file, dataType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const xmlText = event.target.result;
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                    
                    let data;
                    switch(dataType) {
                        case 'rooms':
                            data = this.parseRoomsXML(xmlDoc);
                            break;
                        case 'tenants':
                            data = this.parseTenantsXML(xmlDoc);
                            break;
                        case 'payments':
                            data = this.parsePaymentsXML(xmlDoc);
                            break;
                        case 'rental_requests':
                            data = this.parseRentalRequestsXML(xmlDoc);
                            break;
                        case 'announcements':
                            data = this.parseAnnouncementsXML(xmlDoc);
                            break;
                        default:
                            data = this.parseGenericXML(xmlDoc);
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
}

// Initialize XML loader
window.xmlLoader = new XMLLoader();

// Add to utils for easy access
if (window.RentariumUtils) {
    RentariumUtils.loadXMLData = async function() {
        const data = await xmlLoader.loadAllData();
        if (data) {
            xmlLoader.saveToLocalStorage(data);
            return true;
        }
        return false;
    };
    
    RentariumUtils.exportData = function(dataType) {
        let data;
        switch(dataType) {
            case 'rooms':
                data = JSON.parse(localStorage.getItem('rooms') || '[]');
                break;
            case 'tenants':
                data = JSON.parse(localStorage.getItem('tenants') || '[]');
                break;
            case 'payments':
                data = JSON.parse(localStorage.getItem('payments') || '[]');
                break;
            case 'announcements':
                data = JSON.parse(localStorage.getItem('announcements') || '[]');
                break;
        }
        
        if (data && data.length > 0) {
            const xmlContent = xmlLoader.exportToXML(dataType, data);
            xmlLoader.downloadXML(`${dataType}_${new Date().toISOString().split('T')[0]}.xml`, xmlContent);
            return true;
        }
        return false;
    };
}