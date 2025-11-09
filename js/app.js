// app.js - Main application entry point

import { loadArchive, zoomIn, zoomOut, resetZoom } from './graph.js';
import { supabase } from './supabaseClient.js';
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

// Expose some state to window for compatibility with existing wrappers
if (typeof window !== 'undefined') {
  window.pendingArtifacts = pendingArtifacts;
  window.currentSubmitterInfo = currentSubmitterInfo;
  window.getAcceptedArtifacts = function() { return acceptedArtifacts; };
}

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
  if (typeof window !== 'undefined') {
    window.currentSubmitterInfo = currentSubmitterInfo;
  }
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
  // Fetch artifacts from Supabase and populate local state
  (async () => {
    try {
      // Expose supabase on window for other modules that expect it
      window.supabase = supabase;

      const { data: acceptedRows, error: accErr } = await supabase.from('accepted_artifacts').select('*').order('timestamp', { ascending: false });
      if (accErr) console.error('Error fetching accepted_artifacts:', accErr);
      else if (acceptedRows) {
        // Map Supabase rows, convert file_url to public URL if present
        const supabaseArtifacts = acceptedRows.map((r) => ({
          id: r.id,
          title: r.title,
          tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
          timestamp: r.timestamp,
          format: r.format,
          textContent: r.text_content || null,
          description: r.description || '',
          file_url: r.file_url ? (window.getPublicUrl ? window.getPublicUrl('artifacts', r.file_url) : r.file_url) : null,
          submitter: {
            name: r.submitter_name || '',
            email: r.submitter_email || '',
            designation: r.submitter_designation || ''
          }
        }));
        // Merge pre-loaded sample artifacts with Supabase artifacts
        acceptedArtifacts = [...supabaseArtifacts, ...acceptedArtifacts];
      }

      const { data: pendingRows, error: pendErr } = await supabase.from('pending_artifacts').select('*').order('timestamp', { ascending: false });
      if (pendErr) console.error('Error fetching pending_artifacts:', pendErr);
      else if (pendingRows) {
        console.log('Supabase pendingRows:', pendingRows);
        pendingArtifacts = pendingRows.map((r) => ({
          id: r.id,
          created_at: r.created_at,
          title: r.title,
          tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
          description: r.description || '',
          format: r.format || '',
          textContent: r.text_content || '',
          visual_url: r.file_url || '',
          audio_url: '',
          submitter: {
            name: r.submitter_name || '',
            email: r.submitter_email || '',
            designation: r.submitter_designation || ''
          }
        }));
      }

      // After fetching, load the graph and update review queue
      loadArchive(acceptedArtifacts);
      // Now initialize admin so review queue is populated
      if (typeof window.initializeAdmin === 'function') {
        window.initializeAdmin();
      }
      try { loadReviewQueue(pendingArtifacts); } catch (e) { /* ignore if admin UI not present */ }
    } catch (err) {
      console.error('Error initializing data from Supabase:', err);
      // Fallback: load local accepted artifacts
      loadArchive(acceptedArtifacts);
    }
  })();
  
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

  // Header buttons
  const loginBtn = document.getElementById('globalLoginBtn');
  if (loginBtn) loginBtn.addEventListener('click', window.handleLoginClick);

  const submitBtn = document.getElementById('submitArtifactBtn');
  if (submitBtn) submitBtn.addEventListener('click', window.showUserInfoModal);
});

// Export state getters for other modules if needed
export function getPendingArtifacts() {
  return pendingArtifacts;
}

export function getAcceptedArtifacts() {
  return acceptedArtifacts;
}

// Expose getter for graph.js
window.getAcceptedArtifacts = () => acceptedArtifacts;

export function getCurrentSubmitterInfo() {
  return currentSubmitterInfo;
}

export function setCurrentSubmitterInfo(info) {
  currentSubmitterInfo = info;
}

// 1. Header Button Fix (if admin.js fix is not running)
window.handleLoginClick = handleLoginClick;


// 2. Login Modal Button Fixes
window.submitLogin = submitLogin;

// Button: onclick="closeLoginModal()"
window.closeLoginModal = closeLoginModal;


// 3. Graph Zoom Buttons Fix
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;

// Make loadArchive available globally (admin module expects window.loadArchive)
window.loadArchive = loadArchive;

// Keep window references to mutable state in sync
Object.defineProperty(window, 'pendingArtifacts', {
  get() { return pendingArtifacts; },
  configurable: true
});

Object.defineProperty(window, 'currentSubmitterInfo', {
  get() { return currentSubmitterInfo; },
  set(v) { currentSubmitterInfo = v; },
  configurable: true
});

// Provide old-style global getters for scripts that expect them
// Already exposed above, do not re-declare

Object.defineProperty(window, 'acceptedArtifacts', {
  get() { return acceptedArtifacts; },
  configurable: true
});

