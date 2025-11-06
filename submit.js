// submit.js - Handles artifact submission workflow

import { tagCategories } from './config.js';
import { switchPage } from './navigation.js';
import { fileToBase64 } from './utils.js';

// State variables
let selectedAudioFile = null;
let selectedVisualFile = null;
let selectedTags = new Set();
let currentArtifactData = null;

// Initialize submission page
export function initializeSubmitPage() {
  // Set up file input listeners
  document.getElementById('fileInput').addEventListener('change', handleVisualFileSelect);
  document.getElementById('audioInput').addEventListener('change', handleAudioSelect);
  document.getElementById('textInput').addEventListener('input', handleTextInput);
  
  // Set up artifact detail input listeners
  document.getElementById('artifactTitle').addEventListener('input', checkSubmitReady);
  document.getElementById('artifactDate').addEventListener('input', checkSubmitReady);
  document.getElementById('artifactCreator').addEventListener('input', checkSubmitReady);
  document.getElementById('artifactPurpose').addEventListener('input', checkSubmitReady);
  document.getElementById('artifactDescription').addEventListener('input', checkSubmitReady);
  
  // Set up custom tag inputs
  setupCustomTagInputs();
}

// Handle visual file (image/PDF) selection
function handleVisualFileSelect(e) {
  selectedVisualFile = e.target.files[0];
  if (selectedVisualFile) {
    document.getElementById('audioInput').value = '';
    document.getElementById('audioInput').disabled = true;
    displayFilePreview();
  } else {
    selectedVisualFile = null;
    if (!document.getElementById('textInput').value.trim()) {
      resetInputs();
    }
  }
}

// Handle audio file selection
function handleAudioSelect(e) {
  selectedAudioFile = e.target.files[0];
  if (selectedAudioFile) {
    document.getElementById('textInput').value = '';
    document.getElementById('textInput').disabled = true;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInput').disabled = true;
    selectedVisualFile = null;
    displayFilePreview();
  } else {
    selectedAudioFile = null;
    resetInputs();
  }
}

// Handle text input
function handleTextInput(e) {
  if (e.target.value.trim().length > 0) {
    document.getElementById('audioInput').value = '';
    document.getElementById('audioInput').disabled = true;
    selectedAudioFile = null;
    displayFilePreview();
  } else {
    if (!selectedVisualFile) {
      resetInputs();
    }
  }
}

// Reset all inputs to enabled state
function resetInputs() {
  document.getElementById('fileInput').disabled = false;
  document.getElementById('audioInput').disabled = false;
  document.getElementById('textInput').disabled = false;
  document.getElementById('filePreview').classList.remove('active');
}

// Display preview of selected files
function displayFilePreview() {
  const preview = document.getElementById('filePreview');
  preview.innerHTML = '';
  
  if (selectedAudioFile || selectedVisualFile) {
    preview.classList.add('active');
    
    if (selectedAudioFile && selectedAudioFile.type.startsWith('audio/')) {
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.innerHTML = `<svg class="file-icon" viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>${selectedAudioFile.name}`;
      preview.appendChild(fileName);
    }
    
    if (selectedVisualFile) {
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      let iconPath = '';
      
      if (selectedVisualFile.type.startsWith('image/')) {
        iconPath = `<svg class="file-icon" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
      } else if (selectedVisualFile.type === 'application/pdf') {
        iconPath = `<svg class="file-icon" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 2.18 13.29 1.5 12 1.5S9.6 2.18 9.18 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H8V9h6v8zm-2-6h-2V7h2v4z"/></svg>`;
      }
      
      fileName.innerHTML = `${iconPath}${selectedVisualFile.name}`;
      preview.appendChild(fileName);
      
      if (selectedVisualFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          preview.appendChild(img);
        };
        reader.readAsDataURL(selectedVisualFile);
      } else if (selectedVisualFile.type === 'application/pdf') {
        const pdfEmbed = document.createElement('iframe');
        pdfEmbed.src = URL.createObjectURL(selectedVisualFile);
        pdfEmbed.className = 'artifact-pdf';
        pdfEmbed.title = 'PDF Preview';
        preview.appendChild(pdfEmbed);
      }
    }
  } else {
    preview.classList.remove('active');
  }
}

// Generate AI-suggested tags
export async function generateTags() {
  const textInput = document.getElementById('textInput').value.trim();
  const loadingMsg = document.getElementById('loadingMsg');
  const errorMsg = document.getElementById('errorMsg');
  const generateBtn = document.getElementById('generateBtn');
  const apiKey = 'AIzaSyDBFw_WgGbngy_Pw5lC2xhOpy7A2veCSqk';
  
  errorMsg.style.display = 'none';
  selectedTags.clear();
  document.getElementById('resultsSection').classList.remove('active');
  document.getElementById('selectedSummary').classList.remove('active');
  document.getElementById('descriptionSection').classList.remove('active');
  document.getElementById('submitSection').classList.remove('active');
  
  if (!selectedAudioFile && !selectedVisualFile && !textInput) {
    errorMsg.textContent = 'Please upload a file or enter a description.';
    errorMsg.style.display = 'block';
    return;
  }
  
  loadingMsg.style.display = 'block';
  generateBtn.disabled = true;
  
  try {
    const parts = [];
    let prompt = `Analyze the provided content and suggest relevant tags. Consider themes, purpose, and context. Return 5-10 specific, relevant tags as a comma-separated list. Focus on: social justice themes, media format, intended use, and circulation context.`;
    
    if (selectedAudioFile && selectedAudioFile.type.startsWith('audio/')) {
      const base64Data = await fileToBase64(selectedAudioFile);
      parts.push({
        inlineData: {
          mimeType: selectedAudioFile.type,
          data: base64Data
        }
      });
      parts.push({ text: `Analyze this audio file and ${prompt}` });
    } else {
      if (selectedVisualFile) {
        const base64Data = await fileToBase64(selectedVisualFile);
        parts.push({
          inlineData: {
            mimeType: selectedVisualFile.type,
            data: base64Data
          }
        });
      }
      if (textInput && selectedVisualFile) {
        parts.push({ text: `${prompt}\n\nAnalyze both the provided visual (image/pdf) and this text content together: ${textInput}` });
      } else if (textInput) {
        parts.push({ text: `${prompt}\n\nContent: ${textInput}` });
      } else if (selectedVisualFile) {
        parts.push({ text: `Analyze the provided visual content (image/pdf) and ${prompt}` });
      }
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }]
      })
    });
    
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`API request failed: ${response.statusText} - ${JSON.stringify(errorResponse)}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tags = generatedText
      .split(/,|\n/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length < 50);
    
    displayTags(tags);
  } catch (error) {
    errorMsg.textContent = `Error: ${error.message}`;
    errorMsg.style.display = 'block';
  } finally {
    loadingMsg.style.display = 'none';
    generateBtn.disabled = false;
  }
}

// Display tags in categories
function displayTags(aiSuggestedTags) {
  const resultsSection = document.getElementById('resultsSection');
  
  Object.entries(tagCategories).forEach(([category, tags]) => {
    const container = document.getElementById(`${category}Tags`);
    container.innerHTML = '';
    tags.forEach(tag => {
      const tagEl = createTagElement(tag, false);
      container.appendChild(tagEl);
    });
  });
  
  if (aiSuggestedTags && aiSuggestedTags.length > 0) {
    aiSuggestedTags.forEach(tag => {
      const category = determineCategory(tag);
      const container = document.getElementById(`${category}Tags`);
      const exists = Array.from(container.children).some(child =>
        child.textContent.replace('✨', '').trim().toLowerCase() === tag.toLowerCase()
      );
      if (!exists) {
        const tagEl = createTagElement(tag, true);
        container.appendChild(tagEl);
      }
    });
  }
  
  resultsSection.classList.add('active');
}

// Create a tag element
function createTagElement(tagText, isAiSuggested) {
  const tagEl = document.createElement('span');
  tagEl.className = 'tag';
  if (isAiSuggested) {
    tagEl.classList.add('ai-suggested');
  }
  tagEl.textContent = tagText;
  tagEl.onclick = () => toggleTag(tagEl, tagText);
  return tagEl;
}

// Toggle tag selection
function toggleTag(element, tagText) {
  element.classList.toggle('selected');
  if (element.classList.contains('selected')) {
    selectedTags.add(tagText);
  } else {
    selectedTags.delete(tagText);
  }
  console.log('Selected tags:', Array.from(selectedTags));
  console.log('Selected tags count:', selectedTags.size);
  updateSelectedSummary();
  checkSubmitReady();
}

// Update selected tags summary
function updateSelectedSummary() {
  const summary = document.getElementById('selectedSummary');
  const count = document.getElementById('selectedCount');
  const descSection = document.getElementById('descriptionSection');
  
  count.textContent = selectedTags.size;
  
  if (selectedTags.size > 0) {
    summary.classList.add('active');
    descSection.classList.add('active');
  } else {
    summary.classList.remove('active');
    descSection.classList.remove('active');
    document.getElementById('submitSection').classList.remove('active');
  }
}

// Check if ready to submit
function checkSubmitReady() {
  const title = document.getElementById('artifactTitle').value.trim();
  const date = document.getElementById('artifactDate').value.trim();
  const creator = document.getElementById('artifactCreator').value.trim();
  const purpose = document.getElementById('artifactPurpose').value.trim();
  const description = document.getElementById('artifactDescription').value.trim();
  const submitSection = document.getElementById('submitSection');
  
  console.log('Check submit - Tags:', selectedTags.size, 'Title:', !!title, 'Date:', !!date, 'Creator:', !!creator, 'Purpose:', !!purpose, 'Desc:', !!description);
  
  if (selectedTags.size > 0 && title && date && creator && purpose && description) {
    console.log('SHOWING SUBMIT BUTTON');
    submitSection.classList.add('active');
  } else {
    console.log('HIDING SUBMIT BUTTON');
    submitSection.classList.remove('active');
  }
}

// Determine which category a tag belongs to
function determineCategory(tag) {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes('audio') || tagLower.includes('image') || tagLower.includes('text') ||
      tagLower.includes('video') || tagLower.includes('media') || tagLower.includes('document') || tagLower.includes('pdf')) {
    return 'form';
  } else if (tagLower.includes('advocacy') || tagLower.includes('education') ||
             tagLower.includes('protest') || tagLower.includes('mobiliz')) {
    return 'use';
  } else if (tagLower.includes('community') || tagLower.includes('local') ||
             tagLower.includes('digital') || tagLower.includes('circul')) {
    return 'context';
  } else {
    return 'content';
  }
}

// Add custom tag
export function addCustomTag(category) {
  const inputId = `custom${category}Tag`;
  const input = document.getElementById(inputId);
  const tagText = input.value.trim();
  
  if (tagText) {
    const container = document.getElementById(`${category}Tags`);
    const exists = Array.from(container.children).some(child =>
      child.textContent.replace('✨', '').trim().toLowerCase() === tagText.toLowerCase()
    );
    
    if (!exists) {
      const tagEl = createTagElement(tagText, false);
      tagEl.style.borderColor = '#ff9800';
      container.appendChild(tagEl);
      input.value = '';
      
      // Auto-select the newly added custom tag
      tagEl.classList.add('selected');
      selectedTags.add(tagText);
      updateSelectedSummary();
      checkSubmitReady();
    } else {
      alert('This tag already exists in this category!');
    }
  }
}

// Set up custom tag inputs
function setupCustomTagInputs() {
  document.querySelectorAll('.custom-tag-input input').forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const category = this.id.replace('custom', '').replace('Tag', '').toLowerCase();
        addCustomTag(category);
      }
    });
  });
}

// Submit artifact
export function submitArtifact(currentSubmitterInfo, pendingArtifacts) {
  const title = document.getElementById('artifactTitle').value.trim();
  const date = document.getElementById('artifactDate').value.trim();
  const creator = document.getElementById('artifactCreator').value.trim();
  const purpose = document.getElementById('artifactPurpose').value.trim();
  const description = document.getElementById('artifactDescription').value.trim();
  const url = document.getElementById('artifactURL').value.trim();
  const tagsArray = Array.from(selectedTags);
  const textContent = document.getElementById('textInput').value.trim();
  
  // Combine all details into one description text
  let combinedDescription = `Title: ${title}\n\n`;
  combinedDescription += `Date Created: ${date}\n\n`;
  combinedDescription += `Created By: ${creator}\n\n`;
  combinedDescription += `Purpose: ${purpose}\n\n`;
  combinedDescription += `Description: ${description}`;
  if (url) {
    combinedDescription += `\n\nURL: ${url}`;
  }
  
  // Determine format
  let format = "text";
  if (selectedAudioFile) {
    format = "audio";
  } else if (selectedVisualFile) {
    if (selectedVisualFile.type.startsWith('image/')) {
      format = "image";
    } else if (selectedVisualFile.type === 'application/pdf') {
      format = "pdf";
    }
  }
  
  currentArtifactData = {
    tags: tagsArray,
    title: title,
    description: combinedDescription,
    submitter: currentSubmitterInfo,
    timestamp: new Date().toISOString(),
    format: format,
    textContent: textContent,
    visualFile: selectedVisualFile,
    audioFile: selectedAudioFile,
    visualDataURL: null,
    audioDataURL: null
  };
  
  const promises = [];
  
  if (selectedVisualFile) {
    promises.push(new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = function(e) {
        currentArtifactData.visualDataURL = e.target.result;
        resolve();
      };
      reader.readAsDataURL(selectedVisualFile);
    }));
  }
  
  if (selectedAudioFile) {
    promises.push(new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = function(e) {
        currentArtifactData.audioDataURL = e.target.result;
        resolve();
      };
      reader.readAsDataURL(selectedAudioFile);
    }));
  }
  
  Promise.all(promises).then(() => {
    finalizeSubmission(pendingArtifacts);
  }).catch(error => {
    console.error("Error reading file:", error);
    alert("An error occurred while preparing the files for submission.");
  });
}

// Finalize submission
function finalizeSubmission(pendingArtifacts) {
  pendingArtifacts.push(currentArtifactData);
  alert('Artifact submitted successfully! It is now pending review.');
  resetForm();
}

// Reset form after submission
function resetForm() {
  selectedAudioFile = null;
  selectedVisualFile = null;
  selectedTags.clear();
  document.getElementById('fileInput').value = '';
  document.getElementById('audioInput').value = '';
  document.getElementById('textInput').value = '';
  document.getElementById('artifactTitle').value = '';
  document.getElementById('artifactDate').value = '';
  document.getElementById('artifactCreator').value = '';
  document.getElementById('artifactPurpose').value = '';
  document.getElementById('artifactDescription').value = '';
  document.getElementById('artifactURL').value = '';
  document.getElementById('resultsSection').classList.remove('active');
  document.getElementById('filePreview').classList.remove('active');
  document.getElementById('selectedSummary').classList.remove('active');
  document.getElementById('descriptionSection').classList.remove('active');
  document.getElementById('submitSection').classList.remove('active');
  resetInputs();
}

// Export getters for state
export function getSelectedFiles() {
  return {
    audio: selectedAudioFile,
    visual: selectedVisualFile
  };
}

export function getSelectedTags() {
  return Array.from(selectedTags);
}