// admin.js - Handles admin authentication and review queue

import { switchPage } from './navigation.js';
import { supabase } from './supabaseClient.js';

// Ensure supabase is available globally
if (typeof window !== 'undefined' && !window.supabase) {
  window.supabase = supabase;
}

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// State
let isLoggedIn = false;

// Initialize admin functionality
export function initializeAdmin() {
  // Always show review queue and logout button
  const reviewPage = document.getElementById('reviewPage');
  if (reviewPage) reviewPage.style.display = 'block';
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'inline-block';
  // Fetch and show pending artifacts (assumes app.js loads them)
  if (typeof window.loadReviewQueue === 'function' && window.pendingArtifacts) {
    window.loadReviewQueue(window.pendingArtifacts);
  }
  // Set up login event listeners
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
}

// Handle login button click
export function handleLoginClick() {
  if (isLoggedIn) {
    switchPage('review');
  } else {
    // Show login modal overlay
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
      loginPage.classList.add('active');
      loginPage.style.display = 'flex';
    }
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
    const reviewPage = document.getElementById('reviewPage');
    if (reviewPage) reviewPage.style.display = 'none';
  }
}

// Submit login credentials
export function submitLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errorDiv = document.getElementById('loginError');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    // Hide login modal, show review queue
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
      loginPage.classList.remove('active');
      loginPage.style.display = 'none';
    }
    const reviewPage = document.getElementById('reviewPage');
    if (reviewPage) reviewPage.style.display = 'block';
    // Show logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    // Load review queue
    if (typeof window.loadReviewQueue === 'function' && window.pendingArtifacts) {
      window.loadReviewQueue(window.pendingArtifacts);
    }
  } else {
    errorDiv.textContent = 'Invalid username or password';
    errorDiv.style.display = 'block';
  }
// Logout function
function handleLogout() {
  isLoggedIn = false;
  localStorage.setItem('isLoggedIn', 'false');
  // Show login page, hide review queue
  const loginPage = document.getElementById('loginPage');
  if (loginPage) loginPage.style.display = 'block';
  const reviewPage = document.getElementById('reviewPage');
  if (reviewPage) reviewPage.style.display = 'none';
  // Hide logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'none';
}
window.handleLogout = handleLogout;
}

// Close login modal
export function closeLoginModal() {
  const loginPage = document.getElementById('loginPage');
  if (loginPage) {
    loginPage.style.display = 'none';
  }
}

