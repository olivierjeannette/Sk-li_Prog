// Gestionnaire d'export PDF
const PDFExporter = {
    // Exporter le planning de la semaine en PDF
    exportWeeklyPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        
        // Titre
        doc.setFontSize(18);
        doc.text('Skali Prog - Programme de la Semaine', 15, 15);
        doc.setFontSize(10);
        doc.text(`Semaine du ${monday.toLocaleDateString('fr-FR')}`, 15, 22);
        
        // En-têtes des colonnes
        const colWidth = 38;
        const startX = 15;
        const startY = 35;
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        
        // Dessiner les en-têtes des jours
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        days.forEach((day, i) => {
            doc.text(day, startX + (i * colWidth), startY);
        });
        
        // Dessiner les séances avec titres
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const dateKey = Utils.formatDateKey(currentDay);
            const daySession = DataManager.getSession(dateKey);
            
            let yPos = startY + 8;
            const xPos = startX + (i * colWidth);
            
            if (daySession) {
                // Titre de la séance
                if (daySession.title) {
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(9);
                    const titleLines = doc.splitTextToSize(daySession.title, colWidth - 5);
                    titleLines.forEach(line => {
                        doc.text(line, xPos, yPos);
                        yPos += 4;
                    });
                    yPos += 2;
                }
                
                // Catégorie
                if (daySession.category && CONFIG.SESSION_CATEGORIES[daySession.category]) {
                    doc.setFont(undefined, 'italic');
                    doc.setFontSize(7);
                    doc.text(`[${CONFIG.SESSION_CATEGORIES[daySession.category].name}]`, xPos, yPos);
                    yPos += 4;
                }
                
                // Blocs
                if (daySession.blocks) {
                    doc.setFontSize(8);
                    daySession.blocks.forEach(block => {
                        if (yPos > 180) return; // Limite de page
                        
                        // Nom du bloc
                        if (block.name) {
                            doc.setFont(undefined, 'bold');
                            const lines = doc.splitTextToSize(block.name, colWidth - 5);
                            lines.forEach(line => {
                                doc.text(line, xPos, yPos);
                                yPos += 4;
                            });
                        }
                        
                        // Contenu du bloc
                        if (block.content) {
                            doc.setFont(undefined, 'normal');
                            const contentLines = doc.splitTextToSize(block.content, colWidth - 5);
                            contentLines.slice(0, 8).forEach(line => {
                                if (yPos > 180) return;
                                doc.text(line, xPos, yPos);
                                yPos += 3.5;
                            });
                        }
                        
                        yPos += 3;
                    });
                }
            } else {
                doc.setFont(undefined, 'italic');
                doc.text('Repos', xPos, yPos);
            }
        }
        
        doc.save(`skali_prog_semaine_${Utils.formatDateKey(monday)}.pdf`);
    }
};