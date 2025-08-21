// Gestionnaire des données
const DataManager = {
    // Structure des données par défaut
    defaultData: {
        calendar: {},
        members: {},
        exercises: CONFIG.DEFAULT_EXERCISES
    },
    
    // Données actuelles
    workoutData: {},
    
    // Initialiser les données
    init() {
        this.loadData();
    },
    
    // Charger les données depuis localStorage
    loadData() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.DATA);
        if (saved) {
            const savedData = JSON.parse(saved);
            this.workoutData = { ...this.defaultData, ...savedData };
        } else {
            this.workoutData = { ...this.defaultData };
        }
    },
    
    // Sauvegarder les données dans localStorage
    saveData() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.DATA, JSON.stringify(this.workoutData));
    },
    
    // Obtenir les données du calendrier
    getCalendarData() {
        return this.workoutData.calendar || {};
    },
    
    // Obtenir les données des membres
    getMembersData() {
        return this.workoutData.members || {};
    },
    
    // Obtenir les exercices
    getExercises() {
        return this.workoutData.exercises || CONFIG.DEFAULT_EXERCISES;
    },
    
    // Sauvegarder une séance
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
    
    // Supprimer une séance
    deleteSession(dateKey) {
        if (this.workoutData.calendar && this.workoutData.calendar[dateKey]) {
            delete this.workoutData.calendar[dateKey];
            this.saveData();
        }
    },
    
    // Obtenir une séance
    getSession(dateKey) {
        return this.workoutData.calendar ? this.workoutData.calendar[dateKey] : null;
    },
    
    // Sauvegarder un membre
    saveMember(memberData) {
        if (!this.workoutData.members) {
            this.workoutData.members = {};
        }
        
        this.workoutData.members[memberData.id] = memberData;
        this.saveData();
    },
    
    // Supprimer un membre
    deleteMember(memberId) {
        if (this.workoutData.members && this.workoutData.members[memberId]) {
            delete this.workoutData.members[memberId];
            this.saveData();
        }
    },
    
    // Obtenir un membre
    getMember(memberId) {
        return this.workoutData.members ? this.workoutData.members[memberId] : null;
    },
    
    // Obtenir tous les membres
    getAllMembers() {
        return Object.values(this.workoutData.members || {});
    },
    
    // Réinitialiser toutes les données
    resetData() {
        this.workoutData = { ...this.defaultData };
        this.saveData();
    },
    
    // Importer des données
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
    
    // Exporter toutes les données
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
    
    // Exporter seulement les séances
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
    
    // Exporter seulement les membres
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