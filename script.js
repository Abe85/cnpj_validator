    <script>
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'g':
                        e.preventDefault();
                        handleGenerate();
                        break;
                    case 'v':
                        e.preventDefault();
                        handleValidate();
                        break;
                    case 'r':
                        if (e.shiftKey) {
                            e.preventDefault();
                            generateRandomCNPJ();
                        } else {
                            e.preventDefault();
                            clearAll();
                        }
                        break;
                }
            }
        });

        // Auto-focus input on load
        window.addEventListener('load', function() {
            document.getElementById('cnpjInput').focus();
        });

        // Real-time input processing
        document.getElementById('cnpjInput').addEventListener('input', function() {
            const cleaned = cleanCNPJ(this.value.trim().toUpperCase());
            updateDisplayFields(cleaned);
            clearValidation();
        });

        // Auto-format input as user types - FIXED to support alphanumeric
        document.getElementById('cnpjInput').addEventListener('input', function(e) {
            // Only keep alphanumeric characters (0-9, A-Z)
            const value = e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
            if (value.length <= 14) {
                e.target.value = formatCNPJInput(value);
            }
        });

        function formatCNPJInput(value) {
            if (value.length <= 2) return value;
            if (value.length <= 5) return value.slice(0, 2) + '.' + value.slice(2);
            if (value.length <= 8) return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5);
            if (value.length <= 12) return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8);
            return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8, 12) + '-' + value.slice(12);
        }

        function handleGenerate() {
            const input = document.getElementById('cnpjInput').value.trim().toUpperCase();
            const cleaned = cleanCNPJ(input);

            if (cleaned.length !== 12) {
                showResult('Enter exactly 12 characters to generate check digits.', false);
                updateDisplayFields(cleaned);
                return;
            }

            if (!/^[0-9A-Z]+$/.test(cleaned)) {
                showResult('Contains invalid characters (only 0-9 and A-Z allowed).', false);
                updateDisplayFields(cleaned);
                return;
            }

            const checkDigits = generateCheckDigits(cleaned);
            const fullCnpj = cleaned + checkDigits;
            updateDisplayFields(fullCnpj);
            
            // Update input field with generated CNPJ
            document.getElementById('cnpjInput').value = formatCNPJ(fullCnpj);
            
            showResult(`Check digits generated: <strong>${checkDigits}</strong>`, true);
        }

        function handleValidate() {
            const input = document.getElementById('cnpjInput').value.trim().toUpperCase();
            const cleaned = cleanCNPJ(input);

            updateDisplayFields(cleaned);

            if (cleaned.length !== 14) {
                showResult('CNPJ must be exactly 14 characters.', false);
                return;
            }

            const validation = validateCNPJ(cleaned);

            if (validation.isValid) {
                showResult('CNPJ is valid! ✨', true);
            } else {
                showResult('CNPJ is invalid ❌', false, validation.errors);
            }
        }

        function clearAll() {
            document.getElementById('cnpjInput').value = '';
            updateDisplayFields('');
            clearValidation();
            document.getElementById('cnpjInput').focus();
        }

        function cleanCNPJ(cnpj) {
            return cnpj.replace(/[\.\/\- ]/g, '');
        }

        function formatCNPJ(cnpj) {
            if (cnpj.length !== 14) return cnpj;
            return cnpj.slice(0, 2) + '.' + cnpj.slice(2, 5) + '.' + cnpj.slice(5, 8) + '/' + cnpj.slice(8, 12) + '-' + cnpj.slice(12);
        }
        
        function formatCNPJInput(value) {
            if (value.length <= 2) return value;
            if (value.length <= 5) return value.slice(0, 2) + '.' + value.slice(2);
            if (value.length <= 8) return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5);
            if (value.length <= 12) return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8);
            return value.slice(0, 2) + '.' + value.slice(2, 5) + '.' + value.slice(5, 8) + '/' + value.slice(8, 12) + '-' + value.slice(12);
        }
        // Convert character to numeric value (0-9 = 0-9, A-Z = 10-35)        
        function getCharValue(char) {            
            if (char >= '0' && char <= '9') {                
                return parseInt(char);            
            } else if (char >= 'A' && char <= 'Z') {                
                return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;            
            }            
            return 0;        
        }
        
        // Convert numeric value to character (0-9 = 0-9, 10-35 = A-Z)        
        function getCharFromValue(value) {            
            if (value >= 0 && value <= 9) {                
                return value.toString();            
            } else if (value >= 10 && value <= 35) {                
                return String.fromCharCode('A'.charCodeAt(0) + value - 10);            
            }            
            return '0';        
        }
        
        // Generate check digits for a 12-character CNPJ base        
        function generateCheckDigits(cnpjBase) {            
            if (cnpjBase.length !== 12) return '';
            
            // First check digit            
            let weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];            
            let sum1 = 0;            
            for (let i = 0; i < 12; i++) {                
                let charValue = getCharValue(cnpjBase[i]);                
                sum1 += charValue * weights1[i];            
            }            
            let remainder1 = sum1 % 11;            
            let digit1 = remainder1 < 2 ? 0 : 11 - remainder1;
            
            // Second check digit            
            let weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];            
            let sum2 = 0;            
            for (let i = 0; i < 12; i++) {                
                let charValue = getCharValue(cnpjBase[i]);                
                sum2 += charValue * weights2[i];            
            }            
            sum2 += digit1 * weights2[12];            
            let remainder2 = sum2 % 11;            
            let digit2 = remainder2 < 2 ? 0 : 11 - remainder2;
            
            return getCharFromValue(digit1) + getCharFromValue(digit2);        
        }
        
        // Validate a complete 14-character CNPJ        
        function validateCNPJ(cnpj) {            
            const errors = [];
            
            if (cnpj.length !== 14) {                
                errors.push('CNPJ must be exactly 14 characters');                
                return { isValid: false, errors };
            }
            if (!/^[0-9A-Z]+$/.test(cnpj)) {                
                errors.push('Contains invalid characters (only 0-9 and A-Z allowed)');                
                return { isValid: false, errors };            
            }
            
            // Check for repeated characters (invalid CNPJs)            
            if (/^(.)\1{13}$/.test(cnpj)) {                
                errors.push('CNPJ cannot have all identical characters');                
                return { isValid: false, errors };            
            }
            
            const base = cnpj.slice(0, 12);            
            const providedCheckDigits = cnpj.slice(12);            
            const calculatedCheckDigits = generateCheckDigits(base);
            
            if (providedCheckDigits !== calculatedCheckDigits) {                
                errors.push(`Check digits don't match (expected: ${calculatedCheckDigits}, got: ${providedCheckDigits})`);                
                return { isValid: false, errors };            
            }
            return { isValid: true, errors: [] };        
        }
        
        // Display Functions        
        function updateDisplayFields(cnpj) {            
            const formatted = cnpj.length === 14 ? formatCNPJ(cnpj) : cnpj;            
            const root = cnpj.length >= 8 ? cnpj.slice(0, 8) : cnpj;            
            const branch = cnpj.length >= 12 ? cnpj.slice(8, 12) : (cnpj.length > 8 ? cnpj.slice(8) : '');            
            const checkDigits = cnpj.length === 14 ? cnpj.slice(12) : '';
            document.getElementById('formattedCnpj').textContent = formatted || '-';
            document.getElementById('unformattedCnpj').textContent = cnpj || '-';
            document.getElementById('rootNumber').textContent = root || '-';
            document.getElementById('branchNumber').textContent = branch || '-';
            document.getElementById('checkDigits').textContent = checkDigits || '-';
        }

        function showResult(message, isValid, errors = []) {            
            const resultMessage = document.getElementById('resultMessage');            
            const errorList = document.getElementById('errorList');   
            
            const badgeClass = isValid ? 'valid-badge' : 'error-badge';            
            const badgeText = isValid ? 'VALID' : 'INVALID';                        
            
            resultMessage.innerHTML = `                
            <div class="badge ${badgeClass}">${badgeText}</div>                
            <p>${message}</p>            
            `;
            
            if (errors.length > 0) {                
                errorList.innerHTML = '<strong>Issues found:</strong><ul>' +                     
                    errors.map(error => '<li>' + error + '</li>').join('') +                     
                    '</ul>';                
                errorList.style.display = 'block';            
            } 
            else {                
                errorList.style.display = 'none';            
            }        
        }
        
        function clearValidation() {            
            document.getElementById('resultMessage').innerHTML = '<p>Enter a CNPJ and click Generate or Validate</p>';            
            document.getElementById('errorList').style.display = 'none';        
        }
        
        // Main Action Functions        
        function handleGenerate() {            
            const input = document.getElementById('cnpjInput').value.trim().toUpperCase();            
            const cleaned = cleanCNPJ(input);
            if (cleaned.length !== 12) {                
                showResult('Enter exactly 12 characters to generate check digits.', false);                
                updateDisplayFields(cleaned);                
                return;            
            }
            
            if (!/^[0-9A-Z]+$/.test(cleaned)) {                
                showResult('Contains invalid characters (only 0-9 and A-Z allowed).', false);                
                updateDisplayFields(cleaned);                
                return;            
            }
            
            const checkDigits = generateCheckDigits(cleaned);            
            const fullCnpj = cleaned + checkDigits;            
            updateDisplayFields(fullCnpj);                        
            
            // Update input field with generated CNPJ            
            document.getElementById('cnpjInput').value = formatCNPJ(fullCnpj);                        
            showResult(`Check digits generated: <strong>${checkDigits}</strong>`, true);        
        }
        
        function handleValidate() {            
            const input = document.getElementById('cnpjInput').value.trim().toUpperCase();            
            const cleaned = cleanCNPJ(input);
            
            updateDisplayFields(cleaned);
            
            if (cleaned.length !== 14) {                
                showResult('CNPJ must be exactly 14 characters.', false);                
                return;            
            }
            
            const validation = validateCNPJ(cleaned);
            
            if (validation.isValid) {                
                showResult('CNPJ is valid! ', true);            
            } else {                
                showResult('CNPJ is invalid ', false, validation.errors);            
            }        
        }
        
        function clearAll() {            
            document.getElementById('cnpjInput').value = '';            
            updateDisplayFields('');            
            clearValidation();            
            document.getElementById('cnpjInput').focus();   
        }
        // Generate a random CNPJ based on selected type        
        function generateRandomCNPJ() {            
            const selectedType = document.querySelector('input[name="cnpjType"]:checked').value;            
            let randomCnpjBase = '';
            
            if (selectedType === 'numeric') {                
                // Generate 12 random digits (0-9)                
                for (let i = 0; i < 12; i++) {                    
                    randomCnpjBase += Math.floor(Math.random() * 10).toString();                
                }            
            } else {                
                // Generate 12 random alphanumeric characters (0-9, A-Z)                
                const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';                
                for (let i = 0; i < 12; i++) {                    
                    randomCnpjBase += chars[Math.floor(Math.random() * chars.length)];                }            }
            
            // Generate check digits            
            const checkDigits = generateCheckDigits(randomCnpjBase);            
            const fullCnpj = randomCnpjBase + checkDigits;
            
            // Update input and display            
            document.getElementById('cnpjInput').value = formatCNPJ(fullCnpj);            
            updateDisplayFields(fullCnpj);                        
            
            const typeLabel = selectedType === 'numeric' ? 'Numeric' : 'Alphanumeric';            
            showResult(`${typeLabel} CNPJ generated successfully! `, true);        
        }
        
        // Event Listeners (defined after all functions)        
        document.addEventListener('DOMContentLoaded', function() {            
            // Initialize display            
            clearValidation();    
            
            // Auto-focus input            
            document.getElementById('cnpjInput').focus();
            
            // Real-time input processing            
            document.getElementById('cnpjInput').addEventListener('input', function() {                
                const cleaned = cleanCNPJ(this.value.trim().toUpperCase());                
                updateDisplayFields(cleaned);                
                clearValidation();            
            });
            
            // Auto-format input as user types            
            document.getElementById('cnpjInput').addEventListener('input', function(e) {                
                // Only keep alphanumeric characters (0-9, A-Z)                
                const value = e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();                
                if (value.length <= 14) {                    
                    e.target.value = formatCNPJInput(value);                
                }            
            });
            
            // Add click handlers for radio buttons            
            document.querySelectorAll('input[name="cnpjType"]').forEach(radio => {                
                radio.addEventListener('change', function() {                    
                    const button = document.querySelector('.btn-generator');                    
                    const typeLabel = this.value === 'numeric' ? 'Numeric' : 'Alphanumeric';                    
                    button.innerHTML = ` Generate Random ${typeLabel} CNPJ`;                                        
                    
                    setTimeout(() => {                        
                        button.innerHTML = ' Generate Random CNPJ';                    
                    }, 2000);                
                });            
            });        
        });
        
        // Keyboard shortcuts        
        document.addEventListener('keydown', function(e) {            
            if (e.ctrlKey || e.metaKey) {                
                switch(e.key.toLowerCase()) {                    
                    case 'g':                        
                        e.preventDefault();                        
                        handleGenerate();                        
                        break;                    
                    case 'v':                        
                        e.preventDefault();                        
                        handleValidate();                        
                        break;                    
                    case 'r':                        
                        if (e.shiftKey) {                            
                            e.preventDefault();                            
                            generateRandomCNPJ();                        
                        } else {                            
                            e.preventDefault();                            
                            clearAll();                        
                        }                        
                        break;                
                }            
            }        
        });
    </script>
