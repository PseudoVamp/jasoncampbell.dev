document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.contact-form');
  const submitButton = document.querySelector('.send-button');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const buttonText = submitButton.querySelector('span');
  const buttonArrow = submitButton.querySelector('.button-arrow');

  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission

    // Show loading state
    submitButton.disabled = true;
    buttonText.textContent = 'Sending...';
    buttonArrow.textContent = '⌛';
    
    // Hide any existing messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    try {
      // Get form data
      const formData = new FormData(form);
      
      // Send the form data
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
      });

      if (response.ok) {
        // Success! Show success message
        successMessage.style.display = 'block';
        form.reset(); // Clear the form
        
        // Scroll to success message
        successMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Reset button after a delay
        setTimeout(() => {
          submitButton.disabled = false;
          buttonText.textContent = 'Send Message';
          buttonArrow.textContent = '→';
        }, 2000);
        
      } else {
        throw new Error('Network response was not ok');
      }
      
    } catch (error) {
      console.error('Error:', error);
      
      // Show error message
      errorMessage.style.display = 'block';
      
      // Scroll to error message
      errorMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Reset button
      submitButton.disabled = false;
      buttonText.textContent = 'Send Message';
      buttonArrow.textContent = '→';
    }
  });

  // Add some nice form field animations
  const inputs = document.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (this.value === '') {
        this.parentElement.classList.remove('focused');
      }
    });
    
    // Check if field has value on page load
    if (input.value !== '') {
      input.parentElement.classList.add('focused');
    }
  });
});