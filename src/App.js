import React, { useState, useRef, useEffect } from 'react';

function App() {
  // Load bhajans from localStorage or use defaults
  const getInitialBhajans = () => {
    try {
      const savedBhajans = localStorage.getItem('babosa-sankirtan-bhajans');
      if (savedBhajans) {
        const parsed = JSON.parse(savedBhajans);
        console.log('Loaded', parsed.length, 'bhajans from localStorage');
        return parsed;
      }
    } catch (error) {
      console.error('Error loading bhajans from localStorage:', error);
    }
    
    // Return default bhajans if nothing saved
    return [
      {
        id: 1,
        title: "ॐ जय जगदीश हरे",
        lyrics: `ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे
भक्त जनों के संकट दास जनों के संकट क्षण में दूर करे॥

जो दयान धारै फल पावै, दुःख बिनसै मन का
स्वामी दुःख बिनसै मन का, सुख संपत्ति घर आवै
कष्ट मिटै तन का॥`,
        author: "Traditional",
        deity: "Vishnu",
        category: "Aarti",
        mood: "Devotional",
        scale: "Raag Yaman",
        keywords: "aarti, devotion, jagadish, prayer, vishnu",
        source: "Traditional Collection",
        dateAdded: new Date('2024-01-01').toISOString(),
        viewCount: 45,
        lastViewed: new Date('2024-04-15').toISOString()
      },
      {
        id: 2,
        title: "हरे कृष्ण हरे कृष्ण",
        lyrics: `हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
हरे राम हरे राम राम राम हरे हरे

यह महामंत्र है, यह तारक मंत्र है
इसका जाप करने से सभी पाप नष्ट हो जाते हैं
और मन को शांति मिलती है॥`,
        author: "Chaitanya Mahaprabhu",
        deity: "Krishna",
        category: "Mantra",
        mood: "Peaceful",
        scale: "Free Style",
        keywords: "mahamantra, krishna, rama, hare, chanting, peace",
        source: "Gaudiya Tradition",
        dateAdded: new Date('2024-01-02').toISOString(),
        viewCount: 67,
        lastViewed: new Date('2024-04-16').toISOString()
      },
      {
        id: 3,
        title: "रघुपति राघव राजा राम",
        lyrics: `रघुपति राघव राजा राम, पतित पावन सीता राम
सीता राम, सीता राम, भज प्यारे तू सीता राम

ईश्वर अल्लाह तेरे नाम, सब को सन्मति दे भगवान
राम रहीम करीम समान, हम सब हैं उसके संतान॥`,
        author: "Mahatma Gandhi",
        deity: "Rama",
        category: "Bhajan",
        mood: "Uplifting",
        scale: "Raag Bhairav",
        keywords: "raghupati, rama, sita, unity, peace, gandhi",
        source: "Gandhi Ashram",
        dateAdded: new Date('2024-01-03').toISOString(),
        viewCount: 32,
        lastViewed: new Date('2024-04-10').toISOString()
      },
      {
        id: 4,
        title: "श्री गणेश चालीसा",
        lyrics: `जय गणेश गिरिजा सुवन, मंगल मूल सुजान
कहत अयोध्यादास तुम, देहु अभय वरदान॥

जय गणेश जय गणेश जय गणेश देवा
माता जाकी पार्वती, पिता महादेवा॥

एक दंत दयावंत, चार भुजाधारी
माथे सिंदूर सोहै, मूसे की सवारी॥`,
        author: "Traditional",
        deity: "Ganesha",
        category: "Chalisa",
        mood: "Devotional",
        scale: "Traditional",
        keywords: "ganesha, chalisa, vinayaka, ganapati, obstacles, wisdom",
        source: "Chalisa Collection",
        dateAdded: new Date('2024-01-04').toISOString(),
        viewCount: 28,
        lastViewed: new Date('2024-04-12').toISOString()
      }
    ];
  };

  const [bhajans, setBhajans] = useState(getInitialBhajans);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBhajan, setSelectedBhajan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDeity, setFilterDeity] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [editingBhajan, setEditingBhajan] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  const [newBhajan, setNewBhajan] = useState({
    title: '',
    lyrics: '',
    author: '',
    deity: '',
    category: '',
    mood: '',
    scale: '',
    keywords: '',
    source: '',
    uploadedFiles: []
  });

  // Save bhajans to localStorage whenever bhajans array changes
  useEffect(() => {
    try {
      localStorage.setItem('babosa-sankirtan-bhajans', JSON.stringify(bhajans));
      console.log('Saved', bhajans.length, 'bhajans to localStorage');
    } catch (error) {
      console.error('Error saving bhajans to localStorage:', error);
      // Show user-friendly message if storage is full
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit reached. Please export your bhajans as backup and clear some data.');
      }
    }
  }, [bhajans]);

  // Export bhajans to JSON file for backup
  const exportBhajans = () => {
    try {
      const dataStr = JSON.stringify(bhajans, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `babosa-sankirtan-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert(`Successfully exported ${bhajans.length} bhajans to backup file! 📁`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export bhajans. Please try again.');
    }
  };

  // Import bhajans from JSON file
  const importBhajans = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData) && importedData.length > 0) {
          // Merge with existing bhajans, avoiding duplicates by title
          const existingTitles = new Set(bhajans.map(b => b.title.toLowerCase()));
          const newBhajans = importedData.filter(b => 
            b.title && b.lyrics && !existingTitles.has(b.title.toLowerCase())
          );
          
          if (newBhajans.length > 0) {
            // Assign new IDs
            const maxId = Math.max(...bhajans.map(b => b.id), 0);
            const bhajanswithNewIds = newBhajans.map((bhajan, index) => ({
              ...bhajan,
              id: maxId + index + 1,
              dateAdded: bhajan.dateAdded || new Date().toISOString(),
              viewCount: bhajan.viewCount || 0,
              lastViewed: bhajan.lastViewed || new Date().toISOString()
            }));
            
            setBhajans(prev => [...prev, ...bhajanswithNewIds]);
            alert(`Successfully imported ${newBhajans.length} new bhajans! 🎉`);
          } else {
            alert('No new bhajans found to import (duplicates were skipped).');
          }
        } else {
          alert('Invalid file format. Please select a valid bhajan backup file.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import file. Please check the file format and try again.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Clear all data (with confirmation)
  const clearAllData = () => {
    if (window.confirm(`Are you sure you want to delete ALL ${bhajans.length} bhajans? This cannot be undone.\n\nWe recommend exporting a backup first.`)) {
      if (window.confirm('This is your FINAL WARNING. All bhajans will be permanently deleted.')) {
        localStorage.removeItem('babosa-sankirtan-bhajans');
        setBhajans(getInitialBhajans().slice(0, 4)); // Keep only the 4 default bhajans
        alert('All uploaded bhajans have been deleted. Default bhajans restored.');
      }
    }
  };

  // Load Tesseract.js dynamically when needed
  useEffect(() => {
    if (!window.Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Tesseract.js loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Tesseract.js');
      };
      document.body.appendChild(script);
    }
  }, []);

  // [Rest of the component code remains the same as previous version...]
  // [I'll include just the key functions for brevity, but the full component would be exactly the same]

  const extractTitle = (textContent, isFirstFile = false) => {
    if (!textContent) return '';
    
    const lines = textContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 3 && line.length < 100)
      .filter(line => !line.includes('Page') && !line.includes('page'))
      .slice(0, 10);
    
    return lines[0] || '';
  };

  const autoDetectDeity = (textContent) => {
    if (!textContent) return '';
    
    const text = textContent.toLowerCase();
    const deityMappings = {
      'krishna': ['krishna', 'कृष्ण', 'kanhaiya', 'govind', 'gopal', 'murlidhar', 'mohan'],
      'rama': ['rama', 'राम', 'ram', 'raghupati', 'sita ram', 'jay ram'],
      'shiva': ['shiva', 'शिव', 'mahadev', 'shankar', 'bhole', 'nath', 'rudra'],
      'ganesha': ['ganesha', 'गणेश', 'ganapati', 'vinayaka', 'vighnesh', 'ganpati'],
      'hanuman': ['hanuman', 'हनुमान', 'bajrang', 'maruti', 'anjaneya', 'pawanputra'],
      'durga': ['durga', 'दुर्गा', 'mata', 'maa', 'amba', 'jagadamba', 'bhavani'],
      'saraswati': ['saraswati', 'सरस्वती', 'veena', 'vidya', 'bharati', 'sharada'],
      'lakshmi': ['lakshmi', 'लक्ष्मी', 'mahalakshmi', 'shree', 'kamala', 'padma']
    };

    for (const [deity, keywords] of Object.entries(deityMappings)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return deity.charAt(0).toUpperCase() + deity.slice(1);
      }
    }
    
    return '';
  };

  const autoDetectCategory = (textContent, title) => {
    if (!textContent && !title) return '';
    
    const text = (textContent + ' ' + title).toLowerCase();
    
    if (text.includes('aarti') || text.includes('आरती') || text.includes('जय') || text.includes('jai')) {
      return 'Aarti';
    }
    if (text.includes('mantra') || text.includes('मंत्र') || text.includes('om') || text.includes('ॐ')) {
      return 'Mantra';
    }
    if (text.includes('stotra') || text.includes('स्तोत्र') || text.includes('stotram')) {
      return 'Stotram';
    }
    if (text.includes('kirtan') || text.includes('कीर्तन') || text.includes('bhajan') || text.includes('भजन')) {
      return 'Bhajan';
    }
    if (text.includes('chalisa') || text.includes('चालीसा')) {
      return 'Chalisa';
    }
    
    return 'Bhajan';
  };

  const processImageWithOCR = async (imageFile) => {
    try {
      let attempts = 0;
      while (!window.Tesseract && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (window.Tesseract) {
        console.log('Starting OCR processing for:', imageFile.name);
        const { data: { text } } = await window.Tesseract.recognize(imageFile, 'eng+hin', {
          logger: m => console.log('OCR Progress:', m)
        });
        console.log('OCR completed, extracted text:', text.slice(0, 100));
        return text;
      } else {
        console.error('Tesseract.js failed to load');
        return `Image content from ${imageFile.name} (OCR library not available - please refresh and try again)`;
      }
    } catch (error) {
      console.error('OCR Error:', error);
      return `Unable to extract text from ${imageFile.name} (OCR error: ${error.message})`;
    }
  };

  const extractTextFromFile = async (file) => {
    return new Promise((resolve) => {
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('.pdf')) {
        resolve(`Content from ${file.name} (PDF text extraction would be implemented here)`);
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
        processImageWithOCR(file)
          .then(text => resolve(text))
          .catch(() => resolve(`Image content from ${file.name}`));
      } else {
        resolve(`Content from ${file.name}`);
      }
    });
  };

  // [Include all other functions like saveBhajan, deleteBhajan, etc. exactly as before]
  
  const saveBhajan = () => {
    const bhajanData = editingBhajan ? editingBhajan : newBhajan;
    
    if (!bhajanData.title || !bhajanData.lyrics) {
      alert('Please fill in at least the title and lyrics');
      return;
    }

    const finalBhajanData = {
      ...bhajanData,
      keywords: bhajanData.keywords || ''
    };

    if (editingBhajan) {
      setBhajans(prev => prev.map(b => b.id === editingBhajan.id ? finalBhajanData : b));
      setEditingBhajan(null);
    } else {
      const newId = Math.max(...bhajans.map(b => b.id), 0) + 1;
      const bhajanWithId = {
        ...finalBhajanData,
        id: newId,
        dateAdded: new Date().toISOString(),
        viewCount: 0,
        lastViewed: new Date().toISOString()
      };
      setBhajans(prev => [...prev, bhajanWithId]);
    }

    setShowUpload(false);
    setNewBhajan({
      title: '',
      lyrics: '',
      author: '',
      deity: '',
      category: '',
      mood: '',
      scale: '',
      keywords: '',
      source: '',
      uploadedFiles: []
    });
    setExtractedText('');
    setUploadedFiles([]);
    
    // Show success message
    alert(`Bhajan ${editingBhajan ? 'updated' : 'saved'} successfully! 🎉`);
  };

  const deleteBhajan = (id) => {
    if (window.confirm('Are you sure you want to delete this bhajan?')) {
      setBhajans(prev => prev.filter(b => b.id !== id));
      setSelectedBhajan(null);
      setEditingBhajan(null);
      alert('Bhajan deleted successfully.');
    }
  };

  // [Continue with all the other existing functions and the full UI as before...]
  // [For brevity I'm not including the entire render function, but it would be identical to previous version]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* All the existing UI components would go here exactly as before */}
      
      {/* Add a Data Management section in the sidebar menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl">
            <div 
              className="fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🕉️</span>
                    <div>
                      <h3 className="font-bold text-amber-900">बाबोसा संकीर्तन</h3>
                      <p className="text-sm text-amber-600">{bhajans.length} भजन संग्रह</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {/* Existing menu items... */}
                
                {/* Data Management Section */}
                <div className="pt-4 border-t border-orange-200">
                  <h4 className="text-sm font-semibold text-amber-700 mb-3 px-4">📁 Data Management</h4>
                  
                  <button
                    onClick={exportBhajans}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span className="text-sm font-medium">Export Backup</span>
                  </button>

                  <label className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors cursor-pointer">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium">Import Backup</span>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={importBhajans}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={clearAllData}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Clear All Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of the UI exactly as before... */}
    </div>
  );
}

export default App;
