
        document.addEventListener('DOMContentLoaded', function() {
            const startBtn = document.getElementById('start-btn');
            const targetDateInput = document.getElementById('target-date');
            const daysElement = document.getElementById('days');
            const hoursElement = document.getElementById('hours');
            const minutesElement = document.getElementById('minutes');
            const secondsElement = document.getElementById('seconds');
            const messageElement = document.getElementById('message');
            const timeUnits = document.querySelectorAll('.time-unit');
            
            let countdownInterval;
            
            // Set minimum date to current date/time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
            targetDateInput.setAttribute('min', minDateTime);
            
            startBtn.addEventListener('click', startCountdown);
            
            function startCountdown() {
                // Clear any existing countdown
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                }
                
                const targetDateValue = targetDateInput.value;
                
                if (!targetDateValue) {
                    alert('Please select a target date and time!');
                    return;
                }
                
                const targetDate = new Date(targetDateValue).getTime();
                
                // Update countdown immediately
                updateCountdown(targetDate);
                
                // Update countdown every second
                countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
                
                // Hide completion message
                messageElement.classList.remove('completed');
            }
            
            function updateCountdown(targetDate) {
                const now = new Date().getTime();
                const timeRemaining = targetDate - now;
                
                if (timeRemaining <= 0) {
                    // Countdown completed
                    clearInterval(countdownInterval);
                    daysElement.textContent = '00';
                    hoursElement.textContent = '00';
                    minutesElement.textContent = '00';
                    secondsElement.textContent = '00';
                    
                    // Show completion message
                    messageElement.classList.add('completed');
                    
                    // Add active class to all time units
                    timeUnits.forEach(unit => unit.classList.add('active'));
                    
                    return;
                }
                
                // Calculate days, hours, minutes, seconds
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                
                // Update display
                daysElement.textContent = String(days).padStart(2, '0');
                hoursElement.textContent = String(hours).padStart(2, '0');
                minutesElement.textContent = String(minutes).padStart(2, '0');
                secondsElement.textContent = String(seconds).padStart(2, '0');
                
                // Add active class to time units with values > 0
                timeUnits[0].classList.toggle('active', days > 0);
                timeUnits[1].classList.toggle('active', hours > 0 || days > 0);
                timeUnits[2].classList.toggle('active', minutes > 0 || hours > 0 || days > 0);
                timeUnits[3].classList.toggle('active', true); // Always active while counting
            }
        });
    