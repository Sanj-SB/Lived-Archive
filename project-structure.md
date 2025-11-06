# Lived Archive - Project Structure

## 📁 File Organization

Your project should have this structure in VS Code:

```
lived-archive/
│
├── index.html              # Home/Archive page (network graph)
├── submit.html             # Artifact submission/tagger page
├── admin.html              # Admin login & review page
│
├── styles.css              # Shared styles (used by all pages)
├── submit-styles.css       # Submit page specific styles
├── admin-styles.css        # Admin page specific styles
│
├── script.js               # Shared functions (localStorage, modals)
├── graph.js                # Network graph visualization (D3.js)
├── submit.js               # Submit page logic (file upload, tagging)
└── admin.js                # Admin page logic (login, review queue)
```

## 🔗 How Files Connect

### **index.html** (Home Page)
- Links: `styles.css`
- Scripts: `script.js`, `graph.js`
- Features: Network graph, artifact viewing, sample data loading

### **submit.html** (Tagger Page)
- Links: `styles.css`, `submit-styles.css`
- Scripts: `script.js`, `submit.js`
- Features: File upload, AI tagging, artifact details form

### **admin.html** (Admin Page)
- Links: `styles.css`, `admin-styles.css`
- Scripts: `script.js`, `admin.js`
- Features: Login system, review queue, artifact approval

## 🔐 Admin Credentials

**Username:** `admin`  
**Password:** `password123`

*(Change these in `admin.js` if needed)*

## 💾 Data Storage

All data is stored in browser **localStorage**:
- `acceptedArtifacts` - Published artifacts (shown on home page)
- `pendingArtifacts` - Submitted artifacts awaiting review

**Note:** Data persists across sessions but is browser-specific.

## 🚀 Getting Started

1. Create all 9 files in your VS Code project folder
2. Copy the code for each file from the artifacts
3. Open `index.html` in your browser to test
4. Push to GitHub and enable GitHub Pages for live hosting

## 🔄 Page Navigation Flow

```
index.html (Home)
    ↓
    ├─→ submit.html (Submit Artifact)
    │       ↓
    │   (submits to pending queue)
    │
    └─→ admin.html (Admin Login)
            ↓
        (review & accept)
            ↓
        (appears on index.html)
```

## ⚙️ Key Features

### Home Page
- ✅ Interactive network graph visualization
- ✅ Filter by categories and tags
- ✅ Search functionality
- ✅ Zoom controls
- ✅ Click nodes to view details

### Submit Page
- ✅ Upload images, PDFs, or audio
- ✅ Text input support
- ✅ AI-powered tag suggestions (Google Gemini API)
- ✅ Manual tag selection
- ✅ Custom tag creation
- ✅ Detailed artifact information form

### Admin Page
- ✅ Secure login system
- ✅ Review queue with pending artifacts
- ✅ Accept/reject functionality
- ✅ View full artifact details
- ✅ Session-based authentication

## 🛠️ Customization Tips

### Change Colors
Edit color values in `styles.css`:
```css
.btn {
  background: #4a5268; /* Change this */
}
```

### Add More Tag Categories
Edit the `tagCategories` object in `submit.js`:
```javascript
const tagCategories = {
  newCategory: ['Tag 1', 'Tag 2', ...],
  // ...
}
```

### Modify Admin Credentials
Edit in `admin.js`:
```javascript
const ADMIN_USERNAME = 'your_username';
const ADMIN_PASSWORD = 'your_password';
```

## 📝 Important Notes

- **API Key:** The Google Gemini API key in `submit.js` is exposed. For production, move it to a backend service.
- **localStorage Limits:** Browser localStorage typically has a 5-10MB limit.
- **File Size:** Large files (especially PDFs/audio) may hit storage limits.
- **Browser Compatibility:** Requires modern browsers with localStorage and D3.js support.

## 🐛 Troubleshooting

**Graph not showing?**
- Check browser console for errors
- Ensure D3.js CDN is loading
- Try clicking "load sample data" if no artifacts exist

**Files not uploading?**
- Check file size (localStorage limits)
- Verify file type is supported
- Clear browser cache and try again

**Tags not saving?**
- Ensure you've clicked tags to select them
- Fill all required fields before submitting
- Check browser console for JavaScript errors

## 📱 Responsive Design

All pages are responsive and work on:
- Desktop (optimized)
- Tablet (adjusted layouts)
- Mobile (stacked layouts)

## 🌐 Deployment

### GitHub Pages
1. Push all files to your repository
2. Go to Settings → Pages
3. Select branch and save
4. Your site will be live at `https://yourusername.github.io/repo-name/`

### Local Testing
Simply open `index.html` in any modern browser - no server needed!

---

**Need help?** Check the browser console (F12) for error messages.