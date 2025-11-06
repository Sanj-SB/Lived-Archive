// app.js - Main application entry point

import { loadArchive, zoomIn, zoomOut, resetZoom } from './graph.js';
import { 
  handleLoginClick, 
  submitLogin, 
  closeLoginModal,
  closeModal,
  viewArtifactDetails as adminViewDetails,
  acceptArtifact as adminAcceptArtifact,
  loadReviewQueue,
  initializeAdmin
} from './admin.js';

// State management
let pendingArtifacts = [];
let acceptedArtifacts = [
  {
    title: "Slum Jaggathu, edition 220",
    tags: ["Print Publication (Magazine, Pamphlet, Zine)", "Alternative News / Reporting", "Media & Representation", "Education & Literacy"],
    timestamp: "2025-12-31",
    format: "text",
    textContent: "Sample publication content",
    description: "A community publication highlighting local issues and stories."
  },
  {
    title: "Hidden Hunger in Plain Sight, Ambedkarian Chronicles",
    tags: ["Text (Article, Essay, Letter)", "Resistance & Protest", "Awareness / Advocacy", "Social Justice"],
    timestamp: "2025-11-15",
    format: "text",
    textContent: "Sample article content",
    description: "An article exploring food insecurity and social justice."
  },
  {
    title: "I Brought Ambedkar Home, Ambedkarian Chronicles",
    tags: ["Oral Histories / Personal Narratives", "Text (Article, Essay, Letter)", "Memory & Commemoration", "Culture & Heritage"],
    timestamp: "2025-10-20",
    format: "text",
    textContent: "Sample narrative content",
    description: "A personal narrative about cultural heritage and identity."
  },
  {
    title: "Arc.Bangalore",
    tags: ["Community Organizing", "Social Media Post (Instagram, WhatsApp, Twitter, etc.)", "Awareness / Advocacy", "Urban Life & Infrastructure"],
    timestamp: "2025-09-10",
    format: "text",
    textContent: "Sample social media content",
    description: "Community organizing initiative in Bangalore."
  },
  {
    title: "Studying Gender Without Caste Does the Subject a Disservice, The Wire",
    tags: ["Text (Article, Essay, Letter)", "Awareness / Advocacy", "Social Justice", "Caste & Marginalization"],
    timestamp: "2025-08-05",
    format: "text",
    textContent: "Sample article content",
    description: "An analysis of intersectionality in academic discourse."
  }
];

let currentSubmitterInfo = null;

// Make functions globally available for onclick handlers
window.handleLoginClick = () => handleLoginClick();
window.submitLogin = () => submitLogin();
window.closeLoginModal = () => closeLoginModal();
window.closeModal = () => closeModal();
window.zoomIn = () => zoomIn();
window.zoomOut = () => zoomOut();
window.resetZoom = () => resetZoom();

// User info modal functions
window.showUserInfoModal = function() {
  document.getElementById('userInfoModal').classList.add('active');
  document.getElementById('submitterName').value = '';
  document.getElementById('submitterEmail').value = '';
  document.getElementById('submitterDesignation').value = '';
  document.getElementById('userInfoError').style.display = 'none';
};

window.submitUserInfo = function() {
  const name = document.getElementById('submitterName').value.trim();
  const email = document.getElementById('submitterEmail').value.trim();
  const designation = document.getElementById('submitterDesignation').value.trim();
  const errorDiv = document.getElementById('userInfoError');

  if (!name || !email) {
    errorDiv.textContent = 'Please fill in all required fields';
    errorDiv.style.display = 'block';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = 'Please enter a valid email address';
    errorDiv.style.display = 'block';
    return;
  }

  currentSubmitterInfo = {
    name: name,
    email: email,
    designation: designation || 'Not specified'
  };

  closeUserInfoModal();
  window.location.href = 'submit.html';
};

window.closeUserInfoModal = function() {
  document.getElementById('userInfoModal').classList.remove('active');
};

// View artifact details wrapper
window.viewArtifactDetails = function(index, isPending) {
  adminViewDetails(index, isPending, pendingArtifacts, acceptedArtifacts);
};

// Accept artifact wrapper
window.acceptArtifactHandler = function(index) {
  adminAcceptArtifact(index, pendingArtifacts, acceptedArtifacts, () => {
    loadArchive(acceptedArtifacts);
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize admin
  initializeAdmin();
  
  // Load the archive graph
  loadArchive(acceptedArtifacts);
  
  // Set up modal close on outside click
  document.getElementById('artifactModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
  
  document.getElementById('userInfoModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeUserInfoModal();
    }
  });
  
  document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeLoginModal();
    }
  });
});

// Export state getters for other modules if needed
export function getPendingArtifacts() {
  return pendingArtifacts;
}

export function getAcceptedArtifacts() {
  return acceptedArtifacts;
}

export function getCurrentSubmitterInfo() {
  return currentSubmitterInfo;
}

export function setCurrentSubmitterInfo(info) {
  currentSubmitterInfo = info;
}