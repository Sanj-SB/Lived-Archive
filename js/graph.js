// Persona-to-tags mapping (Content, Form, Use Case, Context)
window.personaTagsMap = {
  'Advocate': [
    // Content
    'Social Justice', 'Caste & Marginalization', 'Gender & Sexuality', 'Resistance & Protest',
    // Form
    'Text', 'Social Media Post', 'Video (Documentary)',
    // Use Case
    'Awareness / Advocacy', 'Community Mobilization', 'Protest Documentation',
    // Context
    'Activist Circles', 'Grassroots Collective', 'Digital Communities'
  ],
  'Artist': [
    // Content
    'Culture & Heritage', 'Gender & Sexuality', 'Humor & Satire', 'Everyday Life & Small Joys',
    // Form
    'Artwork / Illustration', 'Theatre Script / Performance', 'Mixed Media / Collage',
    // Use Case
    'Artistic Practice', 'Cultural Expression', 'Social Bonding Activity',
    // Context
    'Pop-Up or Temporary Space', 'Club or Hobby Group', 'Independent Publication'
  ],
  'Researcher': [
    // Content
    'Social Justice', 'Culture & Heritage', 'Migration & Displacement', "Labor & Workers' Rights",
    // Form
    'Text (Essay, Annotation)', 'Photograph', 'Physical Artifact',
    // Use Case
    'Knowledge Sharing', 'Memory & Commemoration', 'Educational Resource',
    // Context
    'Online Repository', 'Institutional Archive', 'Independent Publication'
  ],
  'Educator': [
    // Content
    'Education & Literacy', 'Health & Wellbeing', 'Everyday Life & Small Joys',
    // Form
    'Text (Essay, Resource)', 'Audio Recording', 'Print Publication',
    // Use Case
    'Educational Resource', 'Everyday Learning', 'Knowledge Sharing',
    // Context
    'Student Circles', 'Local Community Distribution', 'Institutional Archive'
  ],
  'Curious Explorer': [] // No filter
};

