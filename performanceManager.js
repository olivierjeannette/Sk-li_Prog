// Gestionnaire des performances
const PerformanceManager = {
    // Ouvrir la modal de performance rapide
    openQuickPerformanceModal(memberId = null) {
        const membersList = DataManager.getAllMembers();
        const selectedMember = memberId ? DataManager.getMember(memberId) : null;
        
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-skali" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold mb-6">Enregistrer une Performance</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Adhérent</label>
                            <select id="performanceMember" class="w-full rounded-lg p-3" ${selectedMember ? 'disabled' : ''}>
                                ${!selectedMember ? '<option value="">Sélectionner un adhérent</option>' : ''}
                                ${membersList.map(member => `
                                    <option value="${member.id}" ${selectedMember && member.id === selectedMember.id ? 'selected' : ''}>
                                        ${member.firstName} ${member.lastName}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Catégorie</label>
                                <select id="performanceCategory" class="w-full rounded-lg p-3" onchange="PerformanceManager.updateExercisesList()">
                                    <option value="">Choisir une catégorie</option>
                                    ${Object.keys(DataManager.getExercises()).map(cat => `
                                        <option value="${cat}">${cat}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Exercice</label>
                                <select id="performanceExercise" class="w-full rounded-lg p-3">
                                    <option value="">Choisir un exercice</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="performanceInputs" class="hidden space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Type de mesure</label>
                                    <select id="performanceType" class="w-full rounded-lg p-3" onchange="PerformanceManager.updatePerformanceInputs()">
                                        <option value="weight">Poids (kg)</option>
                                        <option value="time">Temps (mm:ss)</option>
                                        <option value="distance">Distance (m/km)</option>
                                        <option value="reps">Répétitions</option>
                                    </select>
                                </div>
                                <div id="valueInput">
                                    <label class="block text-sm font-medium mb-2">Valeur</label>
                                    <input type="text" id="performanceValue" class="w-full rounded-lg p-3" placeholder="Ex: 80kg, 5:30, 1000m">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Notes (optionnel)</label>
                                <textarea id="performanceNotes" class="w-full rounded-lg p-3" rows="2" placeholder="Commentaires sur la performance..."></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="PerformanceManager.savePerformance()" class="flex-1 btn-primary py-2 rounded-lg">
                            Enregistrer Performance
                        </button>
                        <button onclick="Utils.closeModal()" class="flex-1 btn-secondary py-2 rounded-lg">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
        
        if (membersList.length === 0) {
            alert('Aucun adhérent enregistré. Ajoutez d\'abord des adhérents.');
            Utils.closeModal();
            return;
        }
    },
    
    // Mettre à jour la liste des exercices
    updateExercisesList() {
        const category = document.getElementById('performanceCategory').value;
        const exerciseSelect = document.getElementById('performanceExercise');
        const performanceInputs = document.getElementById('performanceInputs');
        const exercises = DataManager.getExercises();
        
        exerciseSelect.innerHTML = '<option value="">Choisir un exercice</option>';
        
        if (category && exercises[category]) {
            exercises[category].forEach(exercise => {
                exerciseSelect.innerHTML += `<option value="${exercise}">${exercise}</option>`;
            });
            performanceInputs.classList.remove('hidden');
        } else {
            performanceInputs.classList.add('hidden');
        }
    },
    
    // Mettre à jour les champs de saisie de performance
    updatePerformanceInputs() {
        const type = document.getElementById('performanceType').value;
        const valueInput = document.getElementById('performanceValue');
        
        let placeholder = '';
        switch(type) {
            case 'weight':
                placeholder = 'Ex: 80';
                break;
            case 'time':
                placeholder = 'Ex: 5:30 ou 1:25:30';
                break;
            case 'distance':
                placeholder = 'Ex: 1000 ou 5.5';
                break;
            case 'reps':
                placeholder = 'Ex: 15';
                break;
        }
        valueInput.placeholder = placeholder;
    },
    
    // Sauvegarder une performance
    savePerformance() {
        const memberId = document.getElementById('performanceMember').value;
        const category = document.getElementById('performanceCategory').value;
        const exercise = document.getElementById('performanceExercise').value;
        const type = document.getElementById('performanceType').value;
        const value = document.getElementById('performanceValue').value;
        const notes = document.getElementById('performanceNotes').value;
        
        if (!memberId || !exercise || !value) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        const member = DataManager.getMember(memberId);
        if (!member.performances) member.performances = {};
        if (!member.performances[exercise]) member.performances[exercise] = [];
        
        const performance = {
            date: new Date().toISOString(),
            category,
            type,
            value,
            notes,
            timestamp: Date.now()
        };
        
        member.performances[exercise].push(performance);
        
        // Trier les performances par date
        member.performances[exercise].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        DataManager.saveMember(member);
        Utils.closeModal();
        
        // Rafraîchir la vue actuelle
        if (ViewManager.getCurrentView() === 'members') {
            MemberManager.showMembersView();
        }
    }
};