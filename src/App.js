import React, { useState, useMemo, useCallback } from 'react';

export default function BabosaSankirtan() {
  const [bhajans, setBhajans] = useState([
    {
      id: 1,
      title: "Om Jai Jagdish Hare",
      deity: "Lord Vishnu",
      language: "Hindi",
      category: "Aarti",
      lyrics: `Om Jai Jagdish Hare, Swami Jai Jagdish Hare
Bhakt Jano Ke Sankat, Das Jano Ke Sankat
Kshan Mein Dur Kare

Jo Dhyave Phal Pave, Dukh Bin Se Man Ka
Swami Dukh Bin Se Man Ka
Sukh Sampati Ghar Aave, Sukh Sampati Ghar Aave
Kashta Mit Jaye`,
      author: "Traditional",
      source: "Manual Entry"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedBhajan, setSelectedBhajan] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [newBhajan, setNewBhajan] = useState({
    title: '',
    deity: '',
    language: 'Hindi',
    category: '',
    lyrics: '',
    author: '',
    source: ''
  });

  // Initialize PDF.js worker and Tesseract
  const initializeLibraries = useCallback(() => {
    // Load PDF.js
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }

    // Load Tesseract.js
    if (!window.Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // Extract text from PDF
  const extractFromPDF = async (file) => {
    try {
      setIsProcessing(true);
      initializeLibraries();
      
      await new Promise(resolve => {
        const checkPDFJS = () => {
          if (window.pdfjsLib) resolve();
          else setTimeout(checkPDFJS, 100);
        };
        checkPDFJS();
      });

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      setExtractedText(fullText.trim());
      setNewBhajan(prev => ({
        ...prev,
        lyrics: fullText.trim(),
        source: `PDF: ${file.name}`,
        title: file.name.replace('.pdf', '').replace(/[-_]/g, ' ')
      }));
    } catch (error) {
      alert('Error extracting PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract text from image using OCR
  const extractFromImage = async (file) => {
    try {
      setIsProcessing(true);
      initializeLibraries();
      
      await new Promise(resolve => {
        const checkTesseract = () => {
          if (window.Tesseract) resolve();
          else setTimeout(checkTesseract, 100);
        };
        checkTesseract();
      });

      const result = await window.Tesseract.recognize(file, 'eng+hin', {
        logger: m => console.log(m)
      });
      
      setExtractedText(result.data.text);
      setNewBhajan(prev => ({
        ...prev,
        lyrics: result.data.text,
        source: `Image OCR: ${file.name}`,
        title: file.name.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, '').replace(/[-_]/g, ' ')
      }));
    } catch (error) {
      alert('Error extracting from image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    const fileType = file.type;
    
    if (fileType === 'application/pdf') {
      await extractFromPDF(file);
    } else if (fileType.startsWith('image/')) {
      await extractFromImage(file);
    } else {
      alert('Please upload a PDF or image file (JPG, PNG, GIF, BMP)');
    }
  };

  // Save new bhajan
  const saveBhajan = () => {
    if (!newBhajan.title || !newBhajan.lyrics) {
      alert('Please fill in at least the title and lyrics');
      return;
    }

    const bhajan = {
      ...newBhajan,
      id: Math.max(...bhajans.map(b => b.id), 0) + 1,
    };

    setBhajans(prev => [...prev, bhajan]);
    
    // Reset form
    setNewBhajan({
      title: '',
      deity: '',
      language: 'Hindi',
      category: '',
      lyrics: '',
      author: '',
      source: ''
    });
    setExtractedText('');
    setShowUpload(false);
  };

  // Get unique values for filters
  const categories = ['All', ...new Set(bhajans.map(b => b.category).filter(Boolean))];
  const deities = ['All', ...new Set(bhajans.map(b => b.deity).filter(Boolean))];

  // Filter bhajans
  const filteredBhajans = useMemo(() => {
    return bhajans.filter(bhajan => {
      const matchesSearch = searchTerm === '' || 
        bhajan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bhajan.lyrics.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bhajan.deity && bhajan.deity.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bhajan.author && bhajan.author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || bhajan.category === selectedCategory;
      const matchesDeity = selectedDeity === 'All' || bhajan.deity === selectedDeity;
      
      return matchesSearch && matchesCategory && matchesDeity;
    });
  }, [bhajans, searchTerm, selectedCategory, selectedDeity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">🕉️</div>
        <div className="absolute top-32 right-20 text-6xl">🪔</div>
        <div className="absolute bottom-20 left-20 text-7xl">🙏</div>
        <div className="absolute bottom-32 right-32 text-5xl">🌸</div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-light text-amber-900 mb-4 tracking-wide">
            <span className="text-orange-600">॥</span> Babosa Sankirtan <span className="text-orange-600">॥</span>
          </h1>
          <p className="text-xl text-amber-700 font-light italic">Sacred Songs for Divine Congregation</p>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {!selectedBhajan && !showUpload ? (
          // Main Dashboard
          <div className="max-w-7xl mx-auto">
            
            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-orange-100">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-amber-800 mb-3">Search Babosa Collection</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by title, lyrics, deity, or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 bg-white/70 text-lg"
                    />
                    <svg className="absolute left-4 top-5 h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filters */}
                <div className="lg:w-64">
                  <label className="block text-sm font-semibold text-amber-800 mb-3">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-4 px-4 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 bg-white/70 text-lg"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:w-64">
                  <label className="block text-sm font-semibold text-amber-800 mb-3">Deity</label>
                  <select
                    value={selectedDeity}
                    onChange={(e) => setSelectedDeity(e.target.value)}
                    className="w-full py-4 px-4 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 bg-white/70 text-lg"
                  >
                    {deities.map(deity => (
                      <option key={deity} value={deity}>{deity}</option>
                    ))}
                  </select>
                </div>

                {/* Upload Button */}
                <div className="lg:w-48">
                  <label className="block text-sm font-semibold text-amber-800 mb-3">&nbsp;</label>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    📄 Add to Sankirtan
                  </button>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="mt-6 text-center text-amber-700">
                <span className="text-2xl font-light">
                  {filteredBhajans.length} sacred songs found
                </span>
              </div>
            </div>

            {/* Bhajan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBhajans.map(bhajan => (
                <div 
                  key={bhajan.id}
                  onClick={() => setSelectedBhajan(bhajan)}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 border-l-4 border-orange-400 relative overflow-hidden"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-200 to-transparent rounded-bl-full"></div>
                  
                  <h3 className="text-2xl font-bold text-amber-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {bhajan.title}
                  </h3>
                  
                  <div className="space-y-3 text-amber-700">
                    {bhajan.deity && (
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-3">🙏</span>
                        <span className="font-medium">{bhajan.deity}</span>
                      </div>
                    )}
                    {bhajan.category && (
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-3">📖</span>
                        <span className="font-medium">{bhajan.category}</span>
                      </div>
                    )}
                    {bhajan.author && (
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-3">✍️</span>
                        <span className="font-medium">{bhajan.author}</span>
                      </div>
                    )}
                    {bhajan.language && (
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-3">🌐</span>
                        <span className="font-medium">{bhajan.language}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-amber-600 text-sm leading-relaxed line-clamp-3">
                    {bhajan.lyrics.substring(0, 150)}...
                  </div>
                  
                  <div className="mt-6 text-orange-600 font-semibold flex items-center group-hover:text-red-600 transition-colors">
                    <span>Read Full Bhajan</span>
                    <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredBhajans.length === 0 && (
              <div className="text-center py-16">
                <div className="text-amber-300 text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-light text-amber-800 mb-4">No bhajans found</h3>
                <p className="text-amber-600">Try adjusting your search or add new bhajans</p>
              </div>
            )}
          </div>

        ) : showUpload ? (
          // Upload Interface
          <div className="max-w-4xl mx-auto">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setShowUpload(false);
                setExtractedText('');
                setNewBhajan({
                  title: '',
                  deity: '',
                  language: 'Hindi',
                  category: '',
                  lyrics: '',
                  author: '',
                  source: ''
                });
              }}
              className="mb-8 flex items-center text-orange-600 hover:text-orange-800 font-semibold text-lg group"
            >
              <svg className="w-6 h-6 mr-3 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sankirtan
            </button>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              
              <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">Add New Bhajan</h2>

              {!extractedText ? (
                /* File Upload */
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-amber-800 mb-6">Upload from PDF or Image</h3>
                  
                  <div 
                    className="border-3 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-400 transition-colors bg-gradient-to-br from-orange-50 to-amber-50"
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(Array.from(e.dataTransfer.files));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    {isProcessing ? (
                      <div className="space-y-4">
                        <div className="animate-spin text-6xl">⚙️</div>
                        <p className="text-xl text-amber-700">Processing your file...</p>
                        <p className="text-amber-600">This may take a moment for images (OCR)</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-6xl text-orange-400">📁</div>
                        <div>
                          <p className="text-xl text-amber-800 font-semibold mb-2">
                            Drag & drop your file here
                          </p>
                          <p className="text-amber-600 mb-4">
                            Supports PDF files and images (JPG, PNG, GIF, BMP)
                          </p>
                          <p className="text-sm text-amber-500 mb-6">
                            OCR supports English and Hindi text
                          </p>
                          
                          <label className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                            Choose File
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
                              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Manual Entry or Edit Extracted */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newBhajan.title}
                      onChange={(e) => setNewBhajan(prev => ({...prev, title: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                      placeholder="Bhajan title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Deity</label>
                    <input
                      type="text"
                      value={newBhajan.deity}
                      onChange={(e) => setNewBhajan(prev => ({...prev, deity: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                      placeholder="Lord Krishna, Lord Rama, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Language</label>
                    <select
                      value={newBhajan.language}
                      onChange={(e) => setNewBhajan(prev => ({...prev, language: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Category</label>
                    <input
                      type="text"
                      value={newBhajan.category}
                      onChange={(e) => setNewBhajan(prev => ({...prev, category: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                      placeholder="Aarti, Devotional, Chalisa, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-800 mb-2">Author</label>
                    <input
                      type="text"
                      value={newBhajan.author}
                      onChange={(e) => setNewBhajan(prev => ({...prev, author: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400"
                      placeholder="Traditional, Tulsidas, etc."
                    />
                  </div>
                </div>

                {/* Lyrics */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">Lyrics *</label>
                  <textarea
                    value={newBhajan.lyrics}
                    onChange={(e) => setNewBhajan(prev => ({...prev, lyrics: e.target.value}))}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 font-mono text-sm"
                    placeholder="Enter the full bhajan lyrics here..."
                  />
                  {extractedText && (
                    <p className="mt-2 text-sm text-orange-600">
                      ✨ Text extracted from: {newBhajan.source}
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={saveBhajan}
                  disabled={!newBhajan.title || !newBhajan.lyrics}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  💾 Save to Sankirtan Collection
                </button>
              </div>
            </div>
          </div>

        ) : (
          // Individual Bhajan Reader
          <div className="max-w-4xl mx-auto">
            
            {/* Back Button */}
            <button
              onClick={() => setSelectedBhajan(null)}
              className="mb-8 flex items-center text-orange-600 hover:text-orange-800 font-semibold text-lg group"
            >
              <svg className="w-6 h-6 mr-3 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sankirtan
            </button>

            {/* Bhajan Display */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-10">
              
              {/* Header */}
              <div className="text-center mb-10 border-b border-orange-200 pb-8">
                <h1 className="text-4xl font-bold text-amber-900 mb-6">{selectedBhajan.title}</h1>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {selectedBhajan.deity && (
                    <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                      🙏 {selectedBhajan.deity}
                    </span>
                  )}
                  {selectedBhajan.category && (
                    <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                      📖 {selectedBhajan.category}
                    </span>
                  )}
                  {selectedBhajan.author && (
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      ✍️ {selectedBhajan.author}
                    </span>
                  )}
                  {selectedBhajan.language && (
                    <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                      🌐 {selectedBhajan.language}
                    </span>
                  )}
                </div>
              </div>

              {/* Lyrics */}
              <div className="prose prose-lg max-w-none">
                <div className="text-xl leading-loose text-amber-800 whitespace-pre-line text-center font-light tracking-wide">
                  {selectedBhajan.lyrics}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 pt-8 border-t border-orange-200 flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => navigator.clipboard.writeText(selectedBhajan.lyrics)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Text
                </button>
                
                <button 
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>

              {/* Source Info */}
              {selectedBhajan.source && (
                <div className="mt-8 text-center text-sm text-amber-600">
                  Source: {selectedBhajan.source}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}