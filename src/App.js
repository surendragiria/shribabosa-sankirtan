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
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // Scale editing state
  const [editingScale, setEditingScale] = useState(false);
  const [tempScale, setTempScale] = useState('');
  
  // Hindi typing mode
  const [hindiTypingEnabled, setHindiTypingEnabled] = useState(false);
  
  // Online/offline status for PWA
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Firebase Cloud Sync State
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('babosa-firebase-config');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem('babosa-room-code') || '');
  const [showSyncSetup, setShowSyncSetup] = useState(false);
  const [syncStatus, setSyncStatus] = useState('not-setup'); // 'not-setup', 'connecting', 'connected', 'error', 'syncing'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [tempFirebaseConfigText, setTempFirebaseConfigText] = useState('');
  const [tempRoomCode, setTempRoomCode] = useState('');
  const firestoreRef = useRef(null);
  const unsubscribeRef = useRef(null);
  
  const [newBhajan, setNewBhajan] = useState({
    title: '',
    lyrics: '',
    author: '',
    deity: '',
    category: '',
    mood: '',
    scale: '',
    keywords: '',
    source: ''
  });

  // Save to localStorage only - NO automatic downloads
  useEffect(() => {
    try {
      localStorage.setItem('babosa-sankirtan-bhajans', JSON.stringify(bhajans));
      console.log('Saved', bhajans.length, 'bhajans to localStorage');
    } catch (error) {
      console.error('Error saving bhajans:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit reached. Please export your bhajans as backup and clear some data.');
      }
    }
  }, [bhajans]);

  // Regular export bhajans
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
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Import started. File:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file is not empty
    if (file.size === 0) {
      alert('❌ The file is empty. Please select a valid backup file.');
      event.target.value = '';
      return;
    }

    // Validate file size (reject files > 50MB as suspicious)
    if (file.size > 50 * 1024 * 1024) {
      alert('❌ File is too large (over 50MB). Please use a smaller backup file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      alert(`❌ Failed to read the file.\n\nError: ${reader.error?.message || 'Unknown error'}\n\nTry:\n• Re-downloading the file\n• Using a different browser\n• Making sure the file is a .json file`);
      event.target.value = '';
    };
    
    reader.onload = (e) => {
      try {
        let fileContent = e.target.result;
        
        // Remove BOM (Byte Order Mark) if present - common on mobile
        if (fileContent.charCodeAt(0) === 0xFEFF) {
          fileContent = fileContent.substring(1);
        }
        
        // Trim whitespace
        fileContent = fileContent.trim();
        
        if (!fileContent) {
          alert('❌ The file appears to be empty after reading.\n\nPlease check that you shared the correct file.');
          event.target.value = '';
          return;
        }

        console.log('File content length:', fileContent.length);
        console.log('First 100 chars:', fileContent.substring(0, 100));

        let importedData;
        try {
          importedData = JSON.parse(fileContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          alert(`❌ This file is not a valid JSON backup file.\n\nError: ${parseError.message}\n\n✅ Make sure:\n• File ends with .json\n• File was exported from बाबोसा संकीर्तन app\n• File wasn't modified after export\n• File was fully downloaded (not cut off)`);
          event.target.value = '';
          return;
        }
        
        // Handle multiple possible formats:
        // 1. Direct array: [bhajan1, bhajan2, ...]
        // 2. Wrapped: { bhajans: [...] }
        // 3. Sync file: { timestamp, bhajans: [...] }
        let bhajanArray;
        if (Array.isArray(importedData)) {
          bhajanArray = importedData;
        } else if (importedData.bhajans && Array.isArray(importedData.bhajans)) {
          bhajanArray = importedData.bhajans;
        } else if (typeof importedData === 'object') {
          // Try to find any array of bhajans in the object
          const possibleArrays = Object.values(importedData).filter(v => Array.isArray(v));
          if (possibleArrays.length > 0) {
            bhajanArray = possibleArrays[0];
          }
        }
        
        if (!bhajanArray || !Array.isArray(bhajanArray)) {
          alert('❌ Unexpected file format.\n\nExpected a list of bhajans but found something else.\n\nPlease share a fresh backup file.');
          event.target.value = '';
          return;
        }
        
        if (bhajanArray.length === 0) {
          alert('⚠️ The backup file contains 0 bhajans.\n\nThe sender may have sent an empty backup.');
          event.target.value = '';
          return;
        }

        console.log(`Found ${bhajanArray.length} bhajans in file`);
        
        // Filter bhajans with at least a title
        const validBhajans = bhajanArray.filter(b => 
          b && typeof b === 'object' && b.title && typeof b.title === 'string'
        );
        
        if (validBhajans.length === 0) {
          alert(`❌ Found ${bhajanArray.length} entries but none had valid bhajan data (missing title or lyrics).\n\nPlease ask the sender to export a fresh backup.`);
          event.target.value = '';
          return;
        }

        // Better duplicate detection: use title + first 50 chars of lyrics as key
        const makeKey = (b) => {
          const title = (b.title || '').trim().toLowerCase();
          const lyricsStart = (b.lyrics || '').trim().substring(0, 50).toLowerCase();
          return `${title}|||${lyricsStart}`;
        };
        
        const existingKeys = new Set(bhajans.map(makeKey));
        const newBhajans = validBhajans.filter(b => !existingKeys.has(makeKey(b)));
        const skippedCount = validBhajans.length - newBhajans.length;
        
        if (newBhajans.length === 0) {
          alert(`ℹ️ Import Summary:\n\n📦 File contains: ${validBhajans.length} bhajans\n⏭️ Already exist: ${skippedCount}\n➕ New to add: 0\n\nAll bhajans in the file already exist on this device.`);
          event.target.value = '';
          return;
        }
        
        // Add new bhajans with fresh IDs
        const maxId = bhajans.length > 0 ? Math.max(...bhajans.map(b => b.id || 0), 0) : 0;
        const bhajanswithNewIds = newBhajans.map((bhajan, index) => ({
          ...bhajan,
          id: maxId + index + 1,
          dateAdded: bhajan.dateAdded || new Date().toISOString(),
          viewCount: bhajan.viewCount || 0,
          lastViewed: bhajan.lastViewed || new Date().toISOString(),
          // Ensure essential fields exist
          title: bhajan.title || 'Untitled',
          lyrics: bhajan.lyrics || ''
        }));
        
        setBhajans(prev => [...prev, ...bhajanswithNewIds]);
        
        const summary = `🎉 Import Successful!\n\n📦 File contained: ${validBhajans.length} bhajans\n✅ Newly imported: ${newBhajans.length}\n⏭️ Skipped (duplicates): ${skippedCount}\n\n📚 Your collection now has ${bhajans.length + newBhajans.length} bhajans total.`;
        alert(summary);
        
      } catch (error) {
        console.error('Unexpected import error:', error);
        alert(`❌ Unexpected error while importing:\n\n${error.message}\n\nPlease check the browser console for details and try again.`);
      } finally {
        event.target.value = '';
      }
    };
    
    // Explicitly use UTF-8 encoding for proper Devanagari/Hindi support
    reader.readAsText(file, 'UTF-8');
  };

  // Clear all data (with confirmation)
  const clearAllData = () => {
    if (window.confirm(`Are you sure you want to delete ALL ${bhajans.length} bhajans? This cannot be undone.\n\nWe recommend exporting a backup first.`)) {
      if (window.confirm('This is your FINAL WARNING. All bhajans will be permanently deleted.')) {
        localStorage.removeItem('babosa-sankirtan-bhajans');
        setBhajans(getInitialBhajans().slice(0, 4));
        alert('All uploaded bhajans have been deleted. Default bhajans restored.');
      }
    }
  };

  // Load Tesseract.js dynamically when needed - FIX FOR OCR
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

  // Enhanced auto-detection functions
  const extractTitle = (textContent) => {
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

  // Handle file uploads with auto-detection
  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    let combinedText = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileText = await extractTextFromFile(file);
        combinedText += fileText + '\n\n';
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        combinedText += `Error processing ${file.name}\n\n`;
      }
    }

    setExtractedText(combinedText);
    
    const autoTitle = extractTitle(combinedText) || (files.length > 0 ? files[0].name.replace(/\.(pdf|jpg|jpeg|png|gif|bmp)$/i, '').replace(/[-_]/g, ' ') : '');
    const autoDeity = autoDetectDeity(combinedText);
    const autoCategory = autoDetectCategory(combinedText, autoTitle);
    
    setNewBhajan(prev => ({
      ...prev,
      lyrics: combinedText,
      source: files.length === 1 ? `${files[0].name}` : `Multiple files: ${files.map(f => f.name).join(', ')}`,
      title: autoTitle,
      deity: autoDeity,
      category: autoCategory
    }));

    setIsProcessing(false);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions or try uploading files instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!cameraStream) return;

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.srcObject = cameraStream;
    video.play();

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `bhajan_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        await handleMultipleFileUpload([file]);
      }, 'image/jpeg', 0.8);
    };
  };

  const saveBhajan = async () => {
    const bhajanData = editingBhajan ? editingBhajan : newBhajan;
    
    if (!bhajanData.title || !bhajanData.lyrics) {
      alert('Please fill in at least the title and lyrics');
      return;
    }

    if (editingBhajan) {
      // Sync to cloud - works for both new-to-cloud AND existing cloud bhajans
      let finalBhajan = bhajanData;
      if (firestoreRef.current) {
        const cloudId = await syncBhajanToCloud(bhajanData);
        if (cloudId) {
          finalBhajan = { ...bhajanData, cloudId };
        }
      }
      setBhajans(prev => prev.map(b => b.id === editingBhajan.id ? finalBhajan : b));
      setEditingBhajan(null);
    } else {
      const newId = Math.max(...bhajans.map(b => b.id), 0) + 1;
      const bhajanWithId = {
        ...bhajanData,
        id: newId,
        dateAdded: new Date().toISOString(),
        viewCount: 0,
        lastViewed: new Date().toISOString()
      };
      
      // Sync new bhajan to cloud and get cloudId
      if (firestoreRef.current) {
        const cloudId = await syncBhajanToCloud(bhajanWithId);
        if (cloudId) {
          bhajanWithId.cloudId = cloudId;
        }
      }
      
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
      source: ''
    });
    setExtractedText('');
    
    const syncMsg = firestoreRef.current ? ' (synced to cloud)' : '';
    alert(`Bhajan ${editingBhajan ? 'updated' : 'saved'} successfully!${syncMsg} 🎉`);
  };

  // Scale editing functions
  // Hindi transliteration map - Roman to Devanagari (Google Hindi typing style)
  // This provides word-by-word conversion of Hindi written in English letters
  const hindiTransliterationMap = {
    // Common bhajan words
    'om': 'ॐ', 'aum': 'ॐ',
    'jai': 'जय', 'jay': 'जय', 'jaya': 'जय',
    'namah': 'नमः', 'namaha': 'नमः',
    'shri': 'श्री', 'sri': 'श्री', 'shree': 'श्री',
    'bhagwan': 'भगवान', 'bhagavan': 'भगवान',
    'bhakt': 'भक्त', 'bhakti': 'भक्ति',
    'bhajan': 'भजन', 'kirtan': 'कीर्तन',
    'aarti': 'आरती', 'arti': 'आरती',
    'mantra': 'मंत्र', 'stotra': 'स्तोत्र', 'chalisa': 'चालीसा',
    'mandir': 'मंदिर', 'devta': 'देवता',
    // Deity names
    'krishna': 'कृष्ण', 'krsna': 'कृष्ण', 'kishan': 'किशन',
    'ram': 'राम', 'rama': 'राम', 'raam': 'राम',
    'shiv': 'शिव', 'shiva': 'शिव', 'shankar': 'शंकर',
    'ganesh': 'गणेश', 'ganesha': 'गणेश', 'ganpati': 'गणपति', 'ganapati': 'गणपति',
    'hanuman': 'हनुमान', 'bajrang': 'बजरंग',
    'durga': 'दुर्गा', 'maa': 'माँ', 'mata': 'माता',
    'saraswati': 'सरस्वती', 'lakshmi': 'लक्ष्मी',
    'radha': 'राधा', 'sita': 'सीता', 'parvati': 'पार्वती',
    'vishnu': 'विष्णु', 'brahma': 'ब्रह्मा',
    'govind': 'गोविंद', 'gopal': 'गोपाल', 'mohan': 'मोहन', 'murari': 'मुरारी',
    'kanha': 'कान्हा', 'kanhaiya': 'कन्हैया',
    'jagdish': 'जगदीश', 'jagadish': 'जगदीश',
    // Common words
    'hare': 'हरे', 'hari': 'हरि',
    'prabhu': 'प्रभु', 'swami': 'स्वामी',
    'dev': 'देव', 'deva': 'देव',
    'mahadev': 'महादेव', 'mahadeva': 'महादेव',
    'bhole': 'भोले', 'bholanath': 'भोलेनाथ',
    'guru': 'गुरु', 'satguru': 'सतगुरु',
    'baba': 'बाबा', 'bapu': 'बापू',
    'mere': 'मेरे', 'meri': 'मेरी', 'mera': 'मेरा',
    'tere': 'तेरे', 'teri': 'तेरी', 'tera': 'तेरा',
    'humko': 'हमको', 'tumko': 'तुमको',
    'hum': 'हम', 'tum': 'तुम', 'main': 'मैं', 'mujhe': 'मुझे',
    'hai': 'है', 'hain': 'हैं', 'tha': 'था', 'thi': 'थी', 'the': 'थे',
    'ho': 'हो', 'hota': 'होता', 'hoti': 'होती',
    'ka': 'का', 'ki': 'की', 'ke': 'के', 'ko': 'को',
    'se': 'से', 'mein': 'में', 'par': 'पर', 'aur': 'और',
    'nahi': 'नहीं', 'nahin': 'नहीं', 'kyun': 'क्यों', 'kya': 'क्या', 'kaise': 'कैसे',
    'bhi': 'भी', 'bas': 'बस', 'sirf': 'सिर्फ',
    // Emotions/devotion
    'prem': 'प्रेम', 'pyar': 'प्यार', 'pyaar': 'प्यार',
    'dil': 'दिल', 'man': 'मन', 'hriday': 'हृदय',
    'aatma': 'आत्मा', 'atma': 'आत्मा',
    'shanti': 'शांति', 'sukh': 'सुख', 'dukh': 'दुख',
    'anand': 'आनंद', 'ananda': 'आनंद',
    'daya': 'दया', 'karuna': 'करुणा', 'kripa': 'कृपा',
    'sewa': 'सेवा', 'seva': 'सेवा',
    'puja': 'पूजा', 'pooja': 'पूजा',
    'dhyan': 'ध्यान', 'dhyana': 'ध्यान',
    'yog': 'योग', 'yoga': 'योग',
    'sanskar': 'संस्कार', 'dharma': 'धर्म', 'karm': 'कर्म', 'karma': 'कर्म',
    'sangat': 'संगत', 'satsang': 'सत्संग',
    // Places
    'vrindavan': 'वृंदावन', 'mathura': 'मथुरा', 'ayodhya': 'अयोध्या',
    'kashi': 'काशी', 'kailash': 'कैलाश',
    // Numbers/common
    'ek': 'एक', 'do': 'दो', 'teen': 'तीन', 'char': 'चार', 'paanch': 'पाँच',
    'nam': 'नाम', 'naam': 'नाम',
    'ghar': 'घर', 'sansar': 'संसार', 'jagat': 'जगत',
    'din': 'दिन', 'raat': 'रात', 'samay': 'समय',
    'babosa': 'बाबोसा', 'sankirtan': 'संकीर्तन'
  };

  // Phonetic rules for unknown words (fallback)
  const transliterateWord = (word) => {
    if (!word) return word;
    const lower = word.toLowerCase();
    
    // Check dictionary first
    if (hindiTransliterationMap[lower]) {
      return hindiTransliterationMap[lower];
    }
    
    // Return as-is if not found (user can manually fix)
    return word;
  };

  // Transliterate full text - called on spacebar press
  const transliterateOnSpace = (text, cursorPos) => {
    // Find the word just before the cursor (between cursor and last space/newline)
    let startIdx = cursorPos - 1;
    while (startIdx > 0 && !/[\s\n]/.test(text[startIdx - 1])) {
      startIdx--;
    }
    
    const wordToTransliterate = text.substring(startIdx, cursorPos).trim();
    if (!wordToTransliterate || !/^[a-zA-Z]+$/.test(wordToTransliterate)) {
      return { text, newCursorPos: cursorPos + 1 };
    }
    
    const translated = transliterateWord(wordToTransliterate);
    if (translated === wordToTransliterate) {
      return { text, newCursorPos: cursorPos + 1 };
    }
    
    const newText = text.substring(0, startIdx) + translated + text.substring(cursorPos);
    const newCursorPos = startIdx + translated.length + 1;
    return { text: newText, newCursorPos };
  };

  // Handle lyrics input with optional transliteration
  const handleLyricsChange = (e, isEditing) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // If Hindi typing is off, just update normally
    if (!hindiTypingEnabled) {
      if (isEditing) {
        setEditingBhajan(prev => ({ ...prev, lyrics: value }));
      } else {
        setNewBhajan(prev => ({ ...prev, lyrics: value }));
      }
      return;
    }
    
    // Hindi typing is on - check if user just typed a space
    const prevValue = isEditing ? editingBhajan.lyrics : newBhajan.lyrics;
    const justTypedSpace = value.length > prevValue.length && value[cursorPos - 1] === ' ';
    
    if (justTypedSpace) {
      // Transliterate the word just typed
      const textBeforeSpace = value.substring(0, cursorPos - 1);
      const result = transliterateOnSpace(textBeforeSpace, cursorPos - 1);
      const newValue = result.text + ' ' + value.substring(cursorPos);
      
      if (isEditing) {
        setEditingBhajan(prev => ({ ...prev, lyrics: newValue }));
      } else {
        setNewBhajan(prev => ({ ...prev, lyrics: newValue }));
      }
      
      // Restore cursor position after React re-renders
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = result.newCursorPos;
          e.target.selectionEnd = result.newCursorPos;
        }
      }, 0);
    } else {
      // Normal typing - just update
      if (isEditing) {
        setEditingBhajan(prev => ({ ...prev, lyrics: value }));
      } else {
        setNewBhajan(prev => ({ ...prev, lyrics: value }));
      }
    }
  };


  const startEditingScale = () => {
    setTempScale(selectedBhajan?.scale || '');
    setEditingScale(true);
  };

  const saveScale = async () => {
    if (selectedBhajan) {
      const updatedBhajan = { ...selectedBhajan, scale: tempScale };
      
      // Sync to cloud - works for both new-to-cloud AND existing cloud bhajans
      let finalBhajan = updatedBhajan;
      if (firestoreRef.current) {
        const cloudId = await syncBhajanToCloud(updatedBhajan);
        if (cloudId) {
          finalBhajan = { ...updatedBhajan, cloudId };
        }
      }
      
      setBhajans(prev => prev.map(b => b.id === selectedBhajan.id ? finalBhajan : b));
      setSelectedBhajan(finalBhajan);
      setEditingScale(false);
      setTempScale('');
    }
  };

  const cancelScaleEdit = () => {
    setEditingScale(false);
    setTempScale('');
  };

  const deleteBhajan = (id) => {
    if (window.confirm('Are you sure you want to delete this bhajan?')) {
      const bhajanToDelete = bhajans.find(b => b.id === id);
      setBhajans(prev => prev.filter(b => b.id !== id));
      setSelectedBhajan(null);
      setEditingBhajan(null);
      // Delete from cloud
      if (bhajanToDelete && bhajanToDelete.cloudId) {
        deleteBhajanFromCloud(bhajanToDelete.cloudId);
      }
      alert('Bhajan deleted successfully.');
    }
  };

  const editBhajan = (bhajan) => {
    setEditingBhajan(bhajan);
    setSelectedBhajan(null);
    setShowUpload(true);
    setActiveView('add');
    window.history.pushState({ view: 'edit', id: bhajan.id }, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setActiveView('home');
    setShowUpload(false);
    setSelectedBhajan(null);
    setShowMenu(false);
  };

  const trackView = (bhajanId) => {
    setBhajans(prev => prev.map(bhajan => 
      bhajan.id === bhajanId 
        ? { 
            ...bhajan, 
            viewCount: (bhajan.viewCount || 0) + 1,
            lastViewed: new Date().toISOString()
          }
        : bhajan
    ));
  };

  // Open bhajan with scroll-to-top AND push browser history state
  const openBhajan = (bhajan) => {
    // Scroll instantly BEFORE state change so the new page renders at top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    setSelectedBhajan(bhajan);
    trackView(bhajan.id);
    // Push to browser history so back button/swipe gesture works
    window.history.pushState({ view: 'bhajan', id: bhajan.id }, '', window.location.pathname);
  };

  // Whenever selectedBhajan changes, reset scroll to top
  // This ensures we always see the title/lyrics first
  useEffect(() => {
    if (selectedBhajan) {
      // Multiple attempts to ensure scroll happens even on mobile browsers
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Backup attempt after render
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
    }
  }, [selectedBhajan]);

  // Online/offline status listener for PWA
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('📴 Gone offline - app continues to work');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==========================================
  // FIREBASE CLOUD SYNC
  // ==========================================
  
  // Sanitize room code to be Firestore-safe
  const sanitizeRoomCode = (code) => {
    return code.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30) || 'default';
  };

  // Initialize Firebase when config is available
  useEffect(() => {
    if (!firebaseConfig || !roomCode) {
      setSyncStatus('not-setup');
      return;
    }

    if (typeof window === 'undefined' || !window.firebase) {
      console.log('Firebase SDK not loaded yet, waiting...');
      const timer = setTimeout(() => {
        if (window.firebase) {
          setSyncStatus('connecting');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    try {
      setSyncStatus('connecting');
      
      // Initialize Firebase app (only once)
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        window.firebase.initializeApp(firebaseConfig);
      }

      const db = window.firebase.firestore();
      
      // Enable offline persistence
      db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.log('Offline persistence already enabled in another tab');
        } else if (err.code === 'unimplemented') {
          console.log('Browser does not support offline persistence');
        }
      });

      // Sign in anonymously (no user sign-in required)
      window.firebase.auth().signInAnonymously().then(() => {
        console.log('🔐 Signed in anonymously to Firebase');
        const safeRoom = sanitizeRoomCode(roomCode);
        const bhajanCollection = db.collection('rooms').doc(safeRoom).collection('bhajans');
        firestoreRef.current = bhajanCollection;

        // Set up real-time listener
        const unsubscribe = bhajanCollection.onSnapshot(
          (snapshot) => {
            const cloudBhajans = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              cloudBhajans.push({ ...data, cloudId: doc.id });
            });

            console.log(`🔄 Received snapshot with ${cloudBhajans.length} bhajans from cloud`);
            
            // Build a Set of cloud bhajan IDs AND titles for dedup matching
            const cloudIds = new Set(cloudBhajans.map(b => b.id));
            const cloudTitleKeys = new Set(
              cloudBhajans.map(b => 
                `${(b.title || '').trim().toLowerCase()}|||${(b.lyrics || '').trim().substring(0, 50).toLowerCase()}`
              )
            );
            
            setBhajans((localBhajans) => {
              // Start with all cloud bhajans (source of truth for synced items)
              const merged = [...cloudBhajans];
              
              // Track which local bhajans to keep
              const seenInMerged = new Set(merged.map(b => 
                `${(b.title || '').trim().toLowerCase()}|||${(b.lyrics || '').trim().substring(0, 50).toLowerCase()}`
              ));
              
              localBhajans.forEach((local) => {
                const localKey = `${(local.title || '').trim().toLowerCase()}|||${(local.lyrics || '').trim().substring(0, 50).toLowerCase()}`;
                
                // Skip if:
                // 1. Same ID already in cloud (standard duplicate check)
                // 2. Has a cloudId — meaning it was cloud-synced but now missing from cloud (i.e., deleted on another device)
                // 3. Same title+lyrics already in merged (content-based dedup for recovery)
                if (cloudIds.has(local.id)) return;
                if (local.cloudId) return;
                if (cloudTitleKeys.has(localKey)) return;
                if (seenInMerged.has(localKey)) return;
                
                seenInMerged.add(localKey);
                merged.push(local);
              });
              
              // Sort by ID for consistency
              merged.sort((a, b) => (a.id || 0) - (b.id || 0));
              console.log(`✅ Merged result: ${merged.length} bhajans (${cloudBhajans.length} from cloud + ${merged.length - cloudBhajans.length} local-only)`);
              return merged;
            });
            setLastSyncTime(new Date());
            setSyncStatus('connected');
          },
          (error) => {
            console.error('Firestore sync error:', error);
            setSyncStatus('error');
          }
        );

        unsubscribeRef.current = unsubscribe;
      }).catch((error) => {
        console.error('Firebase auth error:', error);
        setSyncStatus('error');
        alert('❌ Failed to connect to Firebase. Please check your configuration.\n\nError: ' + error.message);
      });

    } catch (error) {
      console.error('Firebase initialization error:', error);
      setSyncStatus('error');
      alert('❌ Failed to initialize Firebase.\n\nError: ' + error.message + '\n\nPlease check your Firebase config.');
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseConfig, roomCode]);

  // Save bhajan to Firestore
  const syncBhajanToCloud = async (bhajan) => {
    if (!firestoreRef.current) return null;
    try {
      setSyncStatus('syncing');
      const cloudBhajan = { ...bhajan };
      delete cloudBhajan.cloudId;
      
      if (bhajan.cloudId) {
        // Update existing
        await firestoreRef.current.doc(bhajan.cloudId).set(cloudBhajan);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
        return bhajan.cloudId;
      } else {
        // Create new
        const docRef = await firestoreRef.current.add(cloudBhajan);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
        return docRef.id;
      }
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
      setSyncStatus('error');
      return null;
    }
  };

  // Delete bhajan from Firestore
  const deleteBhajanFromCloud = async (cloudId) => {
    if (!firestoreRef.current || !cloudId) return;
    try {
      await firestoreRef.current.doc(cloudId).delete();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to delete from cloud:', error);
    }
  };

  // Setup sync - validates and saves config
  const setupCloudSync = () => {
    try {
      // Parse config from user input
      let config;
      const text = tempFirebaseConfigText.trim();
      
      if (!text) {
        alert('❌ Please paste your Firebase configuration');
        return;
      }
      
      // Try to extract config from pasted code snippet
      try {
        // Remove 'const firebaseConfig = ' prefix if present
        let cleanText = text.replace(/^\s*(const|var|let)\s+\w+\s*=\s*/, '').replace(/;?\s*$/, '');
        // Try direct JSON parse
        config = JSON.parse(cleanText);
      } catch {
        try {
          // Try eval-style parsing for JS object syntax
          // eslint-disable-next-line no-new-func
          config = (new Function('return ' + text.replace(/^\s*(const|var|let)\s+\w+\s*=\s*/, '').replace(/;?\s*$/, '')))();
        } catch (e) {
          alert('❌ Could not parse Firebase config.\n\nMake sure you pasted the complete firebaseConfig object including { and }.');
          return;
        }
      }
      
      // Validate required fields
      if (!config.apiKey || !config.projectId) {
        alert('❌ Invalid Firebase config.\n\nIt must include at least:\n• apiKey\n• projectId\n\nCopy the complete config from your Firebase Console.');
        return;
      }
      
      if (!tempRoomCode.trim()) {
        alert('❌ Please enter a Room Passcode.\n\nThis is a password that you and your friends use to share bhajans.');
        return;
      }
      
      // Save to localStorage
      localStorage.setItem('babosa-firebase-config', JSON.stringify(config));
      localStorage.setItem('babosa-room-code', tempRoomCode.trim());
      
      setFirebaseConfig(config);
      setRoomCode(tempRoomCode.trim());
      setShowSyncSetup(false);
      setTempFirebaseConfigText('');
      setTempRoomCode('');
      
      alert('✅ Cloud sync configured!\n\n🔄 Connecting to Firebase...\n\nYour bhajans will sync automatically across all devices using the same room passcode.');
    } catch (error) {
      console.error('Setup error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  // Disconnect cloud sync
  const disconnectCloudSync = () => {
    if (!window.confirm('Disconnect from cloud sync?\n\nYour bhajans will remain on this device but will no longer sync.\n\nYou can reconnect anytime.')) {
      return;
    }
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    localStorage.removeItem('babosa-firebase-config');
    localStorage.removeItem('babosa-room-code');
    setFirebaseConfig(null);
    setRoomCode('');
    setSyncStatus('not-setup');
    firestoreRef.current = null;
    
    alert('✅ Disconnected from cloud sync. Your bhajans are still saved locally.');
  };

  // Upload all local bhajans to cloud (useful after first setup)
  const uploadAllLocalToCloud = async () => {
    if (!firestoreRef.current) {
      alert('❌ Not connected to cloud. Please set up sync first.');
      return;
    }
    
    const unsyncedBhajans = bhajans.filter(b => !b.cloudId);
    if (unsyncedBhajans.length === 0) {
      alert('✅ All your bhajans are already synced to the cloud.');
      return;
    }
    
    if (!window.confirm(`Upload ${unsyncedBhajans.length} local bhajans to cloud?\n\nAll devices with the same room code will receive them.`)) {
      return;
    }
    
    setSyncStatus('syncing');
    let uploaded = 0;
    let failed = 0;
    
    for (const bhajan of unsyncedBhajans) {
      const cloudId = await syncBhajanToCloud(bhajan);
      if (cloudId) {
        uploaded++;
        // Update local bhajan with cloudId
        setBhajans(prev => prev.map(b => b.id === bhajan.id ? { ...b, cloudId } : b));
      } else {
        failed++;
      }
    }
    
    setSyncStatus('connected');
    alert(`✅ Upload complete!\n\n📤 Uploaded: ${uploaded}\n❌ Failed: ${failed}`);
  };

  // Clean up duplicate bhajans (same title + lyrics)
  const cleanupDuplicates = async () => {
    const seen = new Map();
    const duplicates = [];
    const keep = [];
    
    bhajans.forEach((bhajan) => {
      const key = `${(bhajan.title || '').trim().toLowerCase()}|||${(bhajan.lyrics || '').trim().substring(0, 100).toLowerCase()}`;
      
      if (seen.has(key)) {
        // This is a duplicate
        const existing = seen.get(key);
        // Prefer the one WITH cloudId (keep the cloud-synced one)
        if (bhajan.cloudId && !existing.cloudId) {
          // Current bhajan is cloud-synced, existing is not: replace
          duplicates.push(existing);
          seen.set(key, bhajan);
          // Remove old and keep new
          const idx = keep.indexOf(existing);
          if (idx > -1) keep.splice(idx, 1);
          keep.push(bhajan);
        } else {
          // Keep existing, mark current as duplicate
          duplicates.push(bhajan);
        }
      } else {
        seen.set(key, bhajan);
        keep.push(bhajan);
      }
    });
    
    if (duplicates.length === 0) {
      alert('✅ No duplicates found! Your collection is clean.');
      return;
    }
    
    if (!window.confirm(`Found ${duplicates.length} duplicate bhajans.\n\nKeep ${keep.length} unique bhajans and remove ${duplicates.length} duplicates?\n\nThis will also delete duplicates from cloud if synced.`)) {
      return;
    }
    
    // Delete duplicates from cloud if they have cloudId
    for (const dup of duplicates) {
      if (dup.cloudId && firestoreRef.current) {
        await deleteBhajanFromCloud(dup.cloudId);
      }
    }
    
    // Update local state with only unique bhajans
    setBhajans(keep);
    alert(`✅ Cleanup complete!\n\n🗑️ Removed: ${duplicates.length} duplicates\n✅ Kept: ${keep.length} unique bhajans`);
  };

  // Browser history integration - enables swipe-back gesture and back button
  useEffect(() => {
    // Set initial history state on first load
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', window.location.pathname);
    }

    // Handle browser back button / swipe-back gesture / hardware back button
    const handlePopState = (event) => {
      console.log('Back navigation detected', event.state);
      
      // Close all sub-views - returns to main collection
      setSelectedBhajan(null);
      setShowUpload(false);
      setExtractedText('');
      setEditingBhajan(null);
      setShowMenu(false);
      setEditingScale(false);
      
      // Stop camera if running
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setShowCamera(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice search functionality - improved with better language support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSearchSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      // Support both English and Hindi - browsers will auto-detect
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 3;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice search result:', transcript);
        setSearchTerm(transcript);
        setVoiceSearchActive(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Voice search error:', event.error);
        setVoiceSearchActive(false);
        
        // Show user-friendly error messages
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert('🎤 Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        } else if (event.error === 'no-speech') {
          alert('🎤 No speech detected. Please speak clearly and try again.');
        } else if (event.error === 'network') {
          alert('🎤 Network error. Voice search requires an internet connection.');
        } else if (event.error === 'audio-capture') {
          alert('🎤 No microphone found. Please check your microphone and try again.');
        } else {
          alert(`🎤 Voice search failed: ${event.error}. Please try again.`);
        }
      };
      
      recognition.onend = () => {
        setVoiceSearchActive(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceSearch = () => {
    if (!recognitionRef.current || !voiceSearchSupported) {
      alert('🎤 Voice search is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    try {
      setVoiceSearchActive(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start voice search:', error);
      setVoiceSearchActive(false);
      // Handle "already started" error
      if (error.message && error.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          setVoiceSearchActive(true);
          recognitionRef.current.start();
        }, 100);
      } else {
        alert('🎤 Could not start voice search. Please try again.');
      }
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceSearchActive(false);
    }
  };

  const shareToWhatsApp = (bhajan) => {
    let shareText = `🕉️ ${bhajan.title}\n\n`;
    shareText += `${bhajan.lyrics}\n\n`;
    if (bhajan.author) shareText += `✍️ Author: ${bhajan.author}\n`;
    if (bhajan.deity) shareText += `🙏 Deity: ${bhajan.deity}\n`;
    if (bhajan.category) shareText += `📖 Category: ${bhajan.category}\n`;
    if (bhajan.scale) shareText += `🎵 Scale: ${bhajan.scale}\n`;
    shareText += `\n🕉️ Shared from बाबोसा संकीर्तन (Babosa Sankirtan)`;
    
    const text = encodeURIComponent(shareText);
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async (bhajan) => {
    let shareText = `🕉️ ${bhajan.title}\n\n`;
    shareText += `${bhajan.lyrics}\n\n`;
    if (bhajan.author) shareText += `✍️ Author: ${bhajan.author}\n`;
    if (bhajan.deity) shareText += `🙏 Deity: ${bhajan.deity}\n`;
    if (bhajan.category) shareText += `📖 Category: ${bhajan.category}\n`;
    if (bhajan.scale) shareText += `🎵 Scale: ${bhajan.scale}\n`;
    shareText += `\n🕉️ Shared from बाबोसा संकीर्तन (Babosa Sankirtan)`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Bhajan copied to clipboard! 📋');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Bhajan copied to clipboard! 📋');
    }
  };

  // Filter bhajans based on search and filters
  const filteredBhajans = React.useMemo(() => {
    return bhajans.filter(bhajan => {
      const matchesSearch = !searchTerm || 
        bhajan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bhajan.lyrics.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bhajan.deity && bhajan.deity.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bhajan.author && bhajan.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bhajan.keywords && bhajan.keywords.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bhajan.category && bhajan.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bhajan.scale && bhajan.scale.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === '' || bhajan.category === filterCategory;
      const matchesDeity = filterDeity === '' || bhajan.deity === filterDeity;
      const matchesMood = filterMood === '' || bhajan.mood === filterMood;
      
      return matchesSearch && matchesCategory && matchesDeity && matchesMood;
    });
  }, [bhajans, searchTerm, filterCategory, filterDeity, filterMood]);

  // Compute popular keywords from all bhajans for quick search dropdown
  const popularKeywords = React.useMemo(() => {
    const keywordMap = {};
    bhajans.forEach(bhajan => {
      if (bhajan.keywords) {
        bhajan.keywords.split(',').forEach(kw => {
          const cleaned = kw.trim().toLowerCase();
          if (cleaned && cleaned.length > 1) {
            keywordMap[cleaned] = (keywordMap[cleaned] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([keyword]) => keyword);
  }, [bhajans]);

  // Handle keyword selection from dropdown
  const handleKeywordSelect = (e) => {
    const selected = e.target.value;
    if (selected) {
      setSearchTerm(selected);
    }
  };

  // Find similar bhajans based on deity, category, mood, and shared keywords
  const getSimilarBhajans = (currentBhajan) => {
    if (!currentBhajan) return [];
    
    const currentKeywords = (currentBhajan.keywords || '')
      .toLowerCase()
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    
    return bhajans
      .filter(b => b.id !== currentBhajan.id)
      .map(b => {
        let score = 0;
        const reasons = [];
        
        // Same deity (3 points) - most important
        if (b.deity && currentBhajan.deity && b.deity === currentBhajan.deity) {
          score += 3;
          reasons.push(`🙏 ${b.deity}`);
        }
        // Same category (2 points)
        if (b.category && currentBhajan.category && b.category === currentBhajan.category) {
          score += 2;
          reasons.push(`📖 ${b.category}`);
        }
        // Same mood (1 point)
        if (b.mood && currentBhajan.mood && b.mood === currentBhajan.mood) {
          score += 1;
          reasons.push(`💭 ${b.mood}`);
        }
        // Same scale (2 points) - useful for musicians
        if (b.scale && currentBhajan.scale && b.scale === currentBhajan.scale) {
          score += 2;
          reasons.push(`🎵 ${b.scale}`);
        }
        // Shared keywords (1 point each)
        if (b.keywords && currentKeywords.length > 0) {
          const bKeywords = b.keywords.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
          const sharedCount = currentKeywords.filter(k => bKeywords.includes(k)).length;
          score += sharedCount;
        }
        
        return { bhajan: b, score, reasons };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  // Status display - shows saved count, online status, and cloud sync status
  const SyncStatusDisplay = () => {
    const getCloudStatus = () => {
      if (syncStatus === 'not-setup') return { icon: '📱', text: 'Local only', color: 'bg-gray-100 text-gray-600' };
      if (syncStatus === 'connecting') return { icon: '🔄', text: 'Connecting...', color: 'bg-blue-100 text-blue-700 animate-pulse' };
      if (syncStatus === 'connected') return { icon: '☁️', text: `Synced (${roomCode})`, color: 'bg-green-100 text-green-700' };
      if (syncStatus === 'syncing') return { icon: '⬆️', text: 'Syncing...', color: 'bg-blue-100 text-blue-700 animate-pulse' };
      if (syncStatus === 'error') return { icon: '⚠️', text: 'Sync error', color: 'bg-red-100 text-red-700' };
      return { icon: '📱', text: 'Local only', color: 'bg-gray-100 text-gray-600' };
    };
    
    const cloudStatus = getCloudStatus();
    
    return (
      <div className="flex items-center text-xs gap-2 flex-wrap">
        <div className="flex items-center">
          <span className="mr-1">💾</span>
          <span className="text-green-600">
            {bhajans.length} bhajans
          </span>
        </div>
        <div className={`flex items-center px-2 py-0.5 rounded-full ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-amber-100 text-amber-800 animate-pulse'
        }`}>
          <span className="mr-1">{isOnline ? '🌐' : '📴'}</span>
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className={`flex items-center px-2 py-0.5 rounded-full ${cloudStatus.color}`}>
          <span className="mr-1">{cloudStatus.icon}</span>
          <span className="font-medium">{cloudStatus.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">🕉️</div>
        <div className="absolute top-32 right-20 text-6xl">🪔</div>
        <div className="absolute bottom-20 left-20 text-7xl">🙏</div>
        <div className="absolute top-1/2 right-10 text-5xl">📿</div>
        <div className="absolute bottom-32 right-32 text-6xl">🌺</div>
      </div>

      {/* Header - Hidden when viewing individual bhajan for focused reading */}
      {!selectedBhajan && (
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Top Row: Menu + Title + Action Icons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setShowMenu(true)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors mr-2 sm:mr-3 flex-shrink-0"
              >
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div onClick={navigateToHome} className="cursor-pointer min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-amber-900 truncate">बाबोसा संकीर्तन</h1>
                <p className="text-xs sm:text-sm text-orange-600 truncate">भजन से भगवान तक</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Voice search button */}
              {voiceSearchSupported && (
                <button
                  onClick={voiceSearchActive ? stopVoiceSearch : startVoiceSearch}
                  className={`p-2 rounded-lg transition-colors ${
                    voiceSearchActive 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'hover:bg-orange-100 text-orange-600'
                  }`}
                  title="Voice Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Second Row: Search + Keywords Dropdown (Full-width on mobile) */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Bar - Full width on mobile */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="खोजें भजन, देवता, शब्द..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 text-sm sm:text-base"
              />
              <svg className="w-5 h-5 text-orange-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Keywords Dropdown */}
            <select
              value=""
              onChange={handleKeywordSelect}
              className="px-3 py-2 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 bg-white text-sm sm:text-base sm:w-48 cursor-pointer"
            >
              <option value="">🏷️ Quick Keywords</option>
              {popularKeywords.length > 0 ? (
                popularKeywords.map(keyword => (
                  <option key={keyword} value={keyword}>
                    {keyword}
                  </option>
                ))
              ) : (
                <option value="" disabled>No keywords yet</option>
              )}
            </select>
          </div>

          {/* Sync status - Below search on mobile */}
          <div className="mt-2 flex justify-between items-center">
            <SyncStatusDisplay />
            {searchTerm && (
              <span className="text-xs text-amber-600">
                🔍 Searching: <strong>{searchTerm}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Sidebar Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm sm:w-80 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl overflow-y-auto">
            {/* Menu Header */}
            <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🕉️</span>
                  <div>
                    <h3 className="font-bold text-amber-900">बाबोसा संकीर्तन</h3>
                    <p className="text-sm text-amber-600">{bhajans.length} भजन संग्रह</p>
                    <SyncStatusDisplay />
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
              {/* Home */}
              <button
                onClick={navigateToHome}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                  activeView === 'home' ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-orange-100 text-amber-800'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-semibold">Home</span>
              </button>

              {/* Upload Bhajan */}
              <button
                onClick={() => {
                  setActiveView('add');
                  setShowUpload(true);
                  setEditingBhajan(null);
                  setShowMenu(false);
                  window.history.pushState({ view: 'upload' }, '', window.location.pathname);
                }}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                  activeView === 'add' ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-orange-100 text-amber-800'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="font-semibold">Upload Bhajan</span>
              </button>

              {/* Cloud Sync Section */}
              <div className="pt-4 border-t border-orange-200">
                <h4 className="text-sm font-semibold text-amber-700 mb-3 px-4">☁️ Cloud Sync</h4>
                
                {syncStatus === 'not-setup' ? (
                  <button
                    onClick={() => {
                      setShowSyncSetup(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="text-sm font-semibold">Setup Cloud Sync</span>
                  </button>
                ) : (
                  <>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-2">
                      <p className="text-xs text-green-800 font-semibold">✅ Connected</p>
                      <p className="text-xs text-green-700 mt-1">Room: <strong>{roomCode}</strong></p>
                      {lastSyncTime && (
                        <p className="text-xs text-green-600 mt-1">
                          Last sync: {lastSyncTime.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={uploadAllLocalToCloud}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="text-sm font-medium">Upload All Local to Cloud</span>
                    </button>
                    
                    <button
                      onClick={cleanupDuplicates}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-yellow-100 text-yellow-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm font-medium">🧹 Clean Up Duplicates</span>
                    </button>
                    
                    <button
                      onClick={disconnectCloudSync}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="text-sm font-medium">Disconnect Sync</span>
                    </button>
                  </>
                )}
              </div>

              {/* Data Management Section */}
              <div className="pt-4 border-t border-orange-200">
                <h4 className="text-sm font-semibold text-amber-700 mb-3 px-4">📁 Data Management</h4>
                
                <button
                  onClick={exportBhajans}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                    accept=".json,application/json,text/plain,text/json,*/*"
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
      )}

      {/* Cloud Sync Setup Modal */}
      {showSyncSetup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full my-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-amber-900">☁️ Setup Cloud Sync</h3>
              <button
                onClick={() => {
                  setShowSyncSetup(false);
                  setTempFirebaseConfigText('');
                  setTempRoomCode('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Info box */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-semibold mb-1">🔄 What is Cloud Sync?</p>
                <p className="text-blue-700 text-xs">
                  Sync your bhajans across all your devices automatically. Add a bhajan on your phone, see it on desktop instantly. Share with friends using the same Room Passcode!
                </p>
              </div>

              {/* Quick setup steps */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-800 mb-2">📋 Setup Steps (one-time, 5 min):</p>
                <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">console.firebase.google.com</a></li>
                  <li>Create a new project (name it anything like "Bhajans")</li>
                  <li>In the project, go to <strong>Build → Firestore Database</strong> → Create database (start in test mode)</li>
                  <li>Go to <strong>Build → Authentication</strong> → Get started → Enable <strong>Anonymous</strong> sign-in</li>
                  <li>Click gear ⚙️ → <strong>Project Settings</strong> → scroll to "Your apps" → Click Web icon <strong>&lt;/&gt;</strong></li>
                  <li>Register app → Copy the <code className="bg-white px-1 rounded">firebaseConfig</code> object</li>
                  <li>Paste it in the box below ⬇️</li>
                </ol>
              </div>

              {/* Firebase Config Input */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  1️⃣ Firebase Config (paste the whole object)
                </label>
                <textarea
                  value={tempFirebaseConfigText}
                  onChange={(e) => setTempFirebaseConfigText(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400 font-mono text-xs"
                  placeholder={`{
  "apiKey": "AIzaSyX...",
  "authDomain": "your-app.firebaseapp.com",
  "projectId": "your-app",
  "storageBucket": "your-app.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:..."
}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Paste it as-is from Firebase Console (with or without "const firebaseConfig = ")
                </p>
              </div>

              {/* Room Code Input */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  2️⃣ Room Passcode
                </label>
                <input
                  type="text"
                  value={tempRoomCode}
                  onChange={(e) => setTempRoomCode(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  placeholder="e.g., babosa2026, myroom, family"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔐 Anyone with this passcode + Firebase config can sync with you. Keep it private or share with trusted people only.
                </p>
              </div>

              {/* Firestore Rules Warning */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="font-semibold text-amber-800 mb-1 text-xs">⚠️ Important Firestore Rules</p>
                <p className="text-xs text-amber-700 mb-2">
                  In Firebase Console → Firestore → Rules, paste:
                </p>
                <pre className="bg-white p-2 rounded text-xs overflow-x-auto border border-amber-300">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={setupCloudSync}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                ✅ Connect to Cloud
              </button>
              <button
                onClick={() => {
                  setShowSyncSetup(false);
                  setTempFirebaseConfigText('');
                  setTempRoomCode('');
                }}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        {selectedBhajan ? (
          /* Individual Bhajan View with Scale Editing */
          <div>
            <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2 bg-white/80 backdrop-blur-md rounded-xl shadow-md p-2 sm:p-3 sticky top-0 z-20">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setShowMenu(true)}
                  className="p-2 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors"
                  title="Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-orange-600 hover:text-orange-800 transition-colors py-2 px-2 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back to Collection</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
              
              <button
                onClick={navigateToHome}
                className="flex items-center bg-orange-500 hover:bg-orange-600 text-white transition-colors py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold shadow-md"
                title="Go to Home"
              >
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-amber-900 mb-4 break-words">{selectedBhajan.title}</h1>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {selectedBhajan.deity && (
                    <span className="bg-purple-100 text-purple-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      🙏 {selectedBhajan.deity}
                    </span>
                  )}
                  {selectedBhajan.category && (
                    <span className="bg-green-100 text-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      📖 {selectedBhajan.category}
                    </span>
                  )}
                  {selectedBhajan.mood && (
                    <span className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      💭 {selectedBhajan.mood}
                    </span>
                  )}
                  
                  {/* Scale Badge with Edit Option */}
                  {selectedBhajan.scale && (
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      <span className="mr-2">🎵 {selectedBhajan.scale}</span>
                      <button
                        onClick={startEditingScale}
                        className="text-yellow-600 hover:text-yellow-800 ml-1"
                        title="Edit Scale"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Add Scale Button if no scale exists */}
                  {!selectedBhajan.scale && (
                    <button
                      onClick={startEditingScale}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors"
                    >
                      + Add Scale
                    </button>
                  )}
                </div>

                {/* Scale Editing Modal */}
                {editingScale && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-bold text-amber-900 mb-4">🎵 Edit Scale/Raag</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scale/Raag Name
                          </label>
                          <input
                            type="text"
                            value={tempScale}
                            onChange={(e) => setTempScale(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                            placeholder="e.g., Raag Yaman, C Major, Bhairav, etc."
                            autoFocus
                          />
                        </div>

                        <div className="text-xs text-gray-600">
                          <p className="mb-2">Popular scales:</p>
                          <div className="flex flex-wrap gap-2">
                            {['Raag Yaman', 'Raag Bhairav', 'Raag Kafi', 'Raag Bhimpalasi', 'C Major', 'G Major', 'D Major', 'Traditional', 'Free Style'].map(scale => (
                              <button
                                key={scale}
                                onClick={() => setTempScale(scale)}
                                className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs rounded transition-colors"
                              >
                                {scale}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={saveScale}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={cancelScaleEdit}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedBhajan.author && (
                  <p className="text-amber-700 font-medium mb-4">✍️ {selectedBhajan.author}</p>
                )}
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6">
                  <div className="text-base sm:text-lg leading-relaxed text-amber-900 font-medium">
                    {selectedBhajan.lyrics.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (trimmed === '') {
                        return <div key={idx} className="h-3 sm:h-4" />;
                      }
                      return (
                        <div 
                          key={idx} 
                          className="break-words py-0.5"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => editBhajan(selectedBhajan)}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => shareToWhatsApp(selectedBhajan)}
                  className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() => copyToClipboard(selectedBhajan)}
                  className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>

                <button
                  onClick={() => deleteBhajan(selectedBhajan.id)}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>

              {/* Similar Bhajans Section */}
              {(() => {
                const similar = getSimilarBhajans(selectedBhajan);
                if (similar.length === 0) return null;
                
                return (
                  <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-orange-100">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-3xl mr-3">🎶</span>
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-amber-900">
                          Similar Bhajans
                        </h3>
                        <p className="text-xs sm:text-sm text-amber-600">
                          आपको ये भी पसंद आ सकते हैं
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {similar.map(({ bhajan, reasons }) => (
                        <div
                          key={bhajan.id}
                          onClick={() => openBhajan(bhajan)}
                          className="bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 border border-orange-200 hover:border-orange-400 hover:shadow-md"
                        >
                          <h4 className="font-bold text-amber-900 mb-2 line-clamp-2 text-sm sm:text-base">
                            {bhajan.title}
                          </h4>
                          
                          {/* Preview of lyrics */}
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                            {bhajan.lyrics.slice(0, 80)}...
                          </p>
                          
                          {/* Match reasons */}
                          {reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {reasons.slice(0, 3).map((reason, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-white/70 text-amber-700 px-2 py-0.5 rounded-full border border-orange-200"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-amber-600">
                            {bhajan.author && (
                              <span className="truncate mr-2">✍️ {bhajan.author}</span>
                            )}
                            <span className="text-orange-500 font-semibold whitespace-nowrap">
                              Read →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        ) : showUpload ? (
          /* Upload/Edit Interface */
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => {
                setShowUpload(false);
                setExtractedText('');
                setEditingBhajan(null);
                stopCamera();
                setNewBhajan({
                  title: '',
                  lyrics: '',
                  author: '',
                  deity: '',
                  category: '',
                  mood: '',
                  scale: '',
                  keywords: '',
                  source: ''
                });
              }}
              className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-4 sm:mb-6 py-2 text-sm sm:text-base"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Collection
            </button>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8">
              
              {!editingBhajan && !extractedText ? (
                /* File Upload */
                <div className="mb-6 sm:mb-8">
                  <div 
                    className="border-2 sm:border-3 border-dashed border-orange-300 rounded-2xl p-6 sm:p-12 text-center hover:border-orange-400 transition-colors bg-gradient-to-br from-orange-50 to-amber-50"
                    onDrop={(e) => {
                      e.preventDefault();
                      handleMultipleFileUpload(Array.from(e.dataTransfer.files));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    {isProcessing ? (
                      <div className="space-y-4">
                        <div className="animate-spin text-5xl sm:text-6xl">⚙️</div>
                        <p className="text-lg sm:text-xl text-amber-700">Processing your files...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <p className="text-amber-700 text-sm sm:text-base mb-4">
                            Choose how you want to add your bhajan:
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <label className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
                              📁 Choose Files
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
                                onChange={(e) => handleMultipleFileUpload(Array.from(e.target.files))}
                              />
                            </label>
                            
                            <button
                              onClick={startCamera}
                              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                              📸 Take Photo
                            </button>

                            <button
                              onClick={() => {
                                // Show the form directly with empty extracted text
                                setExtractedText(' ');
                                setNewBhajan(prev => ({ ...prev, lyrics: '' }));
                              }}
                              className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                              ✍️ Type / Paste
                            </button>
                          </div>
                          <p className="text-xs text-amber-600 mt-4">
                            💡 <strong>Tip:</strong> Use "Type / Paste" to directly type a bhajan or paste from clipboard. Hindi typing supported!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera Interface */}
                  {showCamera && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-amber-900 mb-2">📸 Capture Bhajan Photo</h3>
                          <p className="text-amber-700 text-sm">Position the bhajan text clearly in the camera view</p>
                        </div>

                        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                          <video
                            ref={(video) => {
                              if (video && cameraStream) {
                                video.srcObject = cameraStream;
                                video.play();
                              }
                            }}
                            className="w-full h-64 object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          
                          <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                            <span className="text-white/70 text-sm bg-black/50 px-2 py-1 rounded">
                              Align bhajan text here
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={capturePhoto}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center"
                          >
                            📷 Capture
                          </button>
                          
                          <button
                            onClick={stopCamera}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              ) : (
                /* Bhajan Edit Form */
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-4 sm:mb-6 text-center">
                    {editingBhajan ? 'Edit Bhajan' : 'Add New Bhajan'}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Bhajan Title 📖
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.title : newBhajan.title}
                          onChange={(e) => editingBhajan ? 
                            setEditingBhajan(prev => ({...prev, title: e.target.value})) :
                            setNewBhajan(prev => ({...prev, title: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Enter bhajan title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Deity 🙏
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.deity : newBhajan.deity}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, deity: e.target.value})) :
                            setNewBhajan(prev => ({...prev, deity: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Krishna, Rama, Shiva, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Category 📖
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.category : newBhajan.category}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, category: e.target.value})) :
                            setNewBhajan(prev => ({...prev, category: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Aarti, Bhajan, Mantra, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Author ✍️
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.author : newBhajan.author}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, author: e.target.value})) :
                            setNewBhajan(prev => ({...prev, author: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Traditional, Tulsidas, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Scale/Raag 🎵
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.scale : newBhajan.scale}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, scale: e.target.value})) :
                            setNewBhajan(prev => ({...prev, scale: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Raag Yaman, C Major, Bhairav, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Mood 💭
                        </label>
                        <select
                          value={editingBhajan ? editingBhajan.mood : newBhajan.mood}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, mood: e.target.value})) :
                            setNewBhajan(prev => ({...prev, mood: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                        >
                          <option value="">Select mood...</option>
                          <option value="Devotional">Devotional</option>
                          <option value="Peaceful">Peaceful</option>
                          <option value="Joyful">Joyful</option>
                          <option value="Contemplative">Contemplative</option>
                          <option value="Uplifting">Uplifting</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-amber-800">
                            Bhajan Lyrics 📝
                          </label>
                          {/* Hindi Typing Toggle */}
                          <button
                            type="button"
                            onClick={() => setHindiTypingEnabled(!hindiTypingEnabled)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              hindiTypingEnabled
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={hindiTypingEnabled ? 'Disable Hindi typing' : 'Enable Hindi typing'}
                          >
                            <span>{hindiTypingEnabled ? '🇮🇳' : '🔤'}</span>
                            <span>{hindiTypingEnabled ? 'हिंदी ON' : 'Hindi OFF'}</span>
                          </button>
                        </div>
                        
                        {hindiTypingEnabled && (
                          <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-xs text-orange-800">
                              ✨ <strong>Hindi typing enabled!</strong> Type in English, press <kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">space</kbd> to convert.
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              Examples: <code className="bg-white px-1 rounded">ram</code> → राम, <code className="bg-white px-1 rounded">krishna</code> → कृष्ण, <code className="bg-white px-1 rounded">jai</code> → जय
                            </p>
                          </div>
                        )}
                        
                        <textarea
                          value={editingBhajan ? editingBhajan.lyrics : newBhajan.lyrics}
                          onChange={(e) => handleLyricsChange(e, !!editingBhajan)}
                          rows={12}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 font-mono text-base"
                          placeholder={hindiTypingEnabled 
                            ? "Type: jai shri ram krishna govind... (press space to convert)" 
                            : "पूर्ण भजन के बोल यहाँ लिखें..."}
                          style={{ lineHeight: '1.8' }}
                        />
                        
                        {/* Character/line counter */}
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>
                            {(editingBhajan ? editingBhajan.lyrics : newBhajan.lyrics).length} characters
                          </span>
                          <span>
                            {(editingBhajan ? editingBhajan.lyrics : newBhajan.lyrics).split('\n').length} lines
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Keywords 🏷️
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.keywords : newBhajan.keywords}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, keywords: e.target.value})) :
                            setNewBhajan(prev => ({...prev, keywords: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="devotion, prayer, peace..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Source 📚
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.source : newBhajan.source}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, source: e.target.value})) :
                            setNewBhajan(prev => ({...prev, source: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Book name, website, etc."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6 sm:mt-8">
                    <button
                      onClick={saveBhajan}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {editingBhajan ? '✓ Update Bhajan' : '✓ Save Bhajan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* Main Bhajan Collection View */
          <div>
            {/* Filters - Mobile Responsive */}
            <div className="mb-6">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 text-sm sm:text-base bg-white"
                >
                  <option value="">All Categories</option>
                  {[...new Set(bhajans.map(b => b.category).filter(Boolean))].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filterDeity}
                  onChange={(e) => setFilterDeity(e.target.value)}
                  className="px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 text-sm sm:text-base bg-white"
                >
                  <option value="">All Deities</option>
                  {[...new Set(bhajans.map(b => b.deity).filter(Boolean))].map(deity => (
                    <option key={deity} value={deity}>{deity}</option>
                  ))}
                </select>

                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className="px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 text-sm sm:text-base bg-white"
                >
                  <option value="">All Moods</option>
                  {[...new Set(bhajans.map(b => b.mood).filter(Boolean))].map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setFilterCategory('');
                    setFilterDeity('');
                    setFilterMood('');
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>

              {/* Quick filter chips for popular keywords - Mobile friendly scrollable */}
              {popularKeywords.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <div className="flex gap-2 pb-2" style={{ minWidth: 'min-content' }}>
                    <span className="text-xs text-amber-700 self-center whitespace-nowrap">🏷️ Popular:</span>
                    {popularKeywords.slice(0, 10).map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => setSearchTerm(keyword)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                          searchTerm === keyword
                            ? 'bg-orange-500 text-white'
                            : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bhajan Grid */}
            {filteredBhajans.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-amber-800 mb-2">No bhajans found</h3>
                <p className="text-sm sm:text-base text-amber-600 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setFilterCategory('');
                    setFilterDeity('');
                    setFilterMood('');
                    setSearchTerm('');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredBhajans.map(bhajan => (
                  <div
                    key={bhajan.id}
                    className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                    onClick={() => openBhajan(bhajan)}
                  >
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 pr-20">
                        {bhajan.title}
                      </h3>
                      
                      <p className="text-gray-700 mb-3 sm:mb-4 line-clamp-3 text-sm leading-relaxed">
                        {bhajan.lyrics.slice(0, 120)}...
                      </p>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {bhajan.deity && (
                          <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            🙏 {bhajan.deity}
                          </span>
                        )}
                        {bhajan.category && (
                          <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            📖 {bhajan.category}
                          </span>
                        )}
                        {bhajan.mood && (
                          <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            💭 {bhajan.mood}
                          </span>
                        )}
                        {bhajan.scale && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            🎵 {bhajan.scale}
                          </span>
                        )}
                      </div>

                      {bhajan.author && (
                        <div className="flex items-center text-sm">
                          <span className="text-orange-500 mr-2">✍️</span>
                          <span className="font-medium truncate">{bhajan.author}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - Always visible on mobile, show on hover on desktop */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editBhajan(bhajan);
                          }}
                          className="p-1.5 sm:p-2 bg-white/90 hover:bg-white text-amber-600 hover:text-amber-800 rounded-lg shadow-md transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareToWhatsApp(bhajan);
                          }}
                          className="p-1.5 sm:p-2 bg-white/90 hover:bg-white text-green-600 hover:text-green-800 rounded-lg shadow-md transition-colors"
                          title="Share"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
                      <div className="flex items-center justify-between text-xs text-amber-700">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {bhajan.viewCount || 0} views
                        </span>
                        {bhajan.lastViewed && (
                          <span>
                            {new Date(bhajan.lastViewed).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
