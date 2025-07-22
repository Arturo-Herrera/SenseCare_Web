// Medical History JavaScript Functionality

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMedicalHistory();
});

function initializeMedicalHistory() {
    setupEventListeners();
    loadPatientData();
    setupSearchFunctionality();
}

// Setup all event listeners
function setupEventListeners() {
    // Alert item click handlers
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        item.addEventListener('click', handleAlertClick);
    });

    // Report item click handlers
    const reportItems = document.querySelectorAll('.report-item');
    reportItems.forEach(item => {
        item.addEventListener('click', handleReportClick);
    });

    // Add report button handler
    const addReportBtn = document.querySelector('.add-report-btn');
    if (addReportBtn) {
        addReportBtn.addEventListener('click', handleAddReport);
    }

    // Patient selector handler
    const patientSelect = document.querySelector('.patient-select');
    if (patientSelect) {
        patientSelect.addEventListener('change', handlePatientChange);
    }
}

// Handle alert item clicks
function handleAlertClick(event) {
    const alertItem = event.currentTarget;
    const alertText = alertItem.querySelector('.alert-text').textContent;
    const alertTime = alertItem.querySelector('.alert-time').textContent;
    
    // Toggle expanded state
    alertItem.classList.toggle('expanded');
    
    // Show alert details (you can expand this functionality)
    console.log(`Alert clicked: ${alertText} - ${alertTime}`);
    
    // You can add more functionality here like:
    // - Show detailed alert information
    // - Mark alert as read
    // - Show alert history
    showAlertDetails(alertText, alertTime);
}

// Handle report item clicks
function handleReportClick(event) {
    const reportItem = event.currentTarget;
    const reportId = reportItem.querySelector('.report-id').textContent;
    const reportReason = reportItem.querySelector('.report-reason').textContent;
    
    console.log(`Report clicked: ${reportId} - ${reportReason}`);
    
    // You can add functionality here like:
    // - Open report in detail view
    // - Download report
    // - Edit report
    showReportDetails(reportId, reportReason);
}

// Handle add report button
function handleAddReport() {
    console.log('Add new report clicked');
    
    // You can add functionality here like:
    // - Open add report modal
    // - Navigate to add report page
    // - Show form to create new report
    showAddReportModal();
}

// Handle patient selection change
function handlePatientChange(event) {
    const selectedPatient = event.target.value;
    console.log(`Patient selected: ${selectedPatient}`);
    
    // Load data for selected patient
    loadPatientData(selectedPatient);
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Handle search input
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    console.log(`Searching for: ${searchTerm}`);
    
    // Filter alerts
    filterAlerts(searchTerm);
    
    // Filter reports
    filterReports(searchTerm);
}

// Filter alerts based on search term
function filterAlerts(searchTerm) {
    const alertItems = document.querySelectorAll('.alert-item');
    
    alertItems.forEach(item => {
        const alertText = item.querySelector('.alert-text').textContent.toLowerCase();
        const alertTime = item.querySelector('.alert-time').textContent.toLowerCase();
        
        if (alertText.includes(searchTerm) || alertTime.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = searchTerm === '' ? 'flex' : 'none';
        }
    });
}

// Filter reports based on search term
function filterReports(searchTerm) {
    const reportItems = document.querySelectorAll('.report-item');
    
    reportItems.forEach(item => {
        const reportId = item.querySelector('.report-id').textContent.toLowerCase();
        const reportReason = item.querySelector('.report-reason').textContent.toLowerCase();
        const reportDoctor = item.querySelector('.report-doctor').textContent.toLowerCase();
        
        if (reportId.includes(searchTerm) || 
            reportReason.includes(searchTerm) || 
            reportDoctor.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = searchTerm === '' ? 'block' : 'none';
        }
    });
}

// Load patient data
function loadPatientData(patientId = null) {
    console.log(`Loading data for patient: ${patientId || 'default'}`);
    
    // Here you would typically make an API call to load patient data
    // For now, we'll just simulate loading
    
    if (patientId) {
        // Simulate loading specific patient data
        updateUIForPatient(patientId);
    } else {
        // Load default/all patients data
        console.log('Loading default patient data');
    }
}

// Update UI for specific patient
function updateUIForPatient(patientId) {
    // This would typically update the alerts and reports based on the selected patient
    console.log(`Updating UI for patient: ${patientId}`);
    
    // You can add functionality here to:
    // - Filter alerts by patient
    // - Filter reports by patient
    // - Update patient-specific information
}

// Show alert details (placeholder function)
function showAlertDetails(alertText, alertTime) {
    // You can implement a modal or detailed view here
    console.log('Showing alert details:', { alertText, alertTime });
    
    // Example: Show more details about the alert
    // This could open a modal with:
    // - Patient vital signs at the time of alert
    // - Actions taken
    // - Alert severity
    // - Related medical history
}

// Show report details (placeholder function)
function showReportDetails(reportId, reportReason) {
    // You can implement a detailed report view here
    console.log('Showing report details:', { reportId, reportReason });
    
    // Example: Show full report
    // This could open a modal or new page with:
    // - Full report content
    // - Patient information
    // - Doctor notes
    // - Test results
    // - Recommendations
}

// Show add report modal (placeholder function)
function showAddReportModal() {
    // You can implement an add report form here
    console.log('Showing add report modal');
    
    // Example: Open modal with form fields:
    // - Patient selection
    // - Report type
    // - Reason/Description
    // - Doctor information
    // - Date/Time
    // - Additional notes
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Utility function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add animation effects
function addAnimationEffects() {
    // Add fade-in animation to elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observe all alert and report items
    document.querySelectorAll('.alert-item, .report-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addAnimationEffects, 100);
});

// Export functions for testing or external use
window.MedicalHistory = {
    loadPatientData,
    handleSearch,
    showAlertDetails,
    showReportDetails,
    formatDate,
    formatTime
};