// Gestionnaire du mode TV
const TVMode = {
    // Démarrer le mode TV pour une séance
    startTVMode(dateKey) {
        const session = DataManager.getSession(dateKey);
        if (!session) return;
        
        const [year, month, day] = dateKey.split('-');
        const dateStr = new Date(year, month - 1, day).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
        
        const categoryInfo = session.category ? CONFIG.SESSION_CATEGORIES[session.category] : null;
        
        // Calculer les tailles de police optimales selon le contenu
        const blockCount = session.blocks?.length || 0;
        const totalContentLength = (session.blocks || []).reduce((sum, b) => sum + (b.name || '').length + (b.content || '').length, 0);
        const avgContentPerBlock = blockCount > 0 ? totalContentLength / blockCount : 0;
        
        // Dimensionnement des polices pour l'affichage TV
        let headerSize = 'text-5xl';
        let titleSize = 'text-4xl';
        let blockTitleSize = 'text-5xl';
        let contentSize = 'text-3xl';
        let padding = 'p-8';
        let gap = 'gap-6';
        let blockWidth = 'flex-1';
        
        if (blockCount === 1) {
            headerSize = 'text-6xl';
            titleSize = 'text-5xl';
            blockTitleSize = 'text-8xl';
            contentSize = avgContentPerBlock > 100 ? 'text-5xl' : 'text-6xl';
            padding = 'p-12';
            blockWidth = 'w-full';
        } else if (blockCount === 2) {
            headerSize = 'text-6xl';
            titleSize = 'text-4xl';
            blockTitleSize = 'text-6xl';
            contentSize = avgContentPerBlock > 150 ? 'text-3xl' : 'text-4xl';
            padding = 'p-10';
            blockWidth = 'w-1/2';
        } else if (blockCount === 3) {
            headerSize = 'text-5xl';
            titleSize = 'text-3xl';
            blockTitleSize = 'text-5xl';
            contentSize = avgContentPerBlock > 100 ? 'text-2xl' : 'text-3xl';
            padding = 'p-8';
            blockWidth = 'w-1/3';
        } else if (blockCount === 4) {
            headerSize = 'text-4xl';
            titleSize = 'text-2xl';
            blockTitleSize = 'text-4xl';
            contentSize = avgContentPerBlock > 80 ? 'text-xl' : 'text-2xl';
            padding = 'p-6';
            blockWidth = 'w-1/4';
        } else if (blockCount <= 6) {
            headerSize = 'text-4xl';
            titleSize = 'text-xl';
            blockTitleSize = 'text-3xl';
            contentSize = 'text-lg';
            padding = 'p-5';
            blockWidth = 'flex-1';
            gap = 'gap-4';
        } else {
            headerSize = 'text-3xl';
            titleSize = 'text-lg';
            blockTitleSize = 'text-2xl';
            contentSize = 'text-base';
            padding = 'p-4';
            blockWidth = 'flex-1';
            gap = 'gap-3';
        }
        
        let blocksHTML = '';
        if (session.blocks) {
            session.blocks.forEach((block, i) => {
                const blockContent = block.content || '';
                let blockContentSize = contentSize;
                // Réduire seulement si le contenu est vraiment long
                if (blockContent.length > 300 && blockCount <= 3) {
                    blockContentSize = 'text-2xl';
                } else if (blockContent.length > 500) {
                    blockContentSize = 'text-xl';
                }
                
                blocksHTML += `
                    <div class="bg-white bg-opacity-10 backdrop-blur rounded-xl ${padding} ${blockWidth} flex flex-col">
                        <div class="${blockTitleSize} font-bold mb-6 text-green-400">${block.name || 'Bloc ' + (i + 1)}</div>
                        <div class="${blockContentSize} leading-relaxed whitespace-pre-wrap text-gray-100 flex-1">${blockContent}</div>
                    </div>
                `;
            });
        }
        
        document.body.innerHTML = `
            <div class="tv-mode min-h-screen text-white flex flex-col overflow-hidden">
                <div class="flex justify-between items-center px-8 pt-6 pb-4">
                    <div>
                        <h1 class="${headerSize} font-bold">${session.title || 'Séance'}</h1>
                        <div class="flex items-center space-x-4 mt-2">
                            <p class="text-3xl opacity-90">${dateStr}</p>
                            ${categoryInfo ? `
                                <div class="flex items-center space-x-2">
                                    <i class="${categoryInfo.icon} text-2xl" style="color: ${categoryInfo.color}"></i>
                                    <span class="${titleSize}" style="color: ${categoryInfo.color}">${categoryInfo.name}</span>
                                </div>
                            ` : ''}
                        </div>
                        <p class="text-2xl opacity-70">Skali Prog</p>
                    </div>
                    <button onclick="location.reload()" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-3 rounded-lg transition text-xl">
                        <i class="fas fa-times mr-2"></i>Quitter
                    </button>
                </div>
                
                <div class="flex-1 flex flex-row ${gap} px-8 pb-8 overflow-hidden items-stretch">
                    ${blocksHTML}
                </div>
            </div>
            <style>
                body { overflow: hidden !important; }
                .tv-mode { height: 100vh; max-height: 100vh; }
                /* Tailles de texte personnalisées pour TV */
                .text-8xl { font-size: 6rem !important; line-height: 1.1 !important; }
                .text-7xl { font-size: 4.5rem !important; line-height: 1.1 !important; }
                .text-6xl { font-size: 3.75rem !important; line-height: 1.2 !important; }
                .text-5xl { font-size: 3rem !important; line-height: 1.2 !important; }
                .text-4xl { font-size: 2.25rem !important; line-height: 1.3 !important; }
                .text-3xl { font-size: 1.875rem !important; line-height: 1.3 !important; }
            </style>
        `;
    }
};