document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded');

    // Elementi del DOM
    const elements = {
        form: document.querySelector('form[action="/transactions/add"]'),
        typeClient: document.getElementById('typeClient'),
        typeSupplier: document.getElementById('typeSupplier'),
        entityContainer: document.getElementById('entityContainer'),
        clientSection: document.getElementById('clientSection'),
        supplierSection: document.getElementById('supplierSection'),
        otherFields: document.getElementById('otherFields'),
        transactionType: document.getElementById('transactionType')
    };

    // Log degli elementi trovati
    console.log('Elements found:', {
        form: !!elements.form,
        typeClient: !!elements.typeClient,
        typeSupplier: !!elements.typeSupplier,
        entityContainer: !!elements.entityContainer,
        clientSection: !!elements.clientSection,
        supplierSection: !!elements.supplierSection,
        otherFields: !!elements.otherFields
    });

        // Funzione per recuperare i suggerimenti
        async function fetchSuggestions(query, endpoint, suggestionsList) {
            if (!query || query.length < 2) {
                suggestionsList.innerHTML = '';
                return;
            }
    
            try {
                const response = await fetch(`/transactions${endpoint}?search=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    suggestionsList.innerHTML = data
                        .map(item => `<option value="${item.Denominazione}">`)
                        .join('');
                } else {
                    console.error(`Errore nella richiesta: ${response.status}`);
                }
            } catch (error) {
                console.error('Errore durante il caricamento dei suggerimenti:', error);
            }
        }
    
        // Event Listener per il campo Cliente
        const clientInput = document.querySelector('input[name="client"]');
        const clientSuggestions = document.getElementById('clientSuggestions');
        
        if (clientInput && clientSuggestions) {
            clientInput.addEventListener('input', () => {
                fetchSuggestions(clientInput.value, '/clients', clientSuggestions);
            });
        }
    
        // Event Listener per il campo Fornitore
        const supplierInput = document.querySelector('input[name="supplier"]');
        const supplierSuggestions = document.getElementById('supplierSuggestions');
        
        if (supplierInput && supplierSuggestions) {
            supplierInput.addEventListener('input', () => {
                fetchSuggestions(supplierInput.value, '/suppliers', supplierSuggestions);
            });
        }

    function handleCheckboxChange(e) {
        console.log('Checkbox changed:', e.target.id);
        
        const isClient = elements.typeClient.checked;
        const isSupplier = elements.typeSupplier.checked;

        console.log('Status:', { isClient, isSupplier });

        // Assicurati che solo uno sia selezionato
        if (e.target === elements.typeClient && isClient) {
            elements.typeSupplier.checked = false;
        }
        if (e.target === elements.typeSupplier && isSupplier) {
            elements.typeClient.checked = false;
        }

        // Mostra/nascondi i campi appropriati
        if (elements.entityContainer) {
            elements.entityContainer.classList.toggle('hidden', !isClient && !isSupplier);
        }
        if (elements.otherFields) {
            elements.otherFields.classList.toggle('hidden', !isClient && !isSupplier);
        }
        if (elements.clientSection) {
            elements.clientSection.classList.toggle('hidden', !isClient);
        }
        if (elements.supplierSection) {
            elements.supplierSection.classList.toggle('hidden', !isSupplier);
        }

        // Imposta il tipo di transazione
        if (elements.transactionType) {
            elements.transactionType.value = isClient ? 'incasso' : isSupplier ? 'pagamento' : '';
        }
    }

    // Aggiungi event listeners
    if (elements.typeClient) {
        console.log('Adding client listener');
        elements.typeClient.addEventListener('change', handleCheckboxChange);
    }
    if (elements.typeSupplier) {
        console.log('Adding supplier listener');
        elements.typeSupplier.addEventListener('change', handleCheckboxChange);
    }
});