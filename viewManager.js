// Gestionnaire des vues
const ViewManager = {
    currentView: 'calendar',
    
    // Afficher une vue
    showView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons de navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        
        if (view === 'calendar') {
            document.getElementById('calendarBtn').classList.remove('btn-secondary');
            document.getElementById('calendarBtn').classList.add('btn-primary');
            CalendarManager.showCalendarView();
        } else if (view === 'members') {
            document.getElementById('membersBtn').classList.remove('btn-secondary');
            document.getElementById('membersBtn').classList.add('btn-primary');
            MemberManager.showMembersView();
        }
    },
    
    // Obtenir la vue actuelle
    getCurrentView() {
        return this.currentView;
    }
};