// Load review queue
export function loadReviewQueue(pendingArtifacts) {
  console.log('loadReviewQueue called with:', pendingArtifacts);
  // Update pendingCount
  const pendingCount = document.getElementById('pendingCount');
  if (pendingCount) {
    pendingCount.textContent = `${pendingArtifacts.length} artifact${pendingArtifacts.length === 1 ? '' : 's'} pending review`;
  }
  // Ensure reviewPage is visible
  const reviewPage = document.getElementById('reviewPage');
  if (reviewPage) reviewPage.classList.add('active');
  const reviewContent = document.getElementById('reviewContent');

  if (!reviewContent) return;

  if (!pendingArtifacts || pendingArtifacts.length === 0) {
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
  // Store artifacts globally for modal use
  window._pendingArtifacts = pendingArtifacts;
  pendingArtifacts.forEach((artifact, index) => {
    const artifactCard = createReviewCard(artifact, index, pendingArtifacts);
    reviewContent.appendChild(artifactCard);
  });
}

// Create review card for an artifact
function createReviewCard(artifact, index, artifactsArr) {
  const card = document.createElement('div');
  card.className = 'artifact-card';
  card.style.marginBottom = '30px';
  
  let imageHTML = '';
  // Prefer visual_url (from Supabase), fallback to file_url, then nothing
  const imageUrl = artifact.visual_url || artifact.file_url || null;
  if (imageUrl) {
    imageHTML = `<div class="artifact-card-image"><img src="${imageUrl}" alt="Artifact"></div>`;
  } else {
    imageHTML = `<div class="artifact-card-image"></div>`;
  }
  card.innerHTML = `
    ${imageHTML}
    <div class="artifact-card-content">
      <h3>${artifact.title || 'Untitled Artifact'}</h3>
      <div class="artifact-tags">
        ${artifact.tags && Array.isArray(artifact.tags) ? artifact.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
      </div>
    </div>
  `;
  // Expose viewArtifactDetails globally for card click
  if (typeof window !== 'undefined') {
    window.viewArtifactDetailsHandler = (idx, isPending, artifactsArr) => {
      viewArtifactDetails(idx, isPending, artifactsArr, []);
    };
  }
  card.onclick = () => window.viewArtifactDetailsHandler(index, true, artifactsArr);
  return card;
}

// View artifact details in modal
export function viewArtifactDetails(index, isPending, pendingArtifacts, acceptedArtifacts) {
  const artifact = isPending ? pendingArtifacts[index] : acceptedArtifacts[index];
  let contentHTML = '';
  // Accept button for pending artifacts
  if (isPending) {
    contentHTML += `
      <div class="review-actions">
        <button class="accept-btn" onclick="window.acceptArtifactHandler(${index})">Accept</button>
      </div>
    `;
    window.acceptArtifactHandler = async function(idx) {
  const artifact = pendingArtifacts[idx];
  console.log('Attempting to delete artifact:', artifact);
  console.log('Artifact id used for delete:', artifact.id);
      // Move artifact from pending to accepted in Supabase
      try {
        // Build row for accepted_artifacts based on schema
        const row = {
          title: artifact.title,
          description: artifact.description,
          tags: artifact.tags,
          submitter_name: artifact.submitter?.name || '',
          submitter_email: artifact.submitter?.email || '',
          submitter_designation: artifact.submitter?.designation || '',
          timestamp: artifact.created_at,
          format: artifact.format,
        };
        // Only add file_url for image/pdf/audio
        if (artifact.file_url) row.file_url = artifact.file_url;
        // Only add text_content for text
        if (artifact.textContent && artifact.format === 'text') row.text_content = artifact.textContent;
        // Insert into accepted_artifacts
        const { data: insertData, error: insertErr } = await window.supabase.from('accepted_artifacts').insert([row]);
        if (insertErr) {
          alert('Error inserting into accepted_artifacts: ' + insertErr.message);
          return;
        }
        // Delete from pending_artifacts
        const { data: deleteData, error: deleteErr } = await window.supabase.from('pending_artifacts').delete().eq('id', artifact.id);
        if (deleteErr) {
          alert('Error deleting from pending_artifacts: ' + deleteErr.message);
          console.error('Delete error details:', deleteErr);
          return;
        }
        if (!deleteData || (Array.isArray(deleteData) && deleteData.length === 0)) {
          alert('Delete operation did not remove any rows. Check if the artifact id matches the table.');
          console.warn('Delete operation returned:', deleteData);
        }
        alert('Artifact accepted and moved to archive!');
        document.getElementById('artifactModal').classList.remove('active');
        // Refresh page to update queue and graph
        window.location.reload();
      } catch (err) {
        alert('Error accepting artifact: ' + err.message);
      }
    };
  }
  const modal = document.getElementById('artifactModal');
  const modalBody = document.getElementById('modalBody');
  // Prefer visual_url (from Supabase), fallback to file_url, then nothing
  const imageUrl = artifact.visual_url || artifact.file_url || null;
  if (imageUrl) {
    contentHTML += `
      <div class="artifact-section">
        <img src="${imageUrl}" class="artifact-image" alt="Artifact image">
      </div>
    `;
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
  // Audio content (support stored URL `audio_url` or in-memory `audioDataURL`)
  const audioUrl = artifact.audioDataURL || artifact.audio_url || null;
  if (audioUrl) {
    contentHTML += `
      <div class="artifact-section">
        <audio controls class="artifact-audio" src="${audioUrl}"></audio>
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
  // Move the artifact from pending array to accepted array and sync with database
  const artifact = pendingArtifacts.splice(index, 1)[0];
  acceptedArtifacts.push(artifact);

  // Try to update Supabase: remove from pending_artifacts and insert into accepted_artifacts
  (async () => {
    try {
      // If artifact has an id (from DB), use it to delete; otherwise try to match by title+timestamp
      const match = {};
      if (artifact.id) {
        match.id = artifact.id;
      } else {
        match.title = artifact.title;
        match.timestamp = artifact.timestamp;
      }

      // Insert into accepted_artifacts table
      if (window.supabase) {
        const row = {
          title: artifact.title,
          description: artifact.description,
          tags: artifact.tags,
          submitter: artifact.submitter,
          timestamp: artifact.timestamp,
          format: artifact.format,
          text_content: artifact.textContent || null,
          visual_url: artifact.visual_url || artifact.visualDataURL || null,
          audio_url: artifact.audio_url || artifact.audioDataURL || null,
          status: 'accepted'
        };
        const { data: insertData, error: insertErr } = await window.supabase.from('accepted_artifacts').insert([row]);
        if (insertErr) console.error('Error inserting into accepted_artifacts:', insertErr);

        // Delete from pending_artifacts if possible
        if (match.id) {
          const { error: delErr } = await window.supabase.from('pending_artifacts').delete().eq('id', match.id);
          if (delErr) console.error('Error deleting pending artifact by id:', delErr);
        } else {
          // Try deleting by title and timestamp
          const { error: delErr } = await window.supabase.from('pending_artifacts').delete().match({ title: match.title, timestamp: match.timestamp });
          if (delErr) console.error('Error deleting pending artifact by match:', delErr);
        }
      }
    } catch (err) {
      console.error('Error syncing acceptance with Supabase:', err);
    }
  })();

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
  const modal = document.getElementById('artifactModal');
  if (modal) modal.classList.remove('active');
}

// Backwards-compatible global
window.closeModal = closeModal;

// Check if user is logged in
export function getLoginStatus() {
  return isLoggedIn;
}

// Initialize modal close on outside click
// Logout function (optional, can just reload to home)
function handleLogout() {
  window.location.href = 'index.html';
}
window.handleLogout = handleLogout;