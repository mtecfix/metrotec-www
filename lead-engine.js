jQuery(document).ready(function($) {
    let currentStep = 1;
    const totalSteps = 3;
    
    // Step navigation
    $('.next-step').on('click', function() {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });
    
    $('.prev-step').on('click', function() {
        currentStep--;
        showStep(currentStep);
    });
    
    function showStep(step) {
        $('.form-step').removeClass('active');
        $('.form-step[data-step="' + step + '"]').addClass('active');
        
        // Update progress indicator if exists
        updateProgress(step);
    }
    
    function updateProgress(step) {
        const progress = (step / totalSteps) * 100;
        if ($('.progress-bar').length) {
            $('.progress-bar').css('width', progress + '%');
        }
    }
    
    function validateStep(step) {
        let isValid = true;
        const currentStepEl = $('.form-step[data-step="' + step + '"]');
        
        // Clear previous errors
        currentStepEl.find('.error').removeClass('error');
        
        // Validate required fields in current step
        currentStepEl.find('input[required], select[required]').each(function() {
            if (!$(this).val().trim()) {
                $(this).addClass('error');
                isValid = false;
            }
        });
        
        // Email validation
        const email = currentStepEl.find('input[type="email"]');
        if (email.length && email.val()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.val())) {
                email.addClass('error');
                isValid = false;
            }
        }
        
        if (!isValid) {
            showError('Please fill in all required fields correctly.');
        }
        
        return isValid;
    }
    
    function showError(message) {
        // Remove existing error messages
        $('.error-message').remove();
        
        // Add new error message
        const errorDiv = $('<div class="error-message" style="color: #dc3545; margin: 10px 0; padding: 10px; background: #f8d7da; border-radius: 4px;">' + message + '</div>');
        $('.form-step.active').prepend(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            errorDiv.fadeOut();
        }, 5000);
    }
    
    function showSuccess(message) {
        const successDiv = $('<div class="success-message" style="color: #155724; margin: 10px 0; padding: 10px; background: #d4edda; border-radius: 4px;">' + message + '</div>');
        $('.form-step.active').prepend(successDiv);
    }
    
    // Form submission
    $('#metrotec-lead-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }
        
        const submitBtn = $('.submit-lead');
        const originalText = submitBtn.text();
        
        // Show loading state
        submitBtn.text('Submitting...').prop('disabled', true);
        
        // Collect form data
        const formData = new FormData(this);
        
        // Convert to object for AJAX
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Submit via AJAX
        $.ajax({
            url: metrotec_ajax.ajax_url,
            type: 'POST',
            data: data,
            success: function(response) {
                if (response.success) {
                    // Hide form and show success message
                    $('#metrotec-lead-form').fadeOut(function() {
                        $('#lead-success').fadeIn();
                    });
                    
                    // Track conversion (Google Analytics, Facebook Pixel, etc.)
                    trackConversion(data);
                    
                } else {
                    showError('There was an error submitting your information. Please try again.');
                    submitBtn.text(originalText).prop('disabled', false);
                }
            },
            error: function() {
                showError('There was a connection error. Please check your internet and try again.');
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    });
    
    function trackConversion(leadData) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                'event_category': 'Lead Generation',
                'event_label': leadData.industry,
                'value': getLeadValue(leadData.budget_range)
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_category: leadData.industry,
                value: getLeadValue(leadData.budget_range),
                currency: 'USD'
            });
        }
        
        // Custom tracking
        if (typeof window.metrotecTracking !== 'undefined') {
            window.metrotecTracking.trackLead(leadData);
        }
    }
    
    function getLeadValue(budgetRange) {
        const values = {
            'under-1000': 500,
            '1000-2500': 1750,
            '2500-5000': 3750,
            '5000-10000': 7500,
            '10000+': 15000
        };
        return values[budgetRange] || 1000;
    }
    
    // Real-time validation
    $('input, select, textarea').on('blur', function() {
        $(this).removeClass('error');
        
        if ($(this).attr('required') && !$(this).val().trim()) {
            $(this).addClass('error');
        }
        
        // Email validation
        if ($(this).attr('type') === 'email' && $(this).val()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test($(this).val())) {
                $(this).addClass('error');
            }
        }
    });
    
    // Auto-save form data to localStorage
    $('input, select, textarea').on('change', function() {
        const formData = $('#metrotec-lead-form').serialize();
        localStorage.setItem('metrotec_lead_form_data', formData);
    });
    
    // Restore form data on page load
    const savedData = localStorage.getItem('metrotec_lead_form_data');
    if (savedData) {
        const params = new URLSearchParams(savedData);
        for (let [key, value] of params) {
            const field = $('[name="' + key + '"]');
            if (field.attr('type') === 'checkbox') {
                field.filter('[value="' + value + '"]').prop('checked', true);
            } else {
                field.val(value);
            }
        }
    }
    
    // Clear saved data on successful submission
    $(document).on('lead_submitted', function() {
        localStorage.removeItem('metrotec_lead_form_data');
    });
    
    // Add CSS for error states
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .error {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .form-step {
                animation: fadeIn 0.3s ease-in-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .submit-lead:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        `)
        .appendTo('head');
});
