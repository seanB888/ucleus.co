document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking a link
  const mobileLinks = document.querySelectorAll('.nav-mobile .nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });
  
  // FAQ accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      // Toggle active class on question
      this.classList.toggle('active');
      
      // Toggle active class on answer
      const answer = this.nextElementSibling;
      answer.classList.toggle('active');
      
      // Toggle chevron rotation
      const chevron = this.querySelector('.chevron-down');
      if (answer.classList.contains('active')) {
        chevron.style.transform = 'rotate(180deg)';
      } else {
        chevron.style.transform = 'rotate(0)';
      }
    });
  });
  
  // Exit intent popup
  const exitPopup = document.getElementById('exitPopup');
  const closePopup = document.getElementById('closePopup');
  
  if (exitPopup && closePopup) {
    // Close popup when clicking the close button
    closePopup.addEventListener('click', function() {
      exitPopup.classList.remove('active');
      // Store in localStorage to prevent showing again in this session
      localStorage.setItem('popupShown', 'true');
    });
    
    // Show popup on exit intent
    document.addEventListener('mouseleave', function(e) {
      if (e.clientY <= 0 && !localStorage.getItem('popupShown')) {
        exitPopup.classList.add('active');
      }
    });
    
    // Close popup when clicking outside
    exitPopup.addEventListener('click', function(e) {
      if (e.target === exitPopup) {
        exitPopup.classList.remove('active');
        localStorage.setItem('popupShown', 'true');
      }
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80, // Offset for the sticky header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to nav links on scroll
  window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Email submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Get references to popup form elements
    const popupForm = document.querySelector('.popup-content');
    const emailInput = document.getElementById('popupEmail');
    const submitButton = emailInput ? emailInput.nextElementSibling : null;
    const statusMessage = document.createElement('p');
    statusMessage.className = 'status-message';
    
    if (submitButton && emailInput) {
        // Add click event listener to the submit button
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            // Basic validation
            if (!email || !isValidEmail(email)) {
                showStatus('Please enter a valid email address', 'error');
                return;
            }
            
            // Update button state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            // Send data to server
            fetch('./php/save_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email,
                    source: 'exit_popup'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showStatus(data.message, 'success');
                    emailInput.value = '';
                    
                    // Close popup after 3 seconds on success
                    setTimeout(function() {
                        const exitPopup = document.getElementById('exitPopup');
                        if (exitPopup) {
                            exitPopup.classList.remove('active');
                            localStorage.setItem('popupShown', 'true');
                        }
                    }, 3000);
                } else {
                    showStatus(data.message, 'error');
                }
            })
            .catch(error => {
                showStatus('An error occurred. Please try again.', 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = 'Send Me the Free PDF';
            });
        });
    }
    
    // Function to validate email
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Function to show status messages
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        
        // Add the status message to the DOM if it's not already there
        if (!popupForm.contains(statusMessage)) {
            popupForm.appendChild(statusMessage);
        }
    }
});
});