// main.js - Main entry point for initialization

import { handleLoginClick } from './admin.js';
import { initializeSubmitPage } from './submit.js';
import { initializeAdmin } from './admin.js';

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
        // Ensure graph search bar is always empty on page load
        const graphSearch = document.getElementById('graphSearch');
        if (graphSearch) {
            graphSearch.value = '';
            graphSearch.removeAttribute('value');
        }
    // Expose generateTags globally for script.js
    import('./submit.js').then(mod => {
        window.generateTags = mod.generateTags;
    });
    // Ensure global state for submit page
    if (window.location.pathname.endsWith('submit.html')) {
        if (typeof window.pendingArtifacts === 'undefined') window.pendingArtifacts = [];
        if (typeof window.currentSubmitterInfo === 'undefined') window.currentSubmitterInfo = null;
    }
    // Pre-loaded sample artifacts for the graph
    window.sampleArtifacts = [
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
    // Make sure loadArchive is available globally for admin/graph
    import('./graph.js').then(mod => { window.loadArchive = mod.loadArchive; });

        // Initialize acceptedArtifacts with sample data if not present
        if (!localStorage.getItem('acceptedArtifacts')) {
            localStorage.setItem('acceptedArtifacts', JSON.stringify(window.sampleArtifacts));
        }
    // Set up login button handler to redirect to admin page
    document.getElementById('loginBtn').addEventListener('click', () => {
        window.location.href = 'admin.html';
    });
    
    // Set up submit artifact button handler
    document.getElementById('submitArtifactBtn').addEventListener('click', () => {
    window.showUserInfoModal();
    });
    
    // Initialize admin functionality
    initializeAdmin();
    
    // Initialize submit page functionality (only on the submit page)
    if (document.getElementById('fileInput') || document.getElementById('artifactTitle')) {
        try {
            initializeSubmitPage();
        } catch (e) {
            console.warn('initializeSubmitPage failed:', e);
        }
    }
});