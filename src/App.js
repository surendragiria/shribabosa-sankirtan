import React, { useState, useRef, useEffect, useCallback } from 'react';

function App() {
  // Auto-sync state
  const [autoExportEnabled, setAutoExportEnabled] = useState(true);
  const [lastAutoExport, setLastAutoExport] = useState(null);
  const [syncInstructions, setSyncInstructions] = useState(false);
  const fileInputRef = useRef(null);

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

  // Auto-export function
  const autoExportToDownloads = useCallback((bhajanData) => {
    if (!autoExportEnabled) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `babosa-sankirtan-sync-${timestamp}.json`;
      
      const dataStr = JSON.stringify({
        timestamp: new Date().toISOString(),
        device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        bhajans: bhajanData,
        version: '2.0.0'
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLastAutoExport(new Date());
      console.log('Auto-exported bhajans to Downloads:', filename);
    } catch (error) {
      console.error('Auto-export failed:', error);
    }
  }, [autoExportEnabled]);

  // Save to localStorage and auto-export
  useEffect(() => {
    try {
      localStorage.setItem('babosa-sankirtan-bhajans', JSON.stringify(bhajans));
      console.log('Saved', bhajans.length, 'bhajans to localStorage');
      
      // Auto-export when data changes (debounced)
      const exportTimer = setTimeout(() => {
        autoExportToDownloads(bhajans);
      }, 2000); // Wait 2 seconds after last change
      
      return () => clearTimeout(exportTimer);
    } catch (error) {
      console.error('Error saving bhajans:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit reached. Please export your bhajans as backup and clear some data.');
      }
    }
  }, [bhajans, autoExportToDownloads]);

  // Check for Google Drive sync files
  const checkForDriveUpdates = () => {
    // Trigger file input to check for Drive sync file
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Drive sync file upload
  const handleDriveSyncFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const driveData = JSON.parse(e.target.result);
        
        // Validate sync file format
        if (driveData.bhajans && Array.isArray(driveData.bhajans)) {
          const driveBhajans = driveData.bhajans;
          const localBhajans = bhajans;
          
          // Smart merge: combine both datasets
          const mergedData = mergeBhajanData(localBhajans, driveBhajans);
          
          if (mergedData.length > bhajans.length) {
            setBhajans(mergedData);
            alert(`✅ Sync successful! Added ${mergedData.length - bhajans.length} new bhajans from Google Drive.`);
          } else if (mergedData.length === bhajans.length) {
            alert('✅ Sync complete! Your data is already up to date.');
          } else {
            setBhajans(mergedData);
            alert('✅ Sync successful! Data synchronized with Google Drive.');
          }
        } else {
          alert('❌ Invalid sync file format. Please select a valid babosa-sankirtan-sync file.');
        }
      } catch (error) {
        console.error('Drive sync error:', error);
        alert('❌ Failed to sync with Google Drive. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Smart merge function
  const mergeBhajanData = (localData, driveData) => {
    const mergedMap = new Map();
    
    // Add all local bhajans
    localData.forEach(bhajan => {
      mergedMap.set(bhajan.id, bhajan);
    });
    
    // Add/update with drive bhajans (prioritize newer lastViewed)
    driveData.forEach(driveBhajan => {
      const localBhajan = mergedMap.get(driveBhajan.id);
      
      if (!localBhajan) {
        // New bhajan from drive
        mergedMap.set(driveBhajan.id, driveBhajan);
      } else {
        // Merge existing: use most recent lastViewed
        const localTime = new Date(localBhajan.lastViewed || 0);
        const driveTime = new Date(driveBhajan.lastViewed || 0);
        
        if (driveTime > localTime) {
          mergedMap.set(driveBhajan.id, {
            ...localBhajan,
            ...driveBhajan,
            viewCount: Math.max(localBhajan.viewCount || 0, driveBhajan.viewCount || 0)
          });
        }
      }
    });
    
    return Array.from(mergedMap.values()).sort((a, b) => a.id - b.id);
  };

  // Manual export for Google Drive
  const exportForDrive = () => {
    try {
      const timestamp = new Date().toISOString();
      const filename = `babosa-sankirtan-sync-${timestamp.split('T')[0]}.json`;
      
      const syncData = {
        timestamp,
        device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        bhajans: bhajans,
        version: '2.0.0',
        instructions: 'Upload this file to your Google Drive, then download on other devices to sync'
      };
      
      const dataStr = JSON.stringify(syncData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      setSyncInstructions(true);
      alert(`📁 Sync file created! Upload "${filename}" to Google Drive for cross-device sync.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to create sync file. Please try again.');
    }
  };

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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Handle both regular backup and sync file formats
        const bhajanArray = importedData.bhajans || importedData;
        
        if (Array.isArray(bhajanArray) && bhajanArray.length > 0) {
          const existingTitles = new Set(bhajans.map(b => b.title.toLowerCase()));
          const newBhajans = bhajanArray.filter(b => 
            b.title && b.lyrics && !existingTitles.has(b.title.toLowerCase())
          );
          
          if (newBhajans.length > 0) {
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
    event.target.value = '';
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

  const saveBhajan = () => {
    const bhajanData = editingBhajan ? editingBhajan : newBhajan;
    
    if (!bhajanData.title || !bhajanData.lyrics) {
      alert('Please fill in at least the title and lyrics');
      return;
    }

    if (editingBhajan) {
      setBhajans(prev => prev.map(b => b.id === editingBhajan.id ? bhajanData : b));
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
    
    alert(`Bhajan ${editingBhajan ? 'updated' : 'saved'} successfully! 🎉`);
  };

  // Scale editing functions
  const startEditingScale = () => {
    setTempScale(selectedBhajan?.scale || '');
    setEditingScale(true);
  };

  const saveScale = () => {
    if (selectedBhajan) {
      const updatedBhajan = { ...selectedBhajan, scale: tempScale };
      setBhajans(prev => prev.map(b => b.id === selectedBhajan.id ? updatedBhajan : b));
      setSelectedBhajan(updatedBhajan);
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
      setBhajans(prev => prev.filter(b => b.id !== id));
      setSelectedBhajan(null);
      setEditingBhajan(null);
      alert('Bhajan deleted successfully.');
    }
  };

  const editBhajan = (bhajan) => {
    setEditingBhajan(bhajan);
    setShowUpload(true);
    setActiveView('add');
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

  // Voice search functionality
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSearchSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setVoiceSearchActive(false);
      };
      
      recognition.onerror = () => {
        setVoiceSearchActive(false);
      };
      
      recognition.onend = () => {
        setVoiceSearchActive(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceSearch = () => {
    if (recognitionRef.current && voiceSearchSupported) {
      setVoiceSearchActive(true);
      recognitionRef.current.start();
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

  // Auto-sync status component
  const SyncStatusDisplay = () => {
    return (
      <div className="flex items-center text-xs">
        <span className="mr-1">
          {autoExportEnabled ? '📤' : '📱'}
        </span>
        <span className="text-green-600">
          {autoExportEnabled 
            ? lastAutoExport 
              ? `Auto-exported ${lastAutoExport.toLocaleTimeString()}`
              : 'Auto-export enabled'
            : 'Local only'
          }
        </span>
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

      {/* Header - Mobile Responsive */}
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
              {/* Check Drive Updates Button */}
              <button
                onClick={checkForDriveUpdates}
                className="p-2 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors"
                title="Check Google Drive for updates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

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

      {/* Hidden file input for Drive sync */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleDriveSyncFile}
        className="hidden"
      />

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

              {/* Google Drive Sync Section */}
              <div className="pt-4 border-t border-orange-200">
                <h4 className="text-sm font-semibold text-amber-700 mb-3 px-4">☁️ Google Drive Sync</h4>
                
                <button
                  onClick={exportForDrive}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-sm font-medium">Create Sync File</span>
                </button>

                <button
                  onClick={checkForDriveUpdates}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-orange-100 text-amber-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium">Load from Drive</span>
                </button>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>📱→☁️→📱 Cross-Device Sync:</strong>
                  </p>
                  <ol className="text-xs text-blue-600 space-y-1">
                    <li>1. Click "Create Sync File"</li>
                    <li>2. Upload file to Google Drive</li>
                    <li>3. Download on other device</li>
                    <li>4. Click "Load from Drive"</li>
                  </ol>
                </div>

                <label className="flex items-center p-2 text-amber-700">
                  <input
                    type="checkbox"
                    checked={autoExportEnabled}
                    onChange={(e) => setAutoExportEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-xs">Auto-export to Downloads</span>
                </label>
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
      )}

      {/* Sync Instructions Modal */}
      {syncInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-amber-900 mb-4">☁️ Google Drive Sync Instructions</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 mb-2">📱 To sync to other devices:</p>
                <ol className="space-y-1 text-blue-700">
                  <li>1. Upload the downloaded file to Google Drive</li>
                  <li>2. On other device, download the file</li>
                  <li>3. Open the app and click "Load from Drive"</li>
                  <li>4. Select the downloaded sync file</li>
                </ol>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-800 mb-1">💡 Pro Tip:</p>
                <p className="text-green-700">Enable "Auto-export" to automatically backup your bhajans to Downloads folder.</p>
              </div>
            </div>

            <button
              onClick={() => setSyncInstructions(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors mt-4"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        {selectedBhajan ? (
          /* Individual Bhajan View with Scale Editing */
          <div>
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setSelectedBhajan(null)}
                className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-2 sm:mb-4 py-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Collection
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
                  <pre className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-amber-900 font-medium break-words">
                    {selectedBhajan.lyrics}
                  </pre>
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
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <label className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
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
                              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                              📸 Take Photo
                            </button>
                          </div>
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
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Bhajan Lyrics 📝
                        </label>
                        <textarea
                          value={editingBhajan ? editingBhajan.lyrics : newBhajan.lyrics}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, lyrics: e.target.value})) :
                            setNewBhajan(prev => ({...prev, lyrics: e.target.value}))
                          }
                          rows={12}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 font-mono"
                          placeholder="पूर्ण भजन के बोल यहाँ लिखें..."
                        />
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
                    onClick={() => {
                      setSelectedBhajan(bhajan);
                      trackView(bhajan.id);
                    }}
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
