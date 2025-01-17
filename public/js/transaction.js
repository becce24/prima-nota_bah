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
        amount: document.getElementById('amount')
    };

    // Gestione evento input per l'importo (formattazione)
    if (elements.amount) {
        elements.amount.addEventListener('input', function(e) {
            // Rimuove tutti i caratteri eccetto numeri, punto e virgola
            let value = e.target.value.replace(/[^\d.,]/g, '');
            
            // Conta quanti separatori decimali ci sono
            const decimalCount = (value.match(/[.,]/g) || []).length;
            
            if (decimalCount > 1) {
                // Se c'è più di un separatore, rimuove l'ultimo inserito
                value = value.slice(0, -1);
            }
            
            if (value) {
                // Gestisce sia punto che virgola
                const parts = value.split(/[.,]/);
                
                // Se c'è una parte decimale, la limita a 2 cifre
                if (parts[1] && parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2);
                    value = parts.join(','); // Standardizza usando la virgola
                }
            }
            
            e.target.value = value;
        });

        // Formatta il valore quando il campo perde il focus
        elements.amount.addEventListener('blur', function(e) {
            let value = e.target.value;
            if (value) {
                // Sostituisce il punto con la virgola se presente
                value = value.replace('.', ',');
                
                // Aggiunge gli zeri decimali se necessario
                if (!value.includes(',')) {
                    value += ',00';
                } else {
                    const parts = value.split(',');
                    if (parts[1].length === 0) {
                        value += '00';
                    } else if (parts[1].length === 1) {
                        value += '0';
                    }
                }
                
                e.target.value = value;
            }
        });
    }

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

    // Gestione cambio tipo transazione
    function handleTypeChange(e) {
        const isClient = elements.typeClient.checked;
        const isSupplier = elements.typeSupplier.checked;

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

        // Reset campi non pertinenti
        if (isClient) {
            if (supplierInput) supplierInput.value = '';
        } else if (isSupplier) {
            if (clientInput) clientInput.value = '';
        }
    }

    // Aggiungi event listeners per i radio buttons
    if (elements.typeClient) {
        elements.typeClient.addEventListener('change', handleTypeChange);
    }
    if (elements.typeSupplier) {
        elements.typeSupplier.addEventListener('change', handleTypeChange);
    }

    // Gestione submit del form
    if (elements.form) {
        elements.form.addEventListener('submit', function(e) {
            const isClient = elements.typeClient.checked;
            const isSupplier = elements.typeSupplier.checked;

            if (!isClient && !isSupplier) {
                e.preventDefault();
                alert('Selezionare il tipo di transazione (Incasso o Pagamento)');
                return;
            }

            if (isClient && (!clientInput || !clientInput.value)) {
                e.preventDefault();
                alert('Inserire il cliente per gli incassi');
                return;
            }

            if (isSupplier && (!supplierInput || !supplierInput.value)) {
                e.preventDefault();
                alert('Inserire il fornitore per i pagamenti');
                return;
            }

            // Validazione importo
            const amountValue = elements.amount.value;
            if (!amountValue || parseFloat(amountValue.replace(',', '.')) <= 0) {
                e.preventDefault();
                alert('Inserire un importo valido maggiore di zero');
                return;
            }
        });
    }
});