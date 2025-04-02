document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const paymentMethods = document.getElementsByName('paymentMethod');
    const methodDetails = {
        creditCard: document.getElementById('creditCardDetails'),
        paypal: document.getElementById('paypalDetails'),
        bankTransfer: document.getElementById('bankTransferDetails'),
        crypto: document.getElementById('cryptoDetails')
    };

    // Manejar el cambio de método de pago
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Ocultar todos los detalles primero
            Object.values(methodDetails).forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Mostrar solo el método seleccionado
            if (this.checked) {
                methodDetails[this.value].style.display = 'block';
            }
        });
    });

    // Formatear número de tarjeta
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\s+/g, ''); // Eliminar espacios existentes
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
            }
            this.value = value;
        });
    }

    // Formatear fecha de expiración
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, ''); // Eliminar no dígitos
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // Validar CVV
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, ''); // Solo números
        });
    }

    // Manejar el envío del formulario
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validaciones básicas
        if (!document.getElementById('terms').checked) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }
        
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        let isValid = true;
        
        // Validaciones específicas por método
        switch(selectedMethod) {
            case 'creditCard':
                if (!validateCreditCard()) isValid = false;
                break;
            case 'bankTransfer':
                if (!validateBankTransfer()) isValid = false;
                break;
            case 'crypto':
                if (!validateCrypto()) isValid = false;
                break;
            // PayPal no necesita validación adicional
        }
        
        if (isValid) {
            // Aquí iría la lógica para procesar el pago
            alert(`Pago procesado con éxito usando ${getMethodName(selectedMethod)}`);
            // paymentForm.reset();
        }
    });
    
    function validateCreditCard() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (cardNumber.length < 16 || !/^\d+$/.test(cardNumber)) {
            alert('Número de tarjeta inválido');
            return false;
        }
        
        if (!cardExpiry || !cardExpiry.includes('/') || cardExpiry.length !== 5) {
            alert('Fecha de expiración inválida (use MM/AA)');
            return false;
        }
        
        if (cardCvv.length < 3 || !/^\d+$/.test(cardCvv)) {
            alert('CVV inválido (mínimo 3 dígitos)');
            return false;
        }
        
        if (!cardName.trim()) {
            alert('Ingrese el nombre como aparece en la tarjeta');
            return false;
        }
        
        return true;
    }
    
    function validateBankTransfer() {
        const bankName = document.getElementById('bankName').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const routingNumber = document.getElementById('routingNumber').value;
        
        if (!bankName) {
            alert('Seleccione un banco');
            return false;
        }
        
        if (!accountNumber || !/^\d+$/.test(accountNumber)) {
            alert('Número de cuenta inválido');
            return false;
        }
        
        if (!routingNumber || !/^\d+$/.test(routingNumber)) {
            alert('Número de ruta inválido');
            return false;
        }
        
        return true;
    }
    
    function validateCrypto() {
        const cryptoWallet = document.getElementById('cryptoWallet').value;
        
        if (!cryptoWallet.trim()) {
            alert('Ingrese una dirección de billetera válida');
            return false;
        }
        
        // Validación básica de dirección de billetera
        if (cryptoWallet.length < 26 || cryptoWallet.length > 35) {
            alert('La dirección de la billetera parece inválida');
            return false;
        }
        
        return true;
    }
    
    function getMethodName(method) {
        const names = {
            'creditCard': 'Tarjeta de Crédito/Débito',
            'paypal': 'PayPal',
            'bankTransfer': 'Transferencia Bancaria',
            'crypto': 'Criptomonedas'
        };
        return names[method];
    }
});