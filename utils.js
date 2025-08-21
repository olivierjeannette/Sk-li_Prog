// Fonctions utilitaires
const Utils = {
    // Formater une date en clé (YYYY-MM-DD)
    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    // Fermer une modal
    closeModal(event) {
        if (!event || event.target === event.currentTarget) {
            document.getElementById('modalContainer').innerHTML = '';
        }
    },
    
    // Afficher une notification
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600',
            warning: 'bg-yellow-600'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 fade-in`;
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // Télécharger un fichier JSON
    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Télécharger un fichier CSV
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Convertir le temps en secondes
    parseTimeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1]; // mm:ss
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
        }
        return 0;
    },
    
    // Formater une valeur de performance
    formatPerformanceValue(performance) {
        switch(performance.type) {
            case 'weight':
                return `${performance.value} kg`;
            case 'time':
                return performance.value;
            case 'distance':
                return `${performance.value} m`;
            case 'reps':
                return `${performance.value} reps`;
            default:
                return performance.value;
        }
    },
    
    // Calculer l'évolution entre deux performances
    calculateEvolution(current, previous) {
        if (!previous) return null;
        
        // Pour les performances basées sur le temps (plus bas = mieux)
        if (current.type === 'time') {
            const currentTime = this.parseTimeToSeconds(current.value);
            const previousTime = this.parseTimeToSeconds(previous.value);
            const diff = previousTime - currentTime;
            const percentage = ((diff / previousTime) * 100).toFixed(1);
            
            if (diff > 0) {
                return { 
                    value: diff, 
                    icon: 'arrow-up', 
                    color: 'performance-trend-up', 
                    text: `-${Math.abs(percentage)}%` 
                };
            } else if (diff < 0) {
                return { 
                    value: diff, 
                    icon: 'arrow-down', 
                    color: 'performance-trend-down', 
                    text: `+${Math.abs(percentage)}%` 
                };
            } else {
                return { 
                    value: 0, 
                    icon: 'minus', 
                    color: 'performance-trend-stable', 
                    text: '0%' 
                };
            }
        }
        
        // Pour le poids, distance, reps (plus haut = mieux)
        const currentVal = parseFloat(current.value);
        const previousVal = parseFloat(previous.value);
        const diff = currentVal - previousVal;
        const percentage = ((diff / previousVal) * 100).toFixed(1);
        
        if (diff > 0) {
            return { 
                value: diff, 
                icon: 'arrow-up', 
                color: 'performance-trend-up', 
                text: `+${percentage}%` 
            };
        } else if (diff < 0) {
            return { 
                value: diff, 
                icon: 'arrow-down', 
                color: 'performance-trend-down', 
                text: `${percentage}%` 
            };
        } else {
            return { 
                value: 0, 
                icon: 'minus', 
                color: 'performance-trend-stable', 
                text: '0%' 
            };
        }
    },
    
    // Calculer la tendance
    calculateTrend(latest, previous) {
        if (!previous) {
            return { icon: 'minus', color: 'performance-trend-stable', text: 'Première mesure' };
        }
        
        const evolution = this.calculateEvolution(latest, previous);
        if (evolution.value > 0) {
            return { icon: 'arrow-up', color: 'performance-trend-up', text: 'En progression' };
        } else if (evolution.value < 0) {
            return { icon: 'arrow-down', color: 'performance-trend-down', text: 'En baisse' };
        } else {
            return { icon: 'minus', color: 'performance-trend-stable', text: 'Stable' };
        }
    },
    
    // Obtenir la date de dernière performance d'un membre
    getLastPerformanceDate(member) {
        if (!member.performances) return 'Jamais';
        
        let latestDate = null;
        Object.values(member.performances).forEach(exercisePerfs => {
            exercisePerfs.forEach(perf => {
                const perfDate = new Date(perf.date);
                if (!latestDate || perfDate > latestDate) {
                    latestDate = perfDate;
                }
            });
        });
        
        return latestDate ? latestDate.toLocaleDateString('fr-FR') : 'Jamais';
    }
};