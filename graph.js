// Graph variables
let simulation = null;
let svg = null;
let g = null;
let zoom = null;
let selectedCategories = new Set();
let currentTagFilter = '';
let currentSearchTerm = '';

// Convert artifact to node
function artifactToNode(artifact, id) {
  const categories = new Set();
  
  artifact.tags.forEach(tag => {
    if (['Social Justice', 'Caste & Marginalization', 'Labor & Workers\' Rights', 
         'Gender & Sexuality', 'Migration & Displacement', 'Resistance & Protest'].some(c => tag.includes(c))) {
      categories.add('Social Issues & Rights');
    }
    if (['Education & Literacy', 'Health & Wellbeing', 'Awareness / Advocacy', 'Educational Resource'].some(c => tag.includes(c))) {
      categories.add('Education and Wellbeing');
    }
    if (['Politics & Policy', 'Political Campaigning', 'Community Mobilization', 
         'Protest Documentation', 'Alternative News / Reporting'].some(c => tag.includes(c))) {
      categories.add('Politics, Policy & Activism');
    }
    if (['Religion & Spirituality', 'Culture & Heritage', 'Memory & Commemoration', 
         'Theatre & Performance', 'Music & Folk Traditions', 'Language & Linguistics',
         'Artistic Practice', 'Cultural Expression', 'Storytelling / Oral Tradition'].some(c => tag.includes(c))) {
      categories.add('Culture, Heritage & Expression');
    }
    if (['Community Organizing', 'Urban Life & Infrastructure', 'Collective Organizing Tool'].some(c => tag.includes(c))) {
      categories.add('Community & Urban Life');
    }
    if (['Media & Representation', 'Knowledge Sharing', 'Archival / Documentation'].some(c => tag.includes(c))) {
      categories.add('Media & Communication');
    }
  });
  
  if (categories.size === 0) categories.add('Other');
  
  return {
    id: id,
    label: artifact.title || 'Untitled',
    categories: Array.from(categories),
    tags: artifact.tags,
    created: artifact.timestamp ? new Date(artifact.timestamp).toLocaleDateString() : 'Unknown',
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
    'Social Issues & Rights': '#e74c3c',
    'Education and Wellbeing': '#3498db',
    'Politics, Policy & Activism': '#e67e22',
    'Culture, Heritage & Expression': '#9b59b6',
    'Community & Urban Life': '#2ecc71',
    'Media & Communication': '#f39c12',
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
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40));
  
  // Draw links
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link');
  
  // Draw nodes
  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node')
    .attr('r', 20)
    .attr('fill', d => getCategoryColor(d.categories[0]))
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
  
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });
  
  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this).transition().duration(150).attr('r', 25).attr('stroke-width', 5).style('stroke', '#4a5268');
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
    showTooltip(event, d);
  }
  
  function dragended(event, d) {
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

// Setup filters
function setupFilters(nodes) {
  const categories = [...new Set(nodes.flatMap(n => n.categories))];
  selectedCategories = new Set(categories);
  
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '';
  
  categories.forEach(cat => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" checked onchange="filterGraph('${cat}')">
      <span style="color: ${getCategoryColor(cat)}">●</span> ${cat}
    `;
    categoryFilter.appendChild(label);
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
function filterGraph(category) {
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
  
  function isNodeVisible(d) {
    const matchesCategory = d.categories.some(c => selectedCategories.has(c));
    const matchesTagFilter = !currentTagFilter || d.tags.some(t => t.toLowerCase().includes(currentTagFilter));
    const matchesSearchLabel = d.label.toLowerCase().includes(currentSearchTerm);
    const matchesSearchTags = d.tags.some(t => t.toLowerCase().includes(currentSearchTerm));
    const matchesSearch = !currentSearchTerm || matchesSearchLabel || matchesSearchTags;
    
    return matchesCategory && matchesTagFilter && matchesSearch;
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

// Zoom controls
function zoomIn() {
  svg.transition().call(zoom.scaleBy, 1.3);
}

function zoomOut() {
  svg.transition().call(zoom.scaleBy, 0.7);
}

function resetZoom() {
  svg.transition().call(zoom.transform, d3.zoomIdentity);
}

// Load sample data
function loadSampleData() {
  localStorage.setItem('acceptedArtifacts', JSON.stringify(sampleArtifacts));
  loadArchive();
}

// Load archive
function loadArchive() {
  const acceptedArtifacts = getAcceptedArtifacts();
  const container = document.getElementById('graphView');
  const svgElement = document.getElementById('networkGraph');
  
  if (acceptedArtifacts.length === 0) {
    d3.select('#networkGraph').selectAll('*').remove();
    
    const svg = d3.select(svgElement)
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight);
    
    svg.append('text')
      .attr('x', '50%')
      .attr('y', '45%')
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', '18')
      .attr('font-family', 'Georgia, serif')
      .text('No artifacts in archive yet.');
    
    svg.append('text')
      .attr('x', '50%')
      .attr('y', '55%')
      .attr('text-anchor', 'middle')
      .attr('fill', '#4a5268')
      .attr('font-size', '14')
      .attr('font-family', 'Georgia, serif')
      .style('cursor', 'pointer')
      .text('Click here to load sample data')
      .on('click', loadSampleData);
    
    return;
  }
  
  const nodes = acceptedArtifacts.map((artifact, index) => 
    artifactToNode(artifact, `artifact${index}`)
  );
  const links = generateLinks(nodes);
  
  initializeGraph(nodes, links);
  setupFilters(nodes);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadArchive);