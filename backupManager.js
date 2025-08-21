// Gestionnaire de sauvegarde et restauration
const BackupManager = {
    autoBackupInterval: null,
    
    // Afficher la modal de sauvegarde
    showBackupModal() {
        const dataSize = JSON.stringify(DataManager.workoutData).length;
        const dataSizeKB = (dataSize / 1024).toFixed(2);
        const lastBackup = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_BACKUP);
        const totalSessions = Object.keys(DataManager.getCalendarData()).length;
        const totalMembers = Object.keys(DataManager.getMembersData()).length;
        
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-skali" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold mb-6">
                        <i class="fas fa-shield-alt text-skali-accent mr-3"></i>
                        Sauvegarde & Restauration
                    </h3>
                    
                    <!-- Stats -->
                    <div class="bg-skali-dark rounded-lg p-4 mb-6">
                        <h4 class="font-medium mb-3 text-skali-accent">État des données</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-400">${totalSessions}</div>
                                <div class="text-gray-400">Séances</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-400">${totalMembers}</div>
                                <div class="text-gray-400">Adhérents</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-400">${dataSizeKB}</div>
                                <div class="text-gray-400">KB données</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-orange-400">
                                    ${lastBackup ? new Date(lastBackup).toLocaleDateString('fr-FR') : 'Jamais'}
                                </div>
                                <div class="text-gray-400">Dernière backup</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Export Options -->
                    <div class="space-y-4 mb-6">
                        <h4 class="font-medium text-skali-accent">Exporter les données</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button onclick="BackupManager.exportFullBackup()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-database text-green-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Sauvegarde complète</div>
                                        <div class="text-sm text-gray-400">Toutes les données (JSON)</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportSessionsOnly()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-calendar text-blue-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Séances uniquement</div>
                                        <div class="text-sm text-gray-400">Planning sans adhérents</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportMembersOnly()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-users text-purple-400 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Adhérents uniquement</div>
                                        <div class="text-sm text-gray-400">Performances sans planning</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                            
                            <button onclick="BackupManager.exportToExcel()" class="flex items-center justify-between p-4 bg-skali-dark rounded-lg hover:bg-opacity-80 transition">
                                <div class="flex items-center">
                                    <i class="fas fa-file-excel text-green-500 text-xl mr-3"></i>
                                    <div class="text-left">
                                        <div class="font-medium">Export Excel</div>
                                        <div class="text-sm text-gray-400">Format tableur (.csv)</div>
                                    </div>
                                </div>
                                <i class="fas fa-download text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Import Section -->
                    <div class="space-y-4 mb-6">
                        <h4 class="font-medium text-skali-accent">Restaurer les données</h4>
                        <div class="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-triangle text-yellow-400 mr-3"></i>
                                <div class="text-sm">
                                    <strong>Attention :</strong> La restauration remplacera toutes les données actuelles.
                                    Effectuez une sauvegarde avant d'importer.
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium mb-2">Fichier de sauvegarde (.json)</label>
                                <input type="file" id="backupFileInput" accept=".json" 
                                       class="w-full rounded-lg p-3 bg-skali-dark border border-gray-600">
                            </div>
                            
                            <div class="flex space-x-2">
                                <button onclick="BackupManager.importBackup(false)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                                    <i class="fas fa-upload mr-2"></i>Restaurer (Remplacer)
                                </button>
                                <button onclick="BackupManager.importBackup(true)" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                                    <i class="fas fa-plus mr-2"></i>Importer (Fusionner)
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Auto Backup -->
                    <div class="bg-skali-dark rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-medium">Sauvegarde automatique</h4>
                                <p class="text-sm text-gray-400">Télécharge automatiquement une sauvegarde chaque semaine</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="autoBackupToggle" class="sr-only peer" 
                                       ${localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP) === 'true' ? 'checked' : ''}
                                       onchange="BackupManager.toggleAutoBackup()">
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skali-accent"></div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="Utils.closeModal()" class="flex-1 btn-secondary py-2 rounded-lg">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },
    
    // Export sauvegarde complète
    exportFullBackup() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `skali_prog_backup_${timestamp}.json`;
        
        const exportData = DataManager.exportAllData();
        Utils.downloadJSON(exportData, filename);
        
        // Mettre à jour le timestamp de dernière sauvegarde
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        
        Utils.showNotification('Sauvegarde complète téléchargée avec succès !', 'success');
    },
    
    // Export séances uniquement
    exportSessionsOnly() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `skali_prog_sessions_${timestamp}.json`;
        
        const exportData = DataManager.exportSessionsOnly();
        Utils.downloadJSON(exportData, filename);
        Utils.showNotification('Planning exporté avec succès !', 'success');
    },
    
    // Export adhérents uniquement
    exportMembersOnly() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `skali_prog_members_${timestamp}.json`;
        
        const exportData = DataManager.exportMembersOnly();
        Utils.downloadJSON(exportData, filename);
        Utils.showNotification('Adhérents exportés avec succès !', 'success');
    },
    
    // Export vers Excel
    exportToExcel() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `skali_prog_data_${timestamp}.csv`;
        
        let csvContent = "Type,Date,Titre,Catégorie,Nom,Prénom,Exercice,Performance,Notes\n";
        
        // Ajouter les séances
        Object.entries(DataManager.getCalendarData()).forEach(([date, session]) => {
            const title = (session.title || 'Séance').replace(/,/g, ';');
            const category = session.category || '';
            csvContent += `Séance,${date},"${title}","${category}",,,,,"${(session.blocks || []).map(b => b.name).join('; ')}"\n`;
        });
        
        // Ajouter les performances des adhérents
        Object.values(DataManager.getMembersData()).forEach(member => {
            Object.entries(member.performances || {}).forEach(([exercise, performances]) => {
                performances.forEach(perf => {
                    const date = new Date(perf.date).toISOString().slice(0, 10);
                    const notes = (perf.notes || '').replace(/,/g, ';');
                    csvContent += `Performance,${date},,,"${member.lastName}","${member.firstName}","${exercise}","${Utils.formatPerformanceValue(perf)}","${notes}"\n`;
                });
            });
        });
        
        Utils.downloadCSV(csvContent, filename);
        Utils.showNotification('Données exportées en Excel avec succès !', 'success');
    },
    
    // Importer une sauvegarde
    importBackup(merge = false) {
        const fileInput = document.getElementById('backupFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            Utils.showNotification('Veuillez sélectionner un fichier de sauvegarde', 'error');
            return;
        }
        
        if (!file.name.endsWith('.json')) {
            Utils.showNotification('Format de fichier invalide. Utilisez un fichier .json', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Valider la structure
                if (!importedData.data || !importedData.version) {
                    throw new Error('Structure de fichier invalide');
                }
                
                const action = merge ? 'fusionner' : 'remplacer';
                if (confirm(`Êtes-vous sûr de vouloir ${action} les données actuelles ?`)) {
                    DataManager.importData(importedData.data, merge);
                    
                    Utils.closeModal();
                    ViewManager.showView('calendar'); // Rafraîchir la vue
                    
                    const actionText = merge ? 'fusionnées' : 'restaurées';
                    Utils.showNotification(`Données ${actionText} avec succès !`, 'success');
                }
            } catch (error) {
                console.error('Import error:', error);
                Utils.showNotification('Erreur lors de l\'importation : fichier corrompu ou invalide', 'error');
            }
        };
        
        reader.readAsText(file);
    },
    
    // Activer/désactiver la sauvegarde automatique
    toggleAutoBackup() {
        const enabled = document.getElementById('autoBackupToggle').checked;
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP, enabled.toString());
        
        if (enabled) {
            this.setupAutoBackup();
            Utils.showNotification('Sauvegarde automatique activée', 'success');
        } else {
            clearInterval(this.autoBackupInterval);
            Utils.showNotification('Sauvegarde automatique désactivée', 'info');
        }
    },
    
    // Configurer la sauvegarde automatique
    setupAutoBackup() {
        // Vérifier la sauvegarde automatique toutes les heures
        this.autoBackupInterval = setInterval(() => {
            const lastBackup = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_BACKUP);
            const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
            
            if (!lastBackup || (Date.now() - new Date(lastBackup).getTime()) > oneWeek) {
                this.exportFullBackup();
                console.log('Auto backup completed');
            }
        }, 60 * 60 * 1000); // Vérifier toutes les heures
    },
    
    // Initialiser la sauvegarde automatique au chargement
    initAutoBackup() {
        if (localStorage.getItem(CONFIG.STORAGE_KEYS.AUTO_BACKUP) === 'true') {
            this.setupAutoBackup();
        }
    }
};