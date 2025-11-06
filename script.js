// Sample data
const sampleArtifacts = [
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

// Initialize localStorage with sample data if empty
function initializeStorage() {
  if (!localStorage.getItem('acceptedArtifacts')) {
    localStorage.setItem('acceptedArtifacts', JSON.stringify(sampleArtifacts));
  }
  if (!localStorage.getItem('pendingArtifacts')) {
    localStorage.setItem('pendingArtifacts', JSON.stringify([]));
  }
}

// Get accepted artifacts
function getAcceptedArtifacts() {
  return JSON.parse(localStorage.getItem('acceptedArtifacts') || '[]');
}

// Get pending artifacts
function getPendingArtifacts() {
  return JSON.parse(localStorage.getItem('pendingArtifacts') || '[]');
}

// Save accepted artifacts
function saveAcceptedArtifacts(artifacts) {
  localStorage.setItem('acceptedArtifacts', JSON.stringify(artifacts));
}

// Save pending artifacts
function savePendingArtifacts(artifacts) {
  localStorage.setItem('pendingArtifacts', JSON.stringify(artifacts));
}

// Add new artifact to pending
function addPendingArtifact(artifact) {
  const pending = getPendingArtifacts();
  pending.push(artifact);
  savePendingArtifacts(pending);
}

// Accept artifact (move from pending to accepted)
function acceptArtifact(index) {
  const pending = getPendingArtifacts();
  const accepted = getAcceptedArtifacts();
  
  const artifact = pending.splice(index, 1)[0];
  accepted.push(artifact);
  
  savePendingArtifacts(pending);
  saveAcceptedArtifacts(accepted);
}

// Modal functions
function closeModal() {
  document.getElementById('artifactModal').classList.remove('active');
}

function viewArtifactDetails(index, isPending = false) {
  const artifacts = isPending ? getPendingArtifacts() : getAcceptedArtifacts();
  const artifact = artifacts[index];
  const modal = document.getElementById('artifactModal');
  const modalBody = document.getElementById('modalBody');
  
  let contentHTML = '';
  
  // Visual content
  if (artifact.visualDataURL) {
    if (artifact.visualFile && artifact.visualFile.type && artifact.visualFile.type.startsWith('image/')) {
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
  `;
  
  // Tags
  contentHTML += `
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
  
  // Audio
  if (artifact.audioDataURL) {
    contentHTML += `
      <div class="artifact-section">
        <audio controls class="artifact-audio" src="${artifact.audioDataURL}"></audio>
      </div>
    `;
  }
  
  // Submitter info
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
  
  modalBody.innerHTML = `<div class="artifact-viewer">${contentHTML}</div>`;
  modal.classList.add('active');
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('artifactModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
});

// Initialize storage on page load
initializeStorage();