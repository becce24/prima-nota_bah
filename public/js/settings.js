
// public/js/settings.js (Logica precedente mantenuta e migliorata)
document.addEventListener('DOMContentLoaded', () => {
    // Show active tab
    showTab('csv-info');

    // Initialize file name displays
    updateFileName('clientFile', 'clientFileName');
    updateFileName('supplierFile', 'supplierFileName');

    // Initialize form handlers
    handleFormSubmit('clientImportForm', '/settings/import/clients');
    handleFormSubmit('supplierImportForm', '/settings/import/suppliers');
});

function showTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-500');
    });
    document.getElementById(`${tabId}-tab`).classList.add('text-blue-600', 'border-b-2', 'border-blue-600');

    // Update content
    document.querySelectorAll('[id$="-content"]').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabId}-content`).classList.remove('hidden');
}
