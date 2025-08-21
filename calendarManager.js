// Gestionnaire du calendrier
const CalendarManager = {
    currentViewMonth: new Date().getMonth(),
    currentViewYear: new Date().getFullYear(),
    
    // Afficher la vue calendrier
    showCalendarView() {
        let html = `
            <div class="fade-in">
                <div class="bg-skali-light rounded-xl p-6 mb-6 border border-skali">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold">
                            ${new Date(this.currentViewYear, this.currentViewMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div class="flex space-x-2">
                            <button onclick="CalendarManager.changeMonth(-1)" class="p-2 hover:bg-skali-dark rounded-lg transition">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button onclick="CalendarManager.changeMonth(1)" class="p-2 hover:bg-skali-dark rounded-lg transition">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-3">
                        ${this.generateCalendar(this.currentViewMonth, this.currentViewYear)}
                    </div>
                </div>
                
                <!-- Legend -->
                <div class="bg-skali-light rounded-xl p-4 border border-skali">
                    <h3 class="text-sm font-medium mb-3 text-gray-400">Types de séances</h3>
                    <div class="flex flex-wrap gap-2">
                        ${Object.entries(CONFIG.SESSION_CATEGORIES).map(([key, cat]) => `
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded" style="background-color: ${cat.color}"></div>
                                <span class="text-sm">${cat.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('mainContent').innerHTML = html;
    },
    
    // Générer le HTML du calendrier
    generateCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        
        let html = dayNames.map(day => `<div class="text-center font-semibold text-skali-accent text-sm p-2">${day}</div>`).join('');
        
        // Cellules vides avant le premier jour
        for (let i = 0; i < firstDay; i++) {
            html += '<div></div>';
        }
        
        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const session = DataManager.getSession(dateKey);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            let categoryClass = '';
            if (session && session.category) {
                categoryClass = `category-${session.category}`;
            }
            
            html += `
                <div onclick="CalendarManager.openDayModal('${dateKey}')" class="calendar-day ${session ? 'has-session' : ''} ${categoryClass} relative p-2 rounded-lg cursor-pointer ${
                    isToday ? 'ring-2 ring-skali-accent' : ''
                }">
                    <div class="text-sm font-medium ${isToday ? 'text-skali-accent' : ''} mb-1">${day}</div>
                    ${session ? `
                        <div class="space-y-1">
                            <div class="text-xs font-medium truncate" title="${session.title || 'Séance'}">${session.title || 'Séance'}</div>
                            ${session.category ? `
                                <span class="tag tag-${session.category}">${CONFIG.SESSION_CATEGORIES[session.category]?.name || session.category}</span>
                            ` : ''}
                            <div class="text-xs text-gray-400">${session.blocks?.length || 0} blocs</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        return html;
    },
    
    // Changer de mois
    changeMonth(direction) {
        this.currentViewMonth += direction;
        if (this.currentViewMonth < 0) {
            this.currentViewMonth = 11;
            this.currentViewYear--;
        } else if (this.currentViewMonth > 11) {
            this.currentViewMonth = 0;
            this.currentViewYear++;
        }
        this.showCalendarView();
    },
    
    // Ouvrir la modal d'un jour
    openDayModal(dateKey) {
        const existingSession = DataManager.getSession(dateKey);
        const [year, month, day] = dateKey.split('-');
        const dateStr = new Date(year, month - 1, day).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        let html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-skali" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">${dateStr}</h3>
                        ${existingSession ? `
                            <button onclick="TVMode.startTVMode('${dateKey}')" class="btn-primary px-4 py-2 rounded-lg">
                                <i class="fas fa-tv mr-2"></i>Mode TV
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Session Header -->
                    <div class="bg-skali-dark rounded-xl p-4 mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Titre de la séance</label>
                                <input type="text" id="sessionTitle" value="${existingSession?.title || ''}" 
                                       placeholder="Ex: WOD du jour, Force Upper, Cardio HIIT..." 
                                       class="w-full rounded-lg p-3">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Catégorie</label>
                                <select id="sessionCategory" class="w-full rounded-lg p-3">
                                    <option value="">Choisir une catégorie</option>
                                    ${Object.entries(CONFIG.SESSION_CATEGORIES).map(([key, cat]) => `
                                        <option value="${key}" ${existingSession?.category === key ? 'selected' : ''}>
                                            ${cat.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="text-lg font-semibold text-skali-accent">Blocs d'entraînement</h4>
                            <button onclick="CalendarManager.addBlock()" class="btn-secondary px-3 py-1 rounded-lg text-sm">
                                <i class="fas fa-plus mr-1"></i>Ajouter un bloc
                            </button>
                        </div>
                        
                        <div id="blocksList" class="space-y-4">
                            ${existingSession && existingSession.blocks ? existingSession.blocks.map((block, idx) => this.generateBlockHTML(block, idx)).join('') : ''}
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="CalendarManager.saveSession('${dateKey}')" class="flex-1 btn-primary py-2 rounded-lg">
                            Enregistrer
                        </button>
                        ${existingSession ? `
                            <button onclick="CalendarManager.deleteSession('${dateKey}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
                                Supprimer la séance
                            </button>
                        ` : ''}
                        <button onclick="Utils.closeModal()" class="flex-1 btn-secondary py-2 rounded-lg">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
        
        if (!existingSession) {
            this.addBlock();
        }
    },
    
    // Générer le HTML d'un bloc
    generateBlockHTML(block, idx) {
        return `
            <div class="block-item bg-skali-dark rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                    <input type="text" value="${block?.name || ''}" placeholder="Nom du bloc (ex: Échauffement, Force, Cardio...)" 
                           class="block-name flex-1 rounded-lg p-2 mr-2">
                    <button onclick="CalendarManager.removeBlock(this)" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <textarea placeholder="Détails du bloc (exercices, séries, reps, notes...)" 
                          class="block-content w-full rounded-lg p-3 min-h-[100px]">${block?.content || ''}</textarea>
            </div>
        `;
    },
    
    // Ajouter un bloc
    addBlock() {
        const list = document.getElementById('blocksList');
        const div = document.createElement('div');
        div.innerHTML = this.generateBlockHTML({}, list.children.length);
        list.appendChild(div.firstElementChild);
    },
    
    // Supprimer un bloc
    removeBlock(btn) {
        btn.closest('.block-item').remove();
    },
    
    // Sauvegarder une séance
    saveSession(dateKey) {
        const title = document.getElementById('sessionTitle').value.trim();
        const category = document.getElementById('sessionCategory').value;
        
        const blocks = [];
        document.querySelectorAll('.block-item').forEach(item => {
            const name = item.querySelector('.block-name').value;
            const content = item.querySelector('.block-content').value;
            if (name || content) {
                blocks.push({ name, content });
            }
        });
        
        if (blocks.length > 0 || title) {
            const sessionData = { 
                title: title || 'Séance',
                category,
                blocks
            };
            DataManager.saveSession(dateKey, sessionData);
        } else {
            DataManager.deleteSession(dateKey);
        }
        
        Utils.closeModal();
        this.showCalendarView();
    },
    
    // Supprimer une séance
    deleteSession(dateKey) {
        if (confirm('Supprimer cette séance ?')) {
            DataManager.deleteSession(dateKey);
            Utils.closeModal();
            this.showCalendarView();
        }
    }
};