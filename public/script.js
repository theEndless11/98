function showNotification(message, isError = false) {
    const notificationElement = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;

    // Set the style for error or success
    if (isError) {
        notificationElement.classList.add('error-notification');
    } else {
        notificationElement.classList.remove('error-notification');
    }

    // Show the notification with animation
    notificationElement.classList.add('show-notification');

    // Hide after 3 seconds
    setTimeout(() => {
        notificationElement.classList.remove('show-notification');
    }, 3000);
}
// Function to toggle between light and dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const modeIcon = document.querySelector('.mode-toggle');

    // Switch emoji based on the current mode
    if (document.body.classList.contains('dark-mode')) {
        modeIcon.textContent = '🌞'; // Sun for light mode
    } else {
        modeIcon.textContent = '🌙'; // Moon for dark mode
    }
}

    document.getElementById('fabBtn').addEventListener('click', function (event) {
        event.stopPropagation();
        const navOptions = document.querySelector('.nav-options');
        navOptions.classList.toggle('visible');
    });
    
    function showContent(contentId) {
        const overlay = document.getElementById('overlay');
        const allContent = document.querySelectorAll('.content');
        
        // Hide all content sections
        allContent.forEach(content => {
            content.classList.remove('visible');
            content.classList.add('hidden');
        });
    
        // Show the selected content
        const contentToShow = document.getElementById(contentId);
        if (contentToShow) {
            contentToShow.classList.remove('hidden');
            contentToShow.classList.add('visible');
            overlay.classList.add('visible'); // Show the overlay
        }
    
        // Close the menu options
        const navOptions = document.querySelector('.nav-options');
        navOptions.classList.remove('visible');
    }
    
    // Event listeners for buttons to show content
    document.getElementById('termsBtn').addEventListener('click', function () {
        showContent('termsContent');
    });
    
    document.getElementById('contactBtn').addEventListener('click', function () {
        showContent('contactContent');
    });
    
    document.getElementById('communityBtn').addEventListener('click', function () {
        showContent('communityContent');
    });
    
    // Close the overlay when the close button is clicked
    document.getElementById('closeBtn').addEventListener('click', function () {
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('visible');
    });
    
    // Prevent hiding the overlay when clicking inside the content container
    document.getElementById('overlay').addEventListener('click', function(event) {
        const contentContainer = document.querySelector('.content-container');
        if (!contentContainer.contains(event.target)) {
            overlay.classList.remove('visible');
        }
    });
    // Generate a unique session ID if it doesn't exist in sessionStorage
    if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', generateSessionId());
    }

    // Generate a unique 4-word username for the user
    let username = localStorage.getItem('username');
    if (!username) {
        username = generateUsername();
        localStorage.setItem('username', username);  // Save it in localStorage for "remember me"
    }
    
    // Edit post functionality
    function editPost(postId, postUsername) {
        const currentUsername = username;

        if (postUsername !== currentUsername) {
            showNotification("You can only edit your own posts.", true);
            return;
        }

        const postText = prompt('Edit your opinion:');
        if (postText) {
            const updatedPost = { id: postId, message: postText, timestamp: new Date(), username: currentUsername };
            channel.publish('editOpinion', updatedPost);
            updatePostInFeed(updatedPost);

            // Show success notification
            showNotification('Post updated successfully!', false);
        }
    }
    
    // Helper function to generate a unique session ID
    function generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Helper function to generate a 4-word username
    function generateUsername() {
        const words = ["Sun", "Moon", "Star", "Sky", "Ocean", "Forest", "Mountain", "Cloud", "River", "Desert", "Lake", "Earth"];
        const randomWords = [];
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWords.push(words[randomIndex]);
        }
        return randomWords.join("");
    }

