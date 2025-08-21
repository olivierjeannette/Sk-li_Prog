// Gestionnaire des adhérents
const MemberManager = {
    // Afficher la vue des adhérents
    showMembersView() {
        const membersList = DataManager.getAllMembers();
        
        let html = `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Gestion des Adhérents (${membersList.length})</h2>
                    <button onclick="MemberManager.openAddMemberModal()" class="btn-primary px-4 py-2 rounded-lg">
                        <i class="fas fa-user-plus mr-2"></i>Ajouter un adhérent
                    </button>
                </div>
                
                ${membersList.length > 0 ? `
                    <div class="mb-6">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="memberSearch" placeholder="Rechercher un adhérent..." 
                                   class="w-full pl-10 pr-4 py-3 rounded-lg" 
                                   oninput="MemberManager.filterMembers()">
                        </div>
                    </div>
                ` : ''}
                
                <div id="membersContainer">
                    ${this.renderMembersList(membersList)}
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
    },
    
    // Afficher la liste des adhérents
    renderMembersList(membersList) {
        if (membersList.length === 0) {
            return `
                <div class="text-center py-12 text-gray-400">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p class="text-lg">Aucun adhérent enregistré</p>
                    <p class="text-sm">Commencez par ajouter des adhérents pour suivre leurs performances</p>
                </div>
            `;
        }

        return `
            <div class="space-y-3">
                ${membersList.map(member => `
                    <div class="member-row bg-skali-light rounded-xl p-4 flex items-center justify-between hover:bg-opacity-80 transition cursor-pointer border border-skali"
                         onclick="MemberManager.showMemberProfile('${member.id}')">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-skali-accent rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-user text-white text-lg"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-lg">${member.firstName} ${member.lastName}</h3>
                                <div class="flex items-center space-x-6 text-sm text-gray-400 mt-1">
                                    <span>
                                        <i class="fas fa-chart-line mr-1"></i>
                                        ${Object.keys(member.performances || {}).length} performances
                                    </span>
                                    <span>
                                        <i class="fas fa-calendar mr-1"></i>
                                        Dernière séance: ${Utils.getLastPerformanceDate(member)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="event.stopPropagation(); PerformanceManager.openQuickPerformanceModal('${member.id}')" 
                                    class="btn-primary px-3 py-2 rounded-lg text-sm">
                                <i class="fas fa-plus mr-1"></i>Perf
                            </button>
                            <button onclick="event.stopPropagation(); MemberManager.deleteMember('${member.id}')" 
                                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // Filtrer les adhérents
    filterMembers() {
        const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
        const membersList = DataManager.getAllMembers();
        
        const filteredMembers = membersList.filter(member => 
            `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm)
        );
        
        document.getElementById('membersContainer').innerHTML = this.renderMembersList(filteredMembers);
    },
    
    // Supprimer un adhérent
    deleteMember(memberId) {
        const member = DataManager.getMember(memberId);
        if (!member) return;
        
        if (confirm(`Supprimer définitivement ${member.firstName} ${member.lastName} et toutes ses performances ?`)) {
            DataManager.deleteMember(memberId);
            this.showMembersView();
        }
    },
    
    // Ouvrir la modal d'ajout d'adhérent
    openAddMemberModal() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-md w-full mx-4 border border-skali" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold mb-6">Ajouter un Adhérent</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Prénom</label>
                            <input type="text" id="memberFirstName" class="w-full rounded-lg p-3" placeholder="Prénom">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Nom</label>
                            <input type="text" id="memberLastName" class="w-full rounded-lg p-3" placeholder="Nom">
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="MemberManager.saveMember()" class="flex-1 btn-primary py-2 rounded-lg">
                            Enregistrer
                        </button>
                        <button onclick="Utils.closeModal()" class="flex-1 btn-secondary py-2 rounded-lg">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },
    
    // Sauvegarder un adhérent
    saveMember() {
        const firstName = document.getElementById('memberFirstName').value.trim();
        const lastName = document.getElementById('memberLastName').value.trim();
        
        if (!firstName || !lastName) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        const memberData = {
            id: Date.now().toString(),
            firstName,
            lastName,
            performances: {},
            createdAt: new Date().toISOString()
        };
        
        DataManager.saveMember(memberData);
        Utils.closeModal();
        this.showMembersView();
    },
    
    // Afficher le profil d'un adhérent
    showMemberProfile(memberId) {
        const member = DataManager.getMember(memberId);
        if (!member) return;
        
        const exercises = Object.keys(member.performances || {});
        
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in" onclick="Utils.closeModal(event)">
                <div class="bg-skali-light rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-skali" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-skali-accent rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-white text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold">${member.firstName} ${member.lastName}</h3>
                                <p class="text-gray-400">Fiche de progression</p>
                            </div>
                        </div>
                        <button onclick="PerformanceManager.openQuickPerformanceModal('${member.id}')" class="btn-primary px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>Nouvelle performance
                        </button>
                    </div>
                    
                    ${exercises.length === 0 ? `
                        <div class="text-center py-12 text-gray-400">
                            <i class="fas fa-chart-line text-4xl mb-4"></i>
                            <p class="text-lg">Aucune performance enregistrée</p>
                            <p class="text-sm">Commencez par enregistrer des performances pour voir la progression</p>
                        </div>
                    ` : `
                        <div class="space-y-6">
                            ${exercises.map(exercise => {
                                const performances = member.performances[exercise];
                                const latest = performances[performances.length - 1];
                                const previous = performances.length > 1 ? performances[performances.length - 2] : null;
                                const trend = Utils.calculateTrend(latest, previous);
                                
                                return `
                                    <div class="bg-skali-dark rounded-xl p-6">
                                        <div class="flex justify-between items-center mb-4">
                                            <h4 class="text-xl font-bold text-skali-accent">${exercise}</h4>
                                            <div class="flex items-center space-x-2">
                                                <i class="fas fa-${trend.icon} ${trend.color}"></i>
                                                <span class="text-sm ${trend.color}">${trend.text}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="overflow-x-auto">
                                            <table class="w-full text-sm">
                                                <thead>
                                                    <tr class="border-b border-gray-600">
                                                        <th class="text-left py-2">Date</th>
                                                        <th class="text-left py-2">Performance</th>
                                                        <th class="text-left py-2">Évolution</th>
                                                        <th class="text-left py-2">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${performances.slice(-5).reverse().map((perf, idx, arr) => {
                                                        const prev = arr[idx + 1];
                                                        const evolution = prev ? Utils.calculateEvolution(perf, prev) : null;
                                                        
                                                        return `
                                                            <tr class="border-b border-gray-700">
                                                                <td class="py-3">${new Date(perf.date).toLocaleDateString('fr-FR')}</td>
                                                                <td class="py-3 font-medium">${Utils.formatPerformanceValue(perf)}</td>
                                                                <td class="py-3">
                                                                    ${evolution ? `
                                                                        <span class="${evolution.color}">
                                                                            <i class="fas fa-${evolution.icon} mr-1"></i>
                                                                            ${evolution.text}
                                                                        </span>
                                                                    ` : '—'}
                                                                </td>
                                                                <td class="py-3 text-gray-400">${perf.notes || '—'}</td>
                                                            </tr>
                                                        `;
                                                    }).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                    
                    <div class="flex justify-end mt-6">
                        <button onclick="Utils.closeModal()" class="btn-secondary px-6 py-2 rounded-lg">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    }
};