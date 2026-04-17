import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [bhajans, setBhajans] = useState([
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
  ]);

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
  const fileInputRef = useRef(null);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState('home'); // home, add, search, stats, settings, index
  const [searchHistory, setSearchHistory] = useState([]); // Track search terms
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

  // Enhanced auto-detection functions
  const extractTitle = (textContent, isFirstFile = false) => {
    if (!textContent) return '';
    
    // Split into lines and clean them
    const lines = textContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 3 && line.length < 100) // Reasonable title length
      .filter(line => !line.includes('Page') && !line.includes('page')) // Remove page markers
      .slice(0, 10); // Check only first 10 lines
    
    return lines[0] || '';
  };

  // Auto-detect deity from text content
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

  // Auto-detect category from text content
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
    
    return 'Bhajan'; // Default category
  };

  // Enhanced keyword extraction
  const autoDetectKeywords = (textContent, title, deity, category) => {
    const existingKeywords = extractKeywords({
      title: title || '',
      lyrics: textContent || '',
      deity: deity || '',
      category: category || '',
      author: ''
    });
    
    return existingKeywords.slice(0, 8).join(', ');
  };

  // Find most repeated line across multiple files (likely the title)
  const findMostRepeatedTitle = (fileTexts) => {
    const lineCounts = {};
    
    fileTexts.forEach(text => {
      if (!text) return;
      
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 3 && line.length < 100)
        .filter(line => !line.includes('Page') && !line.includes('page'))
        .slice(0, 5); // Check first 5 lines of each file
      
      lines.forEach(line => {
        if (line) {
          lineCounts[line] = (lineCounts[line] || 0) + 1;
        }
      });
    });
    
    // Find the most repeated line
    const sortedLines = Object.entries(lineCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([line, count]) => count > 1); // Must appear in multiple files
    
    return sortedLines.length > 0 ? sortedLines[0][0] : '';
  };

  // Utility function for OCR processing
  const processImageWithOCR = async (imageFile) => {
    try {
      // Check if Tesseract is available
      if (typeof window !== 'undefined' && window.Tesseract) {
        const { data: { text } } = await window.Tesseract.recognize(imageFile, 'eng+hin');
        return text;
      }
      
      // Fallback: return filename as placeholder
      return `Text from ${imageFile.name} (OCR processing not available)`;
    } catch (error) {
      console.error('OCR Error:', error);
      return `Unable to extract text from ${imageFile.name}`;
    }
  };

  // OCR text extraction for PDFs and images
  const extractTextFromFile = async (file) => {
    return new Promise((resolve) => {
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('.pdf')) {
        // For PDFs, we'll use the filename as a placeholder
        // In a real implementation, you'd use PDF.js or similar
        resolve(`Content from ${file.name} (PDF text extraction would be implemented here)`);
      } else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
        // For images, use OCR (placeholder implementation)
        processImageWithOCR(file)
          .then(text => resolve(text))
          .catch(() => resolve(`Image content from ${file.name}`));
      } else {
        // For other files, return filename
        resolve(`Content from ${file.name}`);
      }
    });
  };

  // Enhanced sharing functionality
  const formatBhajanForSharing = (bhajan) => {
    let shareText = `🕉️ ${bhajan.title}\n\n`;
    shareText += `${bhajan.lyrics}\n\n`;
    if (bhajan.author) shareText += `✍️ Author: ${bhajan.author}\n`;
    if (bhajan.deity) shareText += `🙏 Deity: ${bhajan.deity}\n`;
    if (bhajan.scale) shareText += `🎵 Scale: ${bhajan.scale}\n`;
    if (bhajan.category) shareText += `📖 Category: ${bhajan.category}\n`;
    if (bhajan.keywords) shareText += `🏷️ Keywords: ${bhajan.keywords}\n`;
    
    shareText += `\n🕉️ Shared from बाबोसा संकीर्तन (Babosa Sankirtan)`;
    return shareText;
  };

  const shareToWhatsApp = (bhajan) => {
    const text = encodeURIComponent(formatBhajanForSharing(bhajan));
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = (bhajan) => {
    const text = encodeURIComponent(formatBhajanForSharing(bhajan));
    const url = `https://t.me/share/url?url=&text=${text}`;
    window.open(url, '_blank');
  };

  const shareToEmail = (bhajan) => {
    const subject = encodeURIComponent(`🕉️ ${bhajan.title} - Sacred Bhajan`);
    const body = encodeURIComponent(formatBhajanForSharing(bhajan));
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url);
  };

  const shareToTwitter = (bhajan) => {
    // Twitter has character limits, so we'll share a shortened version
    const text = encodeURIComponent(`🕉️ ${bhajan.title}\n\n"${bhajan.lyrics.slice(0, 100)}..."\n\n#Bhajan #Spirituality #Devotion`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = (bhajan) => {
    const text = encodeURIComponent(formatBhajanForSharing(bhajan));
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async (bhajan) => {
    try {
      await navigator.clipboard.writeText(formatBhajanForSharing(bhajan));
      alert('Bhajan copied to clipboard! 📋');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formatBhajanForSharing(bhajan);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Bhajan copied to clipboard! 📋');
    }
  };

  // View tracking functions
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

  // Enhanced bhajans with view data
  const enhancedBhajans = bhajans.map(bhajan => ({
    ...bhajan,
    viewCount: bhajan.viewCount || 0,
    lastViewed: bhajan.lastViewed || new Date().toISOString(),
    dateAdded: bhajan.dateAdded || new Date().toISOString()
  }));

  // Automatic keyword extraction and suggestion
  const extractKeywords = (bhajan) => {
    const text = `${bhajan.title} ${bhajan.lyrics} ${bhajan.deity || ''} ${bhajan.author || ''} ${bhajan.category || ''}`.toLowerCase();
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'that', 'this', 'these', 'those', 'there', 'where', 'when', 'why', 'how'
    ]);

    // Devotional and spiritual keywords to prioritize
    const devotionalKeywords = {
      // Deities
      'krishna': 'krishna', 'rama': 'rama', 'sita': 'sita', 'hanuman': 'hanuman',
      'shiva': 'shiva', 'vishnu': 'vishnu', 'lakshmi': 'lakshmi', 'saraswati': 'saraswati',
      'ganesha': 'ganesha', 'durga': 'durga', 'kali': 'kali', 'brahma': 'brahma',
      'radha': 'radha', 'govind': 'govind', 'gopal': 'gopal', 'hari': 'hari',
      
      // Emotions and States
      'love': 'love', 'devotion': 'devotion', 'peace': 'peace', 'joy': 'joy',
      'bhakti': 'bhakti', 'surrender': 'surrender', 'prayer': 'prayer',
      'meditation': 'meditation', 'worship': 'worship', 'divine': 'divine',
      
      // Actions
      'sing': 'singing', 'chant': 'chanting', 'dance': 'dancing', 'pray': 'prayer',
      'meditate': 'meditation', 'worship': 'worship', 'praise': 'praise',
      
      // Spiritual Concepts
      'sacred': 'sacred', 'holy': 'holy', 'blessed': 'blessed', 'eternal': 'eternal',
      'infinite': 'infinite', 'compassion': 'compassion', 'grace': 'grace',
      'moksha': 'liberation', 'dharma': 'dharma', 'karma': 'karma',
      
      // Musical Terms
      'melody': 'melody', 'rhythm': 'rhythm', 'harmony': 'harmony', 'tune': 'tune',
      'raag': 'raag', 'taal': 'taal', 'sur': 'sur', 'swara': 'swara',
      
      // Times and Occasions
      'morning': 'morning', 'evening': 'evening', 'festival': 'festival',
      'celebration': 'celebration', 'ritual': 'ritual', 'ceremony': 'ceremony',
      
      // Nature and Elements
      'river': 'river', 'mountain': 'mountain', 'lotus': 'lotus', 'light': 'light',
      'sun': 'sun', 'moon': 'moon', 'star': 'star', 'flower': 'flower'
    };

    const keywordCounts = {};

    // Extract words and count frequencies
    const words = text.match(/\b\w+\b/g) || [];
    words.forEach(word => {
      const cleanWord = word.toLowerCase().trim();
      if (!stopWords.has(cleanWord) && cleanWord.length >= 3) {
        if (devotionalKeywords[cleanWord]) {
          const keyword = devotionalKeywords[cleanWord];
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      }
    });

    // Add category-based keywords
    if (bhajan.category) {
      const category = bhajan.category.toLowerCase();
      if (category === 'aarti') {
        keywordCounts['aarti'] = (keywordCounts['aarti'] || 0) + 3;
        keywordCounts['worship'] = (keywordCounts['worship'] || 0) + 2;
      } else if (category === 'mantra') {
        keywordCounts['mantra'] = (keywordCounts['mantra'] || 0) + 3;
        keywordCounts['chanting'] = (keywordCounts['chanting'] || 0) + 2;
      } else if (category === 'bhajan') {
        keywordCounts['bhajan'] = (keywordCounts['bhajan'] || 0) + 3;
        keywordCounts['devotion'] = (keywordCounts['devotion'] || 0) + 2;
      }
    }

    // Add deity-based keywords
    if (bhajan.deity) {
      const deity = bhajan.deity.toLowerCase();
      keywordCounts[deity] = (keywordCounts[deity] || 0) + 3;
      
      // Add related keywords based on deity
      if (deity.includes('krishna')) {
        keywordCounts['love'] = (keywordCounts['love'] || 0) + 2;
        keywordCounts['joy'] = (keywordCounts['joy'] || 0) + 1;
        keywordCounts['flute'] = (keywordCounts['flute'] || 0) + 1;
      } else if (deity.includes('rama')) {
        keywordCounts['righteousness'] = (keywordCounts['righteousness'] || 0) + 1;
        keywordCounts['courage'] = (keywordCounts['courage'] || 0) + 1;
      } else if (deity.includes('shiva')) {
        keywordCounts['meditation'] = (keywordCounts['meditation'] || 0) + 2;
        keywordCounts['transformation'] = (keywordCounts['transformation'] || 0) + 1;
      }
    }

    // Add mood-based keywords
    if (bhajan.mood) {
      const mood = bhajan.mood.toLowerCase();
      keywordCounts[mood] = (keywordCounts[mood] || 0) + 2;
    }

    // Sort by frequency and return top keywords
    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .slice(0, 10); // Limit to top 10 keywords

    return sortedKeywords;
  };

  // Get suggested keywords for display
  const getSuggestedKeywords = (bhajan) => {
    const extractedKeywords = extractKeywords(bhajan);
    const currentKeywords = bhajan.keywords ? bhajan.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
    
    // Return keywords that aren't already added
    return extractedKeywords.filter(keyword => 
      !currentKeywords.includes(keyword.toLowerCase())
    );
  };

  // Mood detection and analysis
  const detectMood = (bhajan) => {
    const text = `${bhajan.title} ${bhajan.lyrics} ${bhajan.keywords || ''}`.toLowerCase();
    const moodKeywords = {
      'peaceful': ['peace', 'calm', 'serene', 'tranquil', 'quiet', 'stillness', 'harmony', 'gentle'],
      'joyful': ['joy', 'happy', 'celebration', 'festival', 'dance', 'laughter', 'bliss', 'cheerful'],
      'devotional': ['devotion', 'bhakti', 'surrender', 'prayer', 'worship', 'reverent', 'sacred', 'holy'],
      'contemplative': ['meditation', 'contemplation', 'reflection', 'wisdom', 'knowledge', 'truth', 'deep'],
      'uplifting': ['uplifting', 'inspiring', 'encouraging', 'hope', 'light', 'bright', 'positive'],
      'loving': ['love', 'compassion', 'mercy', 'kindness', 'grace', 'blessing', 'care', 'affection'],
      'surrendering': ['surrender', 'humble', 'submission', 'gratitude', 'thankfulness', 'offering']
    };

    // Count mood indicators
    const moodScores = {};
    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      moodScores[mood] = keywords.filter(keyword => text.includes(keyword)).length;
    });

    // Add context-based mood detection
    if (bhajan.deity) {
      const deity = bhajan.deity.toLowerCase();
      if (deity.includes('krishna') || deity.includes('gopal')) moodScores['joyful'] += 2;
      if (deity.includes('shiva')) moodScores['contemplative'] += 2;
      if (deity.includes('rama')) moodScores['uplifting'] += 2;
      if (deity.includes('hanuman')) moodScores['devotional'] += 2;
    }

    if (bhajan.category) {
      const category = bhajan.category.toLowerCase();
      if (category === 'aarti') moodScores['devotional'] += 3;
      if (category === 'mantra') moodScores['peaceful'] += 3;
      if (category === 'bhajan') moodScores['loving'] += 2;
    }

    // Return the mood with highest score
    const topMood = Object.entries(moodScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])[0];

    return topMood ? topMood[0].charAt(0).toUpperCase() + topMood[0].slice(1) : 'Devotional';
  };

  // Auto-update mood when bhajan data changes
  const autoUpdateMood = (bhajanData) => {
    if (!bhajanData.mood || bhajanData.mood.trim() === '') {
      return detectMood(bhajanData);
    }
    return bhajanData.mood;
  };

  // Auto-generate keywords if empty
  const autoGenerateKeywords = (bhajanData) => {
    if (!bhajanData.keywords || bhajanData.keywords.trim() === '') {
      const suggestedKeywords = extractKeywords(bhajanData);
      return suggestedKeywords.slice(0, 8).join(', '); // Use top 8 keywords
    }
    return bhajanData.keywords;
  };

  // Voice search functionality
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSearchSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Hindi language support
      
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

  // Statistics calculation
  const getStats = () => {
    const totalBhajans = bhajans.length;
    const totalCategories = new Set(bhajans.map(b => b.category).filter(Boolean)).size;
    const totalDeities = new Set(bhajans.map(b => b.deity).filter(Boolean)).size;
    const totalKeywords = new Set(
      bhajans.flatMap(b => b.keywords ? b.keywords.split(',').map(k => k.trim()) : [])
    ).size;
    const mostCommonCategory = bhajans.length > 0 ? 
      Object.entries(
        bhajans.reduce((acc, b) => {
          if (b.category) acc[b.category] = (acc[b.category] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A';

    return {
      totalBhajans,
      totalCategories,
      totalDeities,
      totalKeywords,
      mostCommonCategory
    };
  };
  const cleanTitle = (title) => {
    return title
      .replace(/[^\u0900-\u097F\u0020-\u007E]/g, ' ') // Keep Devanagari, basic Latin, and spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/^[^a-zA-Z\u0900-\u097F]+/, '') // Remove leading non-letter characters
      .trim();
  };

  // Handle multiple file uploads with auto-title detection
  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    let combinedText = '';
    const processedFiles = [];
    const extractedTexts = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileText = await extractTextFromFile(file);
        extractedTexts.push(fileText);
        combinedText += fileText + '\n\n';
        
        processedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          extractedText: fileText
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        processedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          extractedText: `Error processing ${file.name}`
        });
      }
    }

    setUploadedFiles(processedFiles);
    setExtractedText(combinedText);
    
    // Auto-detect title based on file count
    let autoTitle = '';
    if (extractedTexts.length === 1) {
      // Single file: use first line
      autoTitle = extractTitle(extractedTexts[0], true);
    } else if (extractedTexts.length > 1) {
      // Multiple files: find most repeated line
      autoTitle = findMostRepeatedTitle(extractedTexts);
    }
    
    // Fallback to filename if no good title found
    if (!autoTitle && files.length > 0) {
      autoTitle = files[0].name.replace(/\.(pdf|jpg|jpeg|png|gif|bmp)$/i, '').replace(/[-_]/g, ' ');
    }
    
    // Clean and set the auto-detected title
    const cleanedTitle = cleanTitle(autoTitle);
    
    // Enhanced auto-detection for all fields
    const autoDeity = autoDetectDeity(combinedText);
    const autoCategory = autoDetectCategory(combinedText, cleanedTitle);
    const autoKeywords = autoDetectKeywords(combinedText, cleanedTitle, autoDeity, autoCategory);
    
    setNewBhajan(prev => ({
      ...prev,
      lyrics: combinedText,
      source: files.length === 1 ? `${files[0].name}` : `Multiple files: ${files.map(f => f.name).join(', ')}`,
      title: cleanedTitle,
      deity: autoDeity,
      category: autoCategory,
      keywords: autoKeywords,
      uploadedFiles: processedFiles
    }));

    setIsProcessing(false);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
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

    // Create a video element to capture from
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.srcObject = cameraStream;
    video.play();

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert to blob and process
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `bhajan_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        await handleMultipleFileUpload([file]);
      }, 'image/jpeg', 0.8);
    };
  };

  // Save new bhajan or update existing
  const saveBhajan = () => {
    const bhajanData = editingBhajan ? editingBhajan : newBhajan;
    
    if (!bhajanData.title || !bhajanData.lyrics) {
      alert('Please fill in at least the title and lyrics');
      return;
    }

    const finalBhajanData = {
      ...bhajanData,
      keywords: autoGenerateKeywords(bhajanData)
    };

    if (editingBhajan) {
      // Update existing bhajan
      setBhajans(prev => prev.map(b => b.id === editingBhajan.id ? finalBhajanData : b));
      setEditingBhajan(null);
    } else {
      // Create new bhajan
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

    // Reset states
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
  };

  // Delete bhajan
  const deleteBhajan = (id) => {
    if (window.confirm('Are you sure you want to delete this bhajan?')) {
      setBhajans(prev => prev.filter(b => b.id !== id));
      setSelectedBhajan(null);
      setEditingBhajan(null);
    }
  };

  // Edit bhajan
  const editBhajan = (bhajan) => {
    setEditingBhajan(bhajan);
    setShowUpload(true);
  };

  // Navigation functions
  const navigateToHome = () => {
    setActiveView('home');
    setShowUpload(false);
    setSelectedBhajan(null);
    setShowMenu(false);
  };

  const navigateToAdd = () => {
    setActiveView('add');
    setShowUpload(true);
    setSelectedBhajan(null);
    setEditingBhajan(null);
    setShowMenu(false);
  };

  // Smart keyword selection based on search history and popularity
  const getPopularKeywords = () => {
    // Get all keywords from bhajans
    const allKeywords = enhancedBhajans.flatMap(bhajan => 
      bhajan.keywords ? bhajan.keywords.split(',').map(k => k.trim()).filter(Boolean) : []
    );

    // Calculate keyword scores based on:
    // 1. How often they appear in search history
    // 2. How popular the bhajans containing them are
    const keywordScores = {};

    allKeywords.forEach(keyword => {
      if (!keywordScores[keyword]) {
        keywordScores[keyword] = {
          searchCount: 0,
          totalViews: 0,
          bhajanCount: 0
        };
      }

      keywordScores[keyword].bhajanCount++;
      
      // Add view counts from bhajans containing this keyword
      enhancedBhajans.forEach(bhajan => {
        if (bhajan.keywords && bhajan.keywords.toLowerCase().includes(keyword.toLowerCase())) {
          keywordScores[keyword].totalViews += bhajan.viewCount || 0;
        }
      });

      // Add search history count
      keywordScores[keyword].searchCount = searchHistory.filter(term => 
        term.toLowerCase().includes(keyword.toLowerCase())
      ).length;
    });

    // Calculate final score: searchCount * 3 + avgViews + bhajanCount
    const scoredKeywords = Object.entries(keywordScores)
      .map(([keyword, data]) => ({
        keyword,
        score: (data.searchCount * 3) + (data.totalViews / Math.max(data.bhajanCount, 1)) + data.bhajanCount
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Limit to top 5
      .map(item => item.keyword);

    return scoredKeywords;
  };

  // Enhanced search with tracking
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Track search term if user pauses typing
    if (newSearchTerm.length >= 3) {
      setTimeout(() => {
        if (newSearchTerm === searchTerm && newSearchTerm.length >= 3) {
          setSearchHistory(prev => {
            const updated = [...prev, newSearchTerm];
            return updated.slice(-50); // Keep last 50 searches
          });
        }
      }, 1000);
    }
  };

  // Handle keyword clicks for search
  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    setSearchHistory(prev => {
      const updated = [...prev, keyword];
      return updated.slice(-50); // Keep last 50 searches
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">🕉️</div>
        <div className="absolute top-32 right-20 text-6xl">🪔</div>
        <div className="absolute bottom-20 left-20 text-7xl">🙏</div>
        <div className="absolute top-1/2 right-10 text-5xl">📿</div>
        <div className="absolute bottom-32 right-32 text-6xl">🌺</div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setShowMenu(true)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors mr-4"
              >
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div onClick={() => setActiveView('home')} className="cursor-pointer">
                <h1 className="text-2xl font-bold text-amber-900">बाबोसा संकीर्तन</h1>
                <p className="text-sm text-orange-600">भजन से भगवान तक</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="खोजें भजन, देवता, शब्द..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-64 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                />
                <svg className="w-5 h-5 text-orange-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl">
            <div 
              className="fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-orange-50 to-amber-50 shadow-2xl transform transition-transform duration-300 ease-out"
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

                {/* Bhajan Index */}
                <button
                  onClick={() => {
                    setActiveView('index');
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                    activeView === 'index' ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-orange-100 text-amber-800'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="font-semibold">Bhajan Index</span>
                </button>

                {/* Statistics */}
                <button
                  onClick={() => {
                    setActiveView('stats');
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                    activeView === 'stats' ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-orange-100 text-amber-800'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold">Statistics</span>
                </button>

                {/* About */}
                <button
                  onClick={() => {
                    setActiveView('about');
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 ${
                    activeView === 'about' ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-orange-100 text-amber-800'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">About</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {activeView === 'stats' ? (
          /* Statistics View */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">Collection Statistics</h2>
              <p className="text-amber-700">Overview of your spiritual bhajan collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-orange-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bhajans</p>
                    <p className="text-3xl font-bold text-gray-900">{getStats().totalBhajans}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-3xl font-bold text-gray-900">{getStats().totalCategories}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-purple-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deities</p>
                    <p className="text-3xl font-bold text-gray-900">{getStats().totalDeities}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Keywords</p>
                    <p className="text-3xl font-bold text-gray-900">{getStats().totalKeywords}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-red-400">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Most Popular</p>
                    <p className="text-lg font-bold text-gray-900">{getStats().mostCommonCategory}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : activeView === 'about' ? (
          /* About View */
          <div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🕉️</div>
                <h2 className="text-3xl font-bold text-amber-900 mb-2">बाबोसा संकीर्तन</h2>
                <p className="text-xl text-orange-600 mb-6">भजन से भगवान तक</p>
                <p className="text-amber-700 max-w-2xl mx-auto">
                  A spiritual companion for your devotional journey, preserving and sharing the timeless wisdom of sacred bhajans.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">✨ Features</h3>
                  <div className="space-y-2 text-amber-800">
                    <ul className="space-y-1">
                      <li>• Sacred bhajan collection and organization</li>
                      <li>• Advanced search with voice support</li>
                      <li>• Multi-language content (Hindi, Sanskrit)</li>
                      <li>• Upload multiple files (PDF, Images) with OCR</li>
                      <li>• Auto-title detection from uploaded content</li>
                      <li>• Keywords and musical scale support</li>
                      <li>• Advanced search across all fields</li>
                      <li>• Edit and organize your collection</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold mb-2">🙏 Purpose</h4>
                  <p className="text-sm">
                    Created with devotion to preserve and share the spiritual heritage of bhajans, 
                    making divine music accessible to all seekers on their spiritual path.
                  </p>
                </div>
              </div>
            </div>
          </div>

        ) : activeView === 'index' ? (
          /* Bhajan Index View - Table format */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">भजन सूची (Bhajan Index)</h2>
              <p className="text-amber-700">Complete list of all bhajans in your collection</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-100 to-amber-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-amber-900">शीर्षक (Title)</th>
                      <th className="px-6 py-4 text-left font-semibold text-amber-900">भाव (Mood)</th>
                      <th className="px-6 py-4 text-left font-semibold text-amber-900">देवता (Deity)</th>
                      <th className="px-6 py-4 text-left font-semibold text-amber-900">श्रेणी (Category)</th>
                      <th className="px-6 py-4 text-center font-semibold text-amber-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {bhajans
                      .sort((a, b) => {
                        // Sort by Hindi/Devanagari title alphabetically
                        const titleA = a.title || '';
                        const titleB = b.title || '';
                        return titleA.localeCompare(titleB, 'hi');
                      })
                      .map((bhajan, index) => (
                      <tr key={bhajan.id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedBhajan(bhajan);
                              trackView(bhajan.id);
                            }}
                            className="text-left font-medium text-amber-900 hover:text-orange-600 transition-colors"
                          >
                            {bhajan.title}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {bhajan.mood || 'Devotional'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            {bhajan.deity || 'Universal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {bhajan.category || 'Bhajan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBhajan(bhajan);
                                trackView(bhajan.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => editBhajan(bhajan)}
                              className="text-amber-600 hover:text-amber-800 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        ) : selectedBhajan ? (
          /* Individual Bhajan View */
          <div>
            {/* Bhajan content view */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedBhajan(null)}
                className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Collection
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              {/* Title and metadata */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-amber-900 mb-4">{selectedBhajan.title}</h1>
                
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {selectedBhajan.deity && (
                    <button 
                      onClick={() => {
                        setFilterDeity(selectedBhajan.deity);
                        setSelectedBhajan(null);
                      }}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                    >
                      🙏 {selectedBhajan.deity}
                    </button>
                  )}
                  {selectedBhajan.category && (
                    <button 
                      onClick={() => {
                        setFilterCategory(selectedBhajan.category);
                        setSelectedBhajan(null);
                      }}
                      className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                    >
                      📖 {selectedBhajan.category}
                    </button>
                  )}
                  {selectedBhajan.mood && (
                    <button 
                      onClick={() => {
                        setFilterMood(selectedBhajan.mood);
                        setSelectedBhajan(null);
                      }}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                    >
                      💭 {selectedBhajan.mood}
                    </button>
                  )}
                  {selectedBhajan.scale && (
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                      🎵 {selectedBhajan.scale}
                    </span>
                  )}
                </div>

                {/* Author */}
                {selectedBhajan.author && (
                  <p className="text-amber-700 font-medium mb-4">✍️ {selectedBhajan.author}</p>
                )}
              </div>

              {/* Lyrics */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
                  <pre className="whitespace-pre-wrap text-lg leading-relaxed text-amber-900 font-medium">
                    {selectedBhajan.lyrics}
                  </pre>
                </div>
              </div>

              {/* Keywords Display - Max 3 */}
              {selectedBhajan.keywords && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-amber-700 mb-3">Keywords:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedBhajan.keywords.split(',').slice(0, 3).map((keyword, index) => (
                      <span 
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                    {selectedBhajan.keywords.split(',').length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        +{selectedBhajan.keywords.split(',').length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button
                  onClick={() => editBhajan(selectedBhajan)}
                  className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Bhajan
                </button>

                <button
                  onClick={() => shareToWhatsApp(selectedBhajan)}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() => copyToClipboard(selectedBhajan)}
                  className="flex items-center bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>

                <button
                  onClick={() => deleteBhajan(selectedBhajan.id)}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>

              {/* Related bhajans suggestion */}
              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">🔍 Discover More</h3>
                <p className="text-sm text-amber-600 mb-4">Explore more with filters:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {selectedBhajan.category && (
                    <button 
                      onClick={() => {
                        setFilterCategory(selectedBhajan.category);
                        setSelectedBhajan(null);
                      }}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      📖 More {selectedBhajan.category}
                    </button>
                  )}
                  {selectedBhajan.deity && (
                    <button 
                      onClick={() => {
                        setFilterDeity(selectedBhajan.deity);
                        setSelectedBhajan(null);
                      }}
                      className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      🙏 More {selectedBhajan.deity}
                    </button>
                  )}
                  {selectedBhajan.mood && (
                    <button 
                      onClick={() => {
                        setFilterMood(selectedBhajan.mood);
                        setSelectedBhajan(null);
                      }}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      💭 More {selectedBhajan.mood}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        ) : showUpload ? (
          // Enhanced Upload/Edit Interface
          <div className="max-w-6xl mx-auto">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setShowUpload(false);
                setExtractedText('');
                setUploadedFiles([]);
                setEditingBhajan(null);
                stopCamera(); // Clean up camera
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
              }}
              className="flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Collection
            </button>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              
              {!editingBhajan && !extractedText ? (
                /* Simplified File Upload */
                <div className="mb-8">
                  
                  <div 
                    className="border-3 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-400 transition-colors bg-gradient-to-br from-orange-50 to-amber-50"
                    onDrop={(e) => {
                      e.preventDefault();
                      handleMultipleFileUpload(Array.from(e.dataTransfer.files));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    {isProcessing ? (
                      <div className="space-y-4">
                        <div className="animate-spin text-6xl">⚙️</div>
                        <p className="text-xl text-amber-700">Processing your files...</p>
                        <p className="text-amber-600">This may take a moment for multiple files</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <label className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                              📁 Choose Files
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.mp3,.wav,.m4a"
                                onChange={(e) => handleMultipleFileUpload(Array.from(e.target.files))}
                              />
                            </label>
                            
                            <button
                              onClick={startCamera}
                              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-amber-900 mb-2">📸 Capture Bhajan Photo</h3>
                          <p className="text-amber-700 text-sm">Position the bhajan text clearly in the camera view</p>
                        </div>

                        {/* Camera Video */}
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
                          
                          {/* Camera overlay guide */}
                          <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                            <span className="text-white/70 text-sm bg-black/50 px-2 py-1 rounded">
                              Align bhajan text here
                            </span>
                          </div>
                        </div>

                        {/* Camera Controls */}
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

                  {/* Show uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-amber-800 mb-4">Uploaded Files</h4>
                      <div className="space-y-3">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <svg className="w-8 h-8 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <p className="font-medium text-gray-900">{file.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {file.type} • {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                ✓ Processed
                              </span>
                            </div>
                            {file.extractedText && (
                              <div className="mt-3 p-3 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600 mb-1">Extracted text preview:</p>
                                <p className="text-sm font-mono text-gray-800">
                                  {file.extractedText.slice(0, 150)}
                                  {file.extractedText.length > 150 ? '...' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              ) : (
                /* Bhajan Edit Form */
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
                    {editingBhajan ? 'Edit Bhajan' : 'Add New Bhajan'}
                  </h2>

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
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
                          placeholder="Title, deity, category, and keywords will be auto-detected"
                        />
                        {extractedText && (newBhajan.title || newBhajan.deity || newBhajan.category) && (
                          <p className="text-xs text-green-600 mt-1">
                            ✨ Auto-detected from content - you can edit these suggestions
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Deity
                          {newBhajan.deity && extractedText && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              ✨ Auto-detected
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.deity : newBhajan.deity}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, deity: e.target.value})) :
                            setNewBhajan(prev => ({...prev, deity: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Lord Krishna, Lord Rama, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Category
                          {newBhajan.category && extractedText && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              ✨ Auto-detected
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.category : newBhajan.category}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, category: e.target.value})) :
                            setNewBhajan(prev => ({...prev, category: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Aarti, Devotional, Chalisa, etc."
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
                    </div>

                    {/* Middle Column - Musical Info & Keywords */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Singing Scale 🎵
                        </label>
                        <input
                          type="text"
                          value={editingBhajan ? editingBhajan.scale : newBhajan.scale}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, scale: e.target.value})) :
                            setNewBhajan(prev => ({...prev, scale: e.target.value}))
                          }
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Raag Yaman, Sa Re Ga Ma, Free style, etc."
                        />
                        <p className="text-sm text-amber-600 mt-2">
                          Musical scale or raag for singing guidance
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-amber-800 mb-2">
                          Keywords 🏷️
                          {(newBhajan.keywords || editingBhajan?.keywords) && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              ✨ Auto-suggested
                            </span>
                          )}
                        </label>
                        <textarea
                          value={editingBhajan ? editingBhajan.keywords : newBhajan.keywords}
                          onChange={(e) => editingBhajan ?
                            setEditingBhajan(prev => ({...prev, keywords: e.target.value})) :
                            setNewBhajan(prev => ({...prev, keywords: e.target.value}))
                          }
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                          placeholder="Keywords will be auto-suggested based on content..."
                        />
                        <p className="text-sm text-amber-600 mt-2">
                          Separate keywords with commas • Auto-generated from lyrics, deity, and category
                        </p>

                        {/* Auto-suggest keywords button */}
                        {(newBhajan.title || newBhajan.lyrics || editingBhajan) && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                const currentBhajan = editingBhajan || newBhajan;
                                const suggested = extractKeywords(currentBhajan).slice(0, 8).join(', ');
                                if (editingBhajan) {
                                  setEditingBhajan(prev => ({...prev, keywords: suggested}));
                                } else {
                                  setNewBhajan(prev => ({...prev, keywords: suggested}));
                                }
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Regenerate Keywords
                            </button>
                          </div>
                        )}

                        {/* Keyword suggestions */}
                        {(newBhajan.title || newBhajan.lyrics || editingBhajan) && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-amber-800 mb-3">💡 Suggested Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {getSuggestedKeywords(editingBhajan || newBhajan).slice(0, 10).map((keyword, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    const currentKeywords = editingBhajan ? editingBhajan.keywords : newBhajan.keywords;
                                    const newKeywords = currentKeywords ? `${currentKeywords}, ${keyword}` : keyword;
                                    if (editingBhajan) {
                                      setEditingBhajan(prev => ({...prev, keywords: newKeywords}));
                                    } else {
                                      setNewBhajan(prev => ({...prev, keywords: newKeywords}));
                                    }
                                  }}
                                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                                >
                                  +{keyword}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Smart popular keywords */}
                        {getPopularKeywords().length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-amber-800 mb-3">🔥 Popular Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {getPopularKeywords().map((keyword) => (
                                <button
                                  key={keyword}
                                  type="button"
                                  onClick={() => {
                                    const currentKeywords = editingBhajan ? editingBhajan.keywords : newBhajan.keywords;
                                    const newKeywords = currentKeywords ? `${currentKeywords}, ${keyword}` : keyword;
                                    editingBhajan ?
                                      setEditingBhajan(prev => ({...prev, keywords: newKeywords})) :
                                      setNewBhajan(prev => ({...prev, keywords: newKeywords}));
                                  }}
                                  className="bg-white text-amber-700 px-3 py-1 rounded-full text-sm hover:bg-orange-100 transition-colors"
                                >
                                  +{keyword}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
                          <option value="Loving">Loving</option>
                          <option value="Surrendering">Surrendering</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column - Lyrics */}
                    <div className="space-y-6">
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
                          placeholder="पूर्ण भजन के बोल यहाँ लिखें...&#10;&#10;Complete bhajan lyrics here..."
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
                          placeholder="Book name, website, collection, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={saveBhajan}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                >
                  <option value="">All Categories</option>
                  {[...new Set(bhajans.map(b => b.category).filter(Boolean))].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filterDeity}
                  onChange={(e) => setFilterDeity(e.target.value)}
                  className="px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                >
                  <option value="">All Deities</option>
                  {[...new Set(bhajans.map(b => b.deity).filter(Boolean))].map(deity => (
                    <option key={deity} value={deity}>{deity}</option>
                  ))}
                </select>

                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className="px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
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
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Smart keyword suggestions sidebar */}
            <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-amber-900">🔍 Smart Discovery</h3>
                <span className="text-sm text-amber-600">{filteredBhajans.length} bhajans</span>
              </div>

              {/* Popular Keywords */}
              <div className="mt-4 pt-4 border-t border-orange-100">
                <h4 className="text-xs font-medium text-amber-700 mb-2">⭐ Top Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {getPopularKeywords().map(keyword => (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordClick(keyword)}
                      className="px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
                    >
                      {keyword}
                    </button>
                  ))}
                  {getPopularKeywords().length === 0 && (
                    <span className="text-xs text-gray-500 italic">
                      Start reading bhajans to see popular keywords
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bhajan Grid */}
            {filteredBhajans.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">No bhajans found</h3>
                <p className="text-amber-600 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setFilterCategory('');
                    setFilterDeity('');
                    setFilterMood('');
                    setSearchTerm('');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBhajans.map(bhajan => (
                  <div
                    key={bhajan.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                    onClick={() => {
                      setSelectedBhajan(bhajan);
                      trackView(bhajan.id);
                    }}
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-amber-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {bhajan.title}
                      </h3>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {bhajan.lyrics.slice(0, 120)}...
                      </p>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {bhajan.deity && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterDeity(bhajan.deity);
                            }}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                          >
                            🙏 {bhajan.deity}
                          </button>
                        )}
                        {bhajan.category && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterCategory(bhajan.category);
                            }}
                            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                          >
                            📖 {bhajan.category}
                          </button>
                        )}
                        {bhajan.mood && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterMood(bhajan.mood);
                            }}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                          >
                            💭 {bhajan.mood}
                          </button>
                        )}
                      </div>

                      {/* Author */}
                      {bhajan.author && (
                        <div className="flex items-center">
                          <span className="text-orange-500 mr-3">✍️</span>
                          <span className="font-medium">{bhajan.author}</span>
                        </div>
                      )}
                    </div>

                    {/* Keywords tags */}
                    {bhajan.keywords && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {bhajan.keywords.split(',').slice(0, 3).map((keyword, index) => (
                            <button 
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKeywordClick(keyword.trim());
                              }}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-medium transition-colors"
                            >
                              {keyword.trim()}
                            </button>
                          ))}
                          {bhajan.keywords.split(',').length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              +{bhajan.keywords.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editBhajan(bhajan);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-amber-600 hover:text-amber-800 rounded-lg shadow-md transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareToWhatsApp(bhajan);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-green-600 hover:text-green-800 rounded-lg shadow-md transition-colors"
                          title="Share"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* View count and recent activity */}
                    <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
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
                            Last read {new Date(bhajan.lastViewed).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Index view specific layout */}
                    {activeView === 'index' && (
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Scale:</span>
                            <span className="ml-2 text-gray-800">{bhajan.scale || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Source:</span>
                            <span className="ml-2 text-gray-800">{bhajan.source || 'Traditional'}</span>
                          </div>

                          {/* Keywords preview */}
                          {bhajan.keywords && (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-1">
                                {bhajan.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium"
                                  >
                                    {keyword.trim()}
                                  </span>
                                ))}
                                {bhajan.keywords.split(',').length > 3 && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    +{bhajan.keywords.split(',').length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
