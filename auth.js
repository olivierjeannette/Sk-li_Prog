// Gestionnaire d'authentification
const Auth = {
    // Connexion
    login() {
        const password = document.getElementById('adminPassword').value;
        if (password === CONFIG.ADMIN_PASSWORD) {
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, 'true');
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            App.init();
        } else {
            document.getElementById('loginError').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('loginError').classList.add('hidden');
            }, 3000);
        }
    },
    
    // Déconnexion
    logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);
        location.reload();
    },
    
    // Vérifier l'authentification
    checkAuth() {
        if (sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH) === 'true') {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            App.init();
        }
    }
};