// Lightweight persona selection modal
function showPersonaModal() {
  // Prevent duplicate modals
  if (document.getElementById('personaModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'personaModalOverlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';

  const modal = document.createElement('div');
  modal.style.background = '#fff';
  modal.style.borderRadius = '10px';
  modal.style.padding = '20px';
  modal.style.width = 'min(560px, 92vw)';
  modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';

  const title = document.createElement('h2');
  title.textContent = 'Choose a persona';
  title.style.margin = '0 0 12px 0';

  const subtitle = document.createElement('p');
  subtitle.textContent = 'This helps tailor the graph to what you care about.';
  subtitle.style.margin = '0 0 16px 0';
  subtitle.style.color = '#555';

  const options = ['Curious Explorer','Advocate', 'Artist', 'Researcher', 'Educator'];
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
  grid.style.gap = '10px';

  options.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = p;
    btn.style.padding = '10px 12px';
    btn.style.borderRadius = '20px';
    btn.style.border = '1px solid #514575';
    btn.style.background = '#fff';
    btn.style.color = '#514575'; // base text color
    btn.style.cursor = 'pointer';
    btn.onmouseenter = () => {
      btn.style.background = '#514575';
      btn.style.color = '#fff';          // hover text color
    };
    btn.onmouseleave = () => {
      btn.style.background = '#fff';
      btn.style.color = '#514575';       // restore base text color
    };
    btn.onclick = () => {
      window.selectedPersona = p;
      localStorage.setItem('selectedPersona', p);
      window.personaTags = window.personaTagsMap[p] || [];
      // If radios exist, sync them
      const radio = document.querySelector(`input[name="personaChoice"][value="${p}"]`);
      if (radio) radio.checked = true;
      // If sidebar persona buttons exist, sync their visual state
      document.querySelectorAll('button[data-persona]').forEach(b => {
        const isSelected = b.dataset.persona === p;
        b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        b.style.background = isSelected ? '#514575' : '#fff';
        b.style.color = isSelected ? '#fff' : '#514575';
      });
      if (window.updateGraphFilters) window.updateGraphFilters();
      if (window.updatePersonaBadge) window.updatePersonaBadge();
      document.body.removeChild(overlay);
    };
    grid.appendChild(btn);
  });

  modal.appendChild(title);
  modal.appendChild(subtitle);
  modal.appendChild(grid);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Graph variables
let simulation = null;
let svg = null;
let g = null;
let zoom = null;
let selectedCategories = new Set();
let currentTagFilter = '';
let currentSearchTerm = '';
let isTimelineView = false;
let currentNodes = [];
let currentLinks = [];
let nodeElements = null;
let linkElements = null;
let dateLabels = null;

// Convert artifact to node
function artifactToNode(artifact, id) {
  const categories = new Set();
  
  artifact.tags.forEach(tag => {
    if ([
      'Social Justice', 'Caste & Marginalization', "Labor & Workers' Rights", 'Gender & Sexuality',
      'Migration & Displacement', 'Awareness / Advocacy', 'Local Talent Showcase', 'Resistance & Protest'
    ].some(c => tag.includes(c))) {
      categories.add('Social Justice & Rights');
    }
    if ([
      'Education & Literacy', 'Health & Wellbeing', 'Everyday Learning', 'Personal Reflection',
      'Knowledge Sharing', 'Social Bonding Activity'
    ].some(c => tag.includes(c))) {
      categories.add('Education & Wellbeing');
    }
    if ([
      'Politics & Policy', 'Community Mobilization', 'Resistance & Protest', 'Protest Documentation',
      'Alternative News / Reporting', 'Grassroots Collective', 'Activist Circles'
    ].some(c => tag.includes(c))) {
      categories.add('Politics & Collective Action');
    }
    if ([
      'Culture & Heritage', 'Storytelling / Oral Tradition', 'Music & Folk Traditions',
      'Theatre & Performance', 'Artistic Practice', 'Festivals & Celebrations', 'Humor & Satire'
    ].some(c => tag.includes(c))) {
      categories.add('Culture, Heritage & Expression');
    }
    if ([
      'Community Organizing', 'Urban Life & Infrastructure', 'Everyday Life & Small Joys',
      'Food & Shared Spaces', 'Neighborhood Gathering', 'Friends & Family Networks'
    ].some(c => tag.includes(c))) {
      categories.add('Community & Daily Life');
    }
    if ([
      'Media & Representation', 'Memory & Commemoration', 'Archival / Documentation',
      'Independent Publication', 'Online Repository', 'Informal Circulation'
    ].some(c => tag.includes(c))) {
      categories.add('Media, Memory & Archiving');
    }
  });
  
  if (categories.size === 0) categories.add('Other');
  
  // Parse the date_created field (YYYY-MM-DD format from date input)
  let creationDate = new Date();
  let displayDate = 'Unknown';
  
  if (artifact.date_created) {
    creationDate = new Date(artifact.date_created);
    displayDate = creationDate.toLocaleDateString();
  } else if (artifact.timestamp) {
    creationDate = new Date(artifact.timestamp);
    displayDate = creationDate.toLocaleDateString();
  }
  
  return {
    id: id,
    label: artifact.title || 'Untitled',
    categories: Array.from(categories),
    tags: artifact.tags,
    created: displayDate,
    timestamp: creationDate,
    artifact: artifact
  };
}

// Generate links between nodes
function generateLinks(nodes) {
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      // Link if they share categories
      const sharedCategories = node1.categories.filter(c => node2.categories.includes(c));
      if (sharedCategories.length > 0) {
        links.push({ source: node1.id, target: node2.id });
        continue;
      }
      
      // Link if they share tags
      const sharedTags = node1.tags.filter(t => node2.tags.includes(t));
      if (sharedTags.length >= 2) {
        links.push({ source: node1.id, target: node2.id });
      }
    }
  }
  return links;
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    'Social Justice & Rights': '#e74c3c',
    'Education & Wellbeing': '#3498db',
    'Politics & Collective Action': '#e67e22',
    'Culture, Heritage & Expression': '#9b59b6',
    'Community & Daily Life': '#2ecc71',
    'Media, Memory & Archiving': '#f39c12',
    'Other': '#95a5a6'
  };
  return colors[category] || colors['Other'];
}

// Get format icon
function getFormatIcon(artifact) {
  if (artifact.format === 'audio') return '🎵 Audio';
  if (artifact.format === 'image') return '🖼️ Image';
  if (artifact.format === 'pdf') return '📄 PDF';
  if (artifact.format === 'text' || artifact.textContent) return '📝 Text';
  return '📋 Document';
}

// Initialize graph
function initializeGraph(nodes, links) {
  const container = document.getElementById('graphView');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Clear existing
  d3.select('#networkGraph').selectAll('*').remove();
  
  svg = d3.select('#networkGraph')
    .attr('width', width)
    .attr('height', height);
  
  // Add background color (matches page background)
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#f5f5f0');
  
  // Add zoom behavior
  zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  
  svg.call(zoom);
  
  g = svg.append('g');
  
  // Create force simulation
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(160).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-40))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))
    .alphaDecay(0.01);

  // Draw links
  linkElements = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link');

  // Draw nodes with fade-in
  nodeElements = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node')
    .attr('r', 20)
    .attr('fill', d => getCategoryColor(d.categories[0]))
    .attr('opacity', 0)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)
    .on('click', (event, d) => {
      const acceptedArtifacts = getAcceptedArtifacts();
      const index = acceptedArtifacts.findIndex(a => a.title === d.label);
      if (index !== -1) viewArtifactDetails(index, false);
    });

  nodeElements.transition().duration(400).attr('opacity', 1);

  // Create date labels (hidden by default)
  dateLabels = g.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('class', 'node-date-label')
    .text(d => d.created)
    .attr('opacity', 0);

  // Store references for timeline toggle
  currentNodes = nodes;
  currentLinks = links;

  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation.alpha(1).restart();

  simulation.on('tick', () => {
    // Only update positions if not in timeline view
    if (!isTimelineView) {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      dateLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y + 35);
    }
  });
  
  // Drag functions
  function dragstarted(event, d) {
    // Don't allow dragging in timeline view
    if (isTimelineView) return;
    
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this).transition().duration(150).attr('r', 25).attr('stroke-width', 5).style('stroke', '#4a5268');
  }

  function dragged(event, d) {
    // Don't allow dragging in timeline view
    if (isTimelineView) return;
    
    d.fx = event.x;
    d.fy = event.y;
    showTooltip(event, d);
  }

  function dragended(event, d) {
    // Don't allow dragging in timeline view
    if (isTimelineView) return;
    
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    d3.select(this).transition().duration(150).attr('r', 20).attr('stroke-width', 3).style('stroke', '#fff');
    hideTooltip();
  }
}

// Node hover functions
function nodeMouseOver(event, d) {
  d3.select(this)
    .transition()
    .duration(150)
    .attr('r', 25)
    .attr('stroke-width', 5)
    .style('stroke', '#4a5268');
  showTooltip(event, d);
}

function nodeMouseOut(event, d) {
  d3.select(this)
    .transition()
    .duration(150)
    .attr('r', 20)
    .attr('stroke-width', 3)
    .style('stroke', '#fff');
  hideTooltip();
}

// Tooltip functions
function showTooltip(event, d) {
  const tooltip = document.getElementById('nodeTooltip');
  const formatIcon = getFormatIcon(d.artifact);
  
  tooltip.innerHTML = `
    <h4>${d.label}</h4>
    <div class="tooltip-date">${d.created}</div>
    <div class="tooltip-format">${formatIcon}</div>
    <div class="tooltip-tags">
      ${d.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  `;
  
  const container = document.getElementById('graphView');
  const bounds = container.getBoundingClientRect();
  
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  
  tooltip.style.left = (x + 15) + 'px';
  tooltip.style.top = (y + 15) + 'px';
  
  tooltip.classList.add('active');
}

function hideTooltip() {
  document.getElementById('nodeTooltip').classList.remove('active');
}

// Timeline layout function
function applyTimelineLayout() {
  if (!nodeElements || !simulation) return;
  
  const container = document.getElementById('graphView');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Sort nodes by timestamp
  const sortedNodes = [...currentNodes].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate positions
  const padding = 100;
  const yPos = height / 2;
  const spacing = (width - 2 * padding) / Math.max(sortedNodes.length - 1, 1);
  
  // Stop the simulation completely
  simulation.stop();
  simulation.alpha(0);
  
  // Position nodes along timeline with fixed positions
  sortedNodes.forEach((node, i) => {
    node.fx = padding + i * spacing;
    node.fy = yPos;
    node.x = node.fx;
    node.y = node.fy;
  });
  
  // Update positions immediately without transition for links
  linkElements
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  
  // Animate nodes to new positions
  nodeElements
    .transition()
    .duration(1500)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
  
  // Show date labels
  dateLabels
    .attr('x', d => d.x)
    .attr('y', d => d.y + 35)
    .transition()
    .duration(150)
    .attr('opacity', 1);
}

// Restore force-directed layout
function applyForceLayout() {
  if (!nodeElements || !simulation) return;
  
  // Remove fixed positions
  currentNodes.forEach(node => {
    node.fx = null;
    node.fy = null;
  });
  
  // Hide date labels
  dateLabels
    .transition()
    .duration(150)
    .attr('opacity', 0);
  
  // Restart simulation with fresh alpha
  simulation.alpha(0.5).restart();
}

// Toggle between timeline and force layout
window.toggleTimeline = function() {
  const toggleBtn = document.getElementById('timelineToggle');
  isTimelineView = !isTimelineView;
  
  if (isTimelineView) {
    toggleBtn.classList.add('active');
    toggleBtn.textContent = '🔀 Network View';
    applyTimelineLayout();
  } else {
    toggleBtn.classList.remove('active');
    toggleBtn.textContent = '📅 Timeline View';
    applyForceLayout();
  }
}

// Setup filters
function setupFilters(nodes) {
  // Persona radios (single-select) styled like category list
  const personaList = ['Curious Explorer', 'Advocate', 'Artist', 'Researcher', 'Educator'];
  const personaTagsMap = window.personaTagsMap || {};
  let personaFilterDiv = document.getElementById('personaFilter');
  if (!personaFilterDiv) {
    personaFilterDiv = document.createElement('div');
    personaFilterDiv.id = 'personaFilter';
    personaFilterDiv.style.marginBottom = '18px';
    // Insert into right-side controls above categories
    const rightSideControls = document.getElementById('rightSideControls');
    const categoryContainer = document.getElementById('categoryFilter');
    if (rightSideControls && categoryContainer) {
      rightSideControls.insertBefore(personaFilterDiv, categoryContainer);
    } else if (rightSideControls) {
      rightSideControls.appendChild(personaFilterDiv);
    }
  }
  personaFilterDiv.innerHTML = '';
  // Create a collapsible header for Personas
  let personaHeader = document.getElementById('personaHeader');
  if (!personaHeader) {
    personaHeader = document.createElement('div');
    personaHeader.id = 'personaHeader';
    personaHeader.style.display = 'flex';
    personaHeader.style.alignItems = 'center';
    personaHeader.style.justifyContent = 'space-between';
    personaHeader.style.cursor = 'pointer';
    personaHeader.style.fontWeight = 'bold';
    personaHeader.style.margin = '8px 0';
    personaHeader.style.padding = '6px 4px';
    const label = document.createElement('span');
    label.textContent = 'Personas';
    const chevron = document.createElement('span');
    chevron.id = 'personaChevron';
    chevron.textContent = '▸';
    personaHeader.appendChild(label);
    personaHeader.appendChild(chevron);
    // Insert header just before persona filter div
    if (personaFilterDiv.parentNode) {
      personaFilterDiv.parentNode.insertBefore(personaHeader, personaFilterDiv);
    }
  }
  // Collapsed by default
  personaFilterDiv.style.display = 'none';
  personaHeader.onclick = () => {
    const isHidden = personaFilterDiv.style.display === 'none';
    personaFilterDiv.style.display = isHidden ? 'block' : 'none';
    const chev = document.getElementById('personaChevron');
    if (chev) chev.textContent = isHidden ? '▾' : '▸';
  };

  // Initialize selected persona from storage or default
  const savedPersona = localStorage.getItem('selectedPersona');
  if (!window.selectedPersona) window.selectedPersona = savedPersona || 'Curious Explorer';
  window.personaTags = personaTagsMap[window.selectedPersona] || [];

  // Render pill-style persona buttons similar to the modal
  const personaGrid = document.createElement('div');
  personaGrid.style.display = 'grid';
  personaGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
  personaGrid.style.gap = '10px';

  function stylePersonaButton(btn, selected) {
    btn.style.padding = '10px 12px';
    btn.style.borderRadius = '20px';
    btn.style.border = '1px solid #514575';
    btn.style.background = selected ? '#514575' : '#fff';
    btn.style.color = selected ? '#fff' : '#514575';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background 0.18s ease, color 0.18s ease';
    btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
  }

  personaList.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.persona = p;
    btn.textContent = p;
    stylePersonaButton(btn, p === window.selectedPersona);
    btn.onmouseenter = () => {
      btn.style.background = '#514575';
      btn.style.color = '#fff';
    };
    btn.onmouseleave = () => {
      const isSelected = (p === window.selectedPersona);
      btn.style.background = isSelected ? '#514575' : '#fff';
      btn.style.color = isSelected ? '#fff' : '#514575';
    };
    btn.onclick = () => {
      window.selectedPersona = p;
      localStorage.setItem('selectedPersona', p);
      window.personaTags = personaTagsMap[p] || [];
      // Update styles for all persona buttons in this grid
      personaFilterDiv.querySelectorAll('button[data-persona]').forEach(b => {
        const selected = b.dataset.persona === window.selectedPersona;
        stylePersonaButton(b, selected);
      });
      if (window.updateGraphFilters) window.updateGraphFilters();
    };
    personaGrid.appendChild(btn);
  });

  personaFilterDiv.appendChild(personaGrid);

  // Use fixed category list for toggles
  const allCategories = [
    'Social Justice & Rights',
    'Education & Wellbeing',
    'Politics & Collective Action',
    'Culture, Heritage & Expression',
    'Community & Daily Life',
    'Media, Memory & Archiving'
  ];
  selectedCategories = new Set(allCategories);

  const categoryFilter = document.getElementById('categoryFilter');
  // Toolbar: reset filters (persona badge removed)
  let toolbar = document.getElementById('filtersToolbar');
  const makeResetBtn = () => {
    const btn = document.createElement('button');
    btn.id = 'resetFiltersBtn';
    btn.textContent = 'Reset Filters';
    btn.style.padding = '6px 10px';
    btn.style.borderRadius = '8px';
    btn.style.border = '1px solid #e2e8f0';
    btn.style.background = '#fff';
    btn.style.cursor = 'pointer';
    btn.onmouseenter = () => btn.style.background = '#f8fafc';
    btn.onmouseleave = () => btn.style.background = '#fff';
    return btn;
  };
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'filtersToolbar';
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.style.gap = '8px';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.margin = '8px 0 10px 0';
    const resetBtn = makeResetBtn();
    toolbar.appendChild(resetBtn);
    // Place toolbar at the top of the right-side controls
    const personaHeaderEl = document.getElementById('personaHeader');
    const rightSideControls = document.getElementById('rightSideControls');
    if (personaHeaderEl && personaHeaderEl.parentNode) {
      personaHeaderEl.parentNode.insertBefore(toolbar, personaHeaderEl);
    } else if (rightSideControls && rightSideControls.firstChild) {
      rightSideControls.insertBefore(toolbar, rightSideControls.firstChild);
    } else if (rightSideControls) {
      rightSideControls.appendChild(toolbar);
    }
  }

  // Wire reset button behavior
  const resetBtnEl = document.getElementById('resetFiltersBtn');
  if (resetBtnEl) {
    resetBtnEl.onclick = () => {
      // Persona -> Curious Explorer (no filter)
      window.selectedPersona = 'Curious Explorer';
      localStorage.setItem('selectedPersona', 'Curious Explorer');
      window.personaTags = [];
      // Sync radios if present
      document.querySelectorAll('input[name="personaChoice"]').forEach(r => {
        r.checked = (r.value === 'Curious Explorer');
      });
      // Sync sidebar persona buttons if present
      personaFilterDiv.querySelectorAll('button[data-persona]').forEach(b => {
        const selected = b.dataset.persona === 'Curious Explorer';
        b.setAttribute('aria-pressed', selected ? 'true' : 'false');
        b.style.background = selected ? '#514575' : '#fff';
        b.style.color = selected ? '#fff' : '#514575';
      });
  // Badge removed; no persona badge update needed
      // Categories -> all selected
      selectedCategories = new Set(allCategories);
      if (categoryFilter) {
        categoryFilter.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
      }
      // Clear tag filter and search
      const tagInput = document.getElementById('tagFilterInput');
      if (tagInput) tagInput.value = '';
      currentTagFilter = '';
      const searchInput = document.getElementById('graphSearch');
      if (searchInput) searchInput.value = '';
      currentSearchTerm = '';
      // Apply
      if (window.updateGraphFilters) window.updateGraphFilters();
    };
  }
  // Create a collapsible header for Categories placed right before the categoryFilter
  let categoriesHeader = document.getElementById('categoriesHeaderJS');
  if (!categoriesHeader && categoryFilter && categoryFilter.parentNode) {
    categoriesHeader = document.createElement('div');
    categoriesHeader.id = 'categoriesHeaderJS';
    categoriesHeader.style.display = 'flex';
    categoriesHeader.style.alignItems = 'center';
    categoriesHeader.style.justifyContent = 'space-between';
    categoriesHeader.style.cursor = 'pointer';
    categoriesHeader.style.fontWeight = 'normal';
    categoriesHeader.style.fontFamily = 'Roboto, sans-serif';
    categoriesHeader.style.margin = '12px 0 6px 0';
    categoriesHeader.style.padding = '6px 4px';
    const label = document.createElement('span');
    label.textContent = 'Categories';
    const chevron = document.createElement('span');
    chevron.id = 'categoriesChevron';
    chevron.textContent = '▸';
    categoriesHeader.appendChild(label);
    categoriesHeader.appendChild(chevron);
    categoryFilter.parentNode.insertBefore(categoriesHeader, categoryFilter);
    // Collapsed by default
    categoryFilter.style.display = 'none';
    categoriesHeader.onclick = () => {
      const isHidden = categoryFilter.style.display === 'none';
      categoryFilter.style.display = isHidden ? 'block' : 'none';
      const chev = document.getElementById('categoriesChevron');
      if (chev) chev.textContent = isHidden ? '▾' : '▸';
    };
  }
  categoryFilter.innerHTML = '';

  allCategories.forEach(cat => {
    // Custom checkbox with SVG icons
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '6px';
    wrapper.style.cursor = 'pointer';
    wrapper.setAttribute('role', 'checkbox');
    wrapper.setAttribute('aria-checked', selectedCategories.has(cat) ? 'true' : 'false');
    wrapper.setAttribute('tabindex', '0');

    const icon = document.createElement('img');
    icon.src = selectedCategories.has(cat) ? 'assets/checkbox-filled.svg' : 'assets/checkbox-unfilled.svg';
    icon.alt = selectedCategories.has(cat) ? 'Selected' : 'Not selected';
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.marginRight = '8px';

    const dot = document.createElement('span');
    dot.textContent = '●';
    dot.style.color = getCategoryColor(cat);
    dot.style.fontWeight = 'bold';
    dot.style.marginRight = '6px';

    const labelText = document.createElement('span');
    labelText.textContent = cat;

    function toggleCategory() {
      if (selectedCategories.has(cat)) {
        selectedCategories.delete(cat);
      } else {
        selectedCategories.add(cat);
      }
      const isSelected = selectedCategories.has(cat);
      icon.src = isSelected ? 'assets/checkbox-filled.svg' : 'assets/checkbox-unfilled.svg';
      icon.alt = isSelected ? 'Selected' : 'Not selected';
      wrapper.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      if (window.updateGraphFilters) window.updateGraphFilters();
    }

    wrapper.onclick = toggleCategory;
    wrapper.onkeydown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleCategory();
      }
    };

    wrapper.appendChild(icon);
    wrapper.appendChild(dot);
    wrapper.appendChild(labelText);
    categoryFilter.appendChild(wrapper);
  });

  // Tag filter
  document.getElementById('tagFilterInput').addEventListener('input', (e) => {
    currentTagFilter = e.target.value.toLowerCase();
    updateGraphFilters();
  });

  // Search
  document.getElementById('graphSearch').addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.toLowerCase();
    updateGraphFilters();
  });
}

// Filter graph by category
window.filterGraph = function(category) {
  if (selectedCategories.has(category)) {
    selectedCategories.delete(category);
  } else {
    selectedCategories.add(category);
  }
  updateGraphFilters();
}

// Update graph filters
function updateGraphFilters() {
  const nodes = d3.selectAll('.node');
  const links = d3.selectAll('.link');
  const personaTags = window.personaTags || [];
  const selectedPersona = window.selectedPersona;
  function isNodeVisible(d) {
    // Persona filter
    let personaMatch = true;
    if (selectedPersona && selectedPersona !== 'Curious Explorer' && personaTags.length > 0) {
      personaMatch = d.tags.some(tag => personaTags.some(ptag => tag.includes(ptag)));
    }
    // Category, tag, search filters
    const matchesCategory = d.categories.some(c => selectedCategories.has(c));
    const matchesTagFilter = !currentTagFilter || d.tags.some(t => t.toLowerCase().includes(currentTagFilter));
    const matchesSearchLabel = d.label.toLowerCase().includes(currentSearchTerm);
    const matchesSearchTags = d.tags.some(t => t.toLowerCase().includes(currentSearchTerm));
    const matchesSearch = !currentSearchTerm || matchesSearchLabel || matchesSearchTags;
    return personaMatch && matchesCategory && matchesTagFilter && matchesSearch;
  }
  nodes.style('opacity', function(d) {
    return isNodeVisible(d) ? 1 : 0.1;
  });
  links.style('opacity', function(d) {
    const sourceVisible = isNodeVisible(d.source);
    const targetVisible = isNodeVisible(d.target);
    return (sourceVisible && targetVisible) ? 0.3 : 0.05;
  });
}
window.updateGraphFilters = updateGraphFilters;

// Zoom controls
export function zoomIn() {
  if (svg && zoom) svg.transition().call(zoom.scaleBy, 1.3);
}

export function zoomOut() {
  if (svg && zoom) svg.transition().call(zoom.scaleBy, 0.7);
}

export function resetZoom() {
  if (svg && zoom) svg.transition().call(zoom.transform, d3.zoomIdentity);
}

// Load sample data
export function loadSampleData() {
  localStorage.setItem('acceptedArtifacts', JSON.stringify(sampleArtifacts));
  loadArchive();
}

// Load archive
export function loadArchive() {
  let acceptedArtifacts = getAcceptedArtifacts();
  // Only use uploaded artifacts; do not fallback to sampleArtifacts
  const nodes = acceptedArtifacts.map((artifact, index) => 
    artifactToNode(artifact, `artifact${index}`)
  );
  const links = generateLinks(nodes);
  initializeGraph(nodes, links);
  setupFilters(nodes);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedPersona = localStorage.getItem('selectedPersona');
  if (!savedPersona) {
    showPersonaModal();
  } else {
    window.selectedPersona = savedPersona;
    window.personaTags = window.personaTagsMap[savedPersona] || [];
  }
  loadArchive();
});