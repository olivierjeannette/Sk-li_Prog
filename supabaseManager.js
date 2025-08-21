// Gestionnaire Supabase
const SupabaseManager = {
    supabaseUrl: 'https://dhzknhevbzdauakzbdhr.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTgxMDksImV4cCI6MjA3MTI3NDEwOX0.5L-qsdi8a5Ov7RufgXQQgG27rtAlvIvbG6mZ_fVOk2k',
    
    // Initialiser Supabase
    init() {
        // Simple client sans SDK pour réduire la complexité
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
        };
    },

    // Sauvegarder les données
    async saveData(data) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/app_data`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    user_id: 'default',
                    data: data,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                // Si erreur, essayer update
                return await this.updateData(data);
            }

            console.log('Données sauvegardées sur Supabase');
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde Supabase:', error);
            return false;
        }
    },

    // Mettre à jour les données
    async updateData(data) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/app_data?user_id=eq.default`, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify({
                    data: data,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Erreur update');
            }

            console.log('Données mises à jour sur Supabase');
            return true;
        } catch (error) {
            console.error('Erreur update Supabase:', error);
            return false;
        }
    },

    // Charger les données
    async loadData() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/app_data?user_id=eq.default&select=data&order=updated_at.desc&limit=1`, {
                headers: this.headers
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            if (result && result.length > 0) {
                console.log('Données chargées depuis Supabase');
                return result[0].data;
            }

            return null;
        } catch (error) {
            console.error('Erreur chargement Supabase:', error);
            return null;
        }
    },

    // Sync automatique
    async syncData(localData) {
        const success = await this.saveData(localData);
        if (success) {
            Utils.showNotification('Données synchronisées avec le cloud', 'success');
        } else {
            Utils.showNotification('Erreur de synchronisation', 'warning');
        }
        return success;
    }
};
/ Gestionnaire des données avec sync Supabase
const DataManager = {
    // Structure des données par défaut
    defaultData: {
        calendar: {},
        members: {},
        exercises: CONFIG.DEFAULT_EXERCISES
    },
    
    // Données actuelles
    workoutData: {},
    syncInterval: null,
    
    // Initialiser les données
    async init() {
        await this.loadData();
        this.setupAutoSync();
    },
    
    // Charger les données depuis localStorage et Supabase
    async loadData() {
        // Charger depuis localStorage d'abord
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.DATA);
        if (saved) {
            this.workoutData = { ...this.defaultData, ...JSON.parse(saved) };
        } else {
            this.workoutData = { ...this.defaultData };
        }

        // Essayer de charger depuis Supabase
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const cloudData = await SupabaseManager.loadData();
                if (cloudData) {
                    // Fusionner avec les données locales (cloud prioritaire)
                    this.workoutData = { ...this.workoutData, ...cloudData };
                    this.saveToLocalStorage(); // Sauver la fusion localement
                    console.log('Données synchronisées depuis Supabase');
                }
            }
        } catch (error) {
            console.log('Pas de données cloud, utilisation locale');
        }
    },
    
    // Sauvegarder dans localStorage uniquement
    saveToLocalStorage() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.DATA, JSON.stringify(this.workoutData));
    },
    
    // Sauvegarder les données (local + cloud)
    async saveData() {
        // Sauver localement
        this.saveToLocalStorage();
        
        // Sauver dans le cloud (sans attendre pour ne pas bloquer l'UI)
        if (typeof SupabaseManager !== 'undefined') {
            SupabaseManager.syncData(this.workoutData).catch(console.error);
        }
    },
    
    // Setup auto-sync toutes les 2 minutes
    setupAutoSync() {
        if (typeof SupabaseManager !== 'undefined') {
            this.syncInterval = setInterval(() => {
                SupabaseManager.syncData(this.workoutData);
            }, 2 * 60 * 1000); // 2 minutes
        }
    },
    
    // Méthodes existantes modifiées pour utiliser saveData()
    saveSession(dateKey, sessionData) {
        if (!this.workoutData.calendar) {
            this.workoutData.calendar = {};
        }
        
        this.workoutData.calendar[dateKey] = {
            ...sessionData,
            createdAt: this.workoutData.calendar[dateKey]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.saveData();
    },
    
    deleteSession(dateKey) {
        if (this.workoutData.calendar && this.workoutData.calendar[dateKey]) {
            delete this.workoutData.calendar[dateKey];
            this.saveData();
        }
    },
    
    saveMember(memberData) {
        if (!this.workoutData.members) {
            this.workoutData.members = {};
        }
        
        this.workoutData.members[memberData.id] = memberData;
        this.saveData();
    },
    
    deleteMember(memberId) {
        if (this.workoutData.members && this.workoutData.members[memberId]) {
            delete this.workoutData.members[memberId];
            this.saveData();
        }
    },
    
    // Reste des méthodes inchangées...
    getCalendarData() {
        return this.workoutData.calendar || {};
    },
    
    getMembersData() {
        return this.workoutData.members || {};
    },
    
    getExercises() {
        return this.workoutData.exercises || CONFIG.DEFAULT_EXERCISES;
    },
    
    getSession(dateKey) {
        return this.workoutData.calendar ? this.workoutData.calendar[dateKey] : null;
    },
    
    getMember(memberId) {
        return this.workoutData.members ? this.workoutData.members[memberId] : null;
    },
    
    getAllMembers() {
        return Object.values(this.workoutData.members || {});
    },
    
    resetData() {
        this.workoutData = { ...this.defaultData };
        this.saveData();
    },
    
    importData(newData, merge = false) {
        if (merge) {
            this.workoutData = {
                calendar: { ...(this.workoutData.calendar || {}), ...(newData.calendar || {}) },
                members: { ...(this.workoutData.members || {}), ...(newData.members || {}) },
                exercises: { ...(this.workoutData.exercises || {}), ...(newData.exercises || {}) }
            };
        } else {
            this.workoutData = { ...this.defaultData, ...newData };
        }
        this.saveData();
    },
    
    exportAllData() {
        return {
            version: "1.0",
            exportDate: new Date().toISOString(),
            appName: "Skali Prog",
            data: this.workoutData,
            metadata: {
                totalSessions: Object.keys(this.workoutData.calendar || {}).length,
                totalMembers: Object.keys(this.workoutData.members || {}).length,
                dataSize: JSON.stringify(this.workoutData).length
            }
        };
    },
    
    exportSessionsOnly() {
        return {
            version: "1.0",
            exportDate: new Date().toISOString(),
            appName: "Skali Prog - Séances uniquement",
            data: {
                calendar: this.workoutData.calendar || {},
                exercises: this.workoutData.exercises || {}
            }
        };
    },
    
    exportMembersOnly() {
        return {
            version: "1.0",
            exportDate: new Date().toISOString(),
            appName: "Skali Prog - Adhérents uniquement",
            data: {
                members: this.workoutData.members || {},
                exercises: this.workoutData.exercises || {}
            }
        };
    }
};