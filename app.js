// Module principal de l'application
const App = {
    // Initialiser l'application
    init() {
        DataManager.init();
        BackupManager.initAutoBackup();
        ViewManager.showView('calendar');
    }
};

// Fonctions globales pour maintenir la compatibilité avec les événements HTML
window.closeModal = Utils.closeModal;

// Initialisation au chargement de la page
window.onload = Auth.checkAuth;