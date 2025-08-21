// Configuration globale de l'application
const CONFIG = {
    // Mot de passe administrateur (à changer !)
    ADMIN_PASSWORD: 'skaliprog',
    
    // Catégories de séances avec couleurs et icônes
    SESSION_CATEGORIES: {
        'crosstraining': { name: 'CrossTraining', color: '#ef4444', icon: 'fas fa-fire' },
        'musculation': { name: 'Musculation', color: '#3b82f6', icon: 'fas fa-dumbbell' },
        'cardio': { name: 'Cardio', color: '#10b981', icon: 'fas fa-heart' },
        'hyrox': { name: 'Hyrox', color: '#f59e0b', icon: 'fas fa-running' },
        'recovery': { name: 'Récupération', color: '#8b5cf6', icon: 'fas fa-leaf' },
        
    },
    
    // Exercices par catégorie
    DEFAULT_EXERCISES: {
        'Crosstraining': [
            'Clean', 'Snatch', 'StrictPress', 'PushPress','Jerk','OVH squat',  'Traction', 'Thrusters'
        ],
        'Musculation': [
            'Développé Couché', 'Deadlift', 'Back squat',
            'front squat', 'Ring Dips',
        ],
        'Cardio': [
            'Run 600m', 'Run 1200m', '500m Rameur','1km Rameur','500m skierg', '1km Ski Erg','500m bikerg', '1km bikerg'
        ]
    },
    
    // Clés de stockage localStorage
    STORAGE_KEYS: {
        DATA: 'skaliWorkoutData',
        AUTH: 'skaliAuth',
        LAST_BACKUP: 'skaliLastBackup',
        AUTO_BACKUP: 'skaliAutoBackup'
    }
};