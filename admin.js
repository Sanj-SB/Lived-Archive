// admin.js - Handles admin authentication and review queue

import { switchPage } from './navigation.js';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// State
let isLoggedIn = false;

// Initialize admin functionality
export function initializeAdmin() {
  // Set up login modal event listeners
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitLogin();
      }
    });
  }
  
  const loginUsername = document.getElementById('loginUsername');
  if (loginUsername) {
    loginUsername.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitLogin();
      }
    });
  }
  
  // Close modal when clicking outside
  document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeLoginModal();
    }
  });
}

// Handle login button click
export function handleLoginClick() {
  if (isLoggedIn) {
    switchPage('review');
  } else {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
  }
}

// Submit login credentials
export function submitLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errorDiv = document.getElementById('loginError');
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isLoggedIn = true;
    closeLoginModal();
    switchPage('review');
  } else {
    errorDiv.textContent = 'Invalid username or password';
    errorDiv.style.display = 'block';
  }
}

// Close login modal
export function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

// Load review queue
export function loadReviewQueue(pendingArtifacts) {
  const reviewContent = document.getElementById('reviewContent');
  
  if (pendingArtifacts.length === 0) {
    reviewContent.innerHTML = `
      <div class="no-artifacts">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        <h3>No Pending Reviews</h3>
        <p>All artifacts have been reviewed!</p>
      </div>
    `;
    return;
  }
  
  reviewContent.innerHTML = '';
  pendingArtifacts.forEach((artifact, index) => {
    const artifactCard = createReviewCard(artifact, index);
    reviewContent.appendChild(artifactCard);
  });
}

// Create review card for an artifact
function createReviewCard(artifact, index) {
  const card = document.createElement('div');
  card.className = 'artifact-card';
  card.style.marginBottom = '30px';
  
  let imageHTML = '';
  
  if (artifact.visualDataURL && artifact.visualFile && artifact.visualFile.type.startsWith('image/')) {
    imageHTML = `<div class="artifact-card-image"><img src="${artifact.visualDataURL}" alt="Artifact"></div>`;
  } else {
    imageHTML = `<div class="artifact-card-image"></div>`;
  }
  
  card.innerHTML = `
    ${imageHTML}
    <div class="artifact-card-content">
      <h3>${artifact.title || 'Untitled Artifact'}</h3>
      <div class="artifact-tags">
        ${artifact.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  `;
  
  card.onclick = () => viewArtifactDetails(index, true);
  return card;
}

// View artifact details in modal
export function viewArtifactDetails(index, isPending, pendingArtifacts, acceptedArtifacts) {
  const artifact = isPending ? pendingArtifacts[index] : acceptedArtifacts[index];
  const modal = document.getElementById('artifactModal');
  const modalBody = document.getElementById('modalBody');
  
  let contentHTML = '';
  
  // Visual content (image or PDF)
  if (artifact.visualDataURL) {
    if (artifact.visualFile && artifact.visualFile.type.startsWith('image/')) {
      contentHTML += `
        <div class="artifact-section">
          <img src="${artifact.visualDataURL}" class="artifact-image" alt="Artifact image">
        </div>
      `;
    } else if (artifact.visualFile && artifact.visualFile.type === 'application/pdf') {
      contentHTML += `
        <div class="artifact-section">
          <iframe src="${artifact.visualDataURL}" class="artifact-pdf" title="PDF Document"></iframe>
        </div>
      `;
    }
  }
  
  // Title
  contentHTML += `
    <div class="artifact-section">
      <h3>${artifact.title || 'Title'}</h3>
    </div>
    <div class="artifact-section">
      <div class="artifact-tags-display">
        ${artifact.tags.map(tag => `<span class="tag readonly">${tag}</span>`).join('')}
      </div>
    </div>
  `;
  
  // Description
  if (artifact.description) {
    contentHTML += `
      <div class="artifact-section">
        <h3>Details</h3>
        <div class="artifact-text">${artifact.description.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  }
  
  // Text content
  if (artifact.textContent) {
    contentHTML += `
      <div class="artifact-section">
        <div class="artifact-text">${artifact.textContent}</div>
      </div>
    `;
  }
  
  // Audio content
  if (artifact.audioDataURL) {
    contentHTML += `
      <div class="artifact-section">
        <audio controls class="artifact-audio" src="${artifact.audioDataURL}"></audio>
      </div>
    `;
  }
  
  // Submitter information
  if (artifact.submitter) {
    contentHTML += `
      <div class="artifact-section">
        <h3>Submitted By</h3>
        <div class="artifact-text">
          <strong>Name:</strong> ${artifact.submitter.name}<br>
          <strong>Email:</strong> ${artifact.submitter.email}<br>
          <strong>Designation:</strong> ${artifact.submitter.designation}
        </div>
      </div>
    `;
  }
  
  // Review actions (only for pending artifacts)
  if (isPending) {
    contentHTML += `
      <div class="review-actions">
        <button class="accept-btn" onclick="window.acceptArtifactHandler(${index})">Accept</button>
        <button class="reject-btn" disabled>Reject</button>
      </div>
    `;
  }
  
  modalBody.innerHTML = `<div class="artifact-viewer">${contentHTML}</div>`;
  modal.classList.add('active');
}

// Accept artifact and move to archive
export function acceptArtifact(index, pendingArtifacts, acceptedArtifacts, loadArchiveCallback) {
  const artifact = pendingArtifacts.splice(index, 1)[0];
  acceptedArtifacts.push(artifact);
  alert('Artifact accepted and added to archive!');
  closeModal();
  loadReviewQueue(pendingArtifacts);
  
  // Reload the archive if a callback is provided
  if (loadArchiveCallback) {
    loadArchiveCallback();
  }
}

// Close artifact modal
export function closeModal() {
  document.getElementById('artifactModal').classList.remove('active');
}

// Check if user is logged in
export function getLoginStatus() {
  return isLoggedIn;
}

// Initialize modal close on outside click
export function initializeModalListeners() {
  document.getElementById('artifactModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
}