// DOM Elements
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const resultsContainer = document.getElementById('results-container');
        const wordTitle = document.getElementById('word-title');
        const pronunciation = document.getElementById('pronunciation');
        const audioButton = document.getElementById('audio-button');
        const meaningsContainer = document.getElementById('meanings-container');
        const errorMessage = document.getElementById('error-message');
        const loadingIndicator = document.getElementById('loading');

        // Audio object for pronunciation
        let audioElement = null;

        // API endpoint
        const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

        // Event Listeners
        searchForm.addEventListener('submit', handleSearch);
        audioButton.addEventListener('click', playPronunciation);

        // Function to handle the search
        async function handleSearch(event) {
            event.preventDefault();
            
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                showError('Please enter a word to search');
                return;
            }
            
            try {
                showLoading();
                hideError();
                hideResults();
                
                const data = await fetchWordData(searchTerm);
                displayResults(data);
            } catch (error) {
                showError(error.message || 'An error occurred while searching');
            } finally {
                hideLoading();
            }
        }

        // Function to fetch data from API
        async function fetchWordData(word) {
            try {
                const response = await fetch(`${API_URL}${encodeURIComponent(word)}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`No definitions found for "${word}"`);
                    } else {
                        throw new Error('Failed to fetch data from dictionary API');
                    }
                }
                
                return await response.json();
            } catch (error) {
                throw error;
            }
        }

        // Function to display results
        function displayResults(data) {
            if (!data || !Array.isArray(data) || data.length === 0) {
                showError('No results found');
                return;
            }
            
            const wordData = data[0];
            
            // Display word title
            wordTitle.textContent = wordData.word;
            
            // Display phonetics
            let phoneticsText = '';
            let audioUrl = '';
            
            if (wordData.phonetics && wordData.phonetics.length > 0) {
                // Find a phonetic entry with both text and audio if possible
                for (const phonetic of wordData.phonetics) {
                    if (phonetic.text) {
                        phoneticsText = phonetic.text;
                    }
                    if (phonetic.audio && !audioUrl) {
                        audioUrl = phonetic.audio;
                    }
                    if (phoneticsText && audioUrl) break;
                }
            }
            
            pronunciation.textContent = phoneticsText;
            
            // Setup audio
            if (audioUrl) {
                audioElement = new Audio(audioUrl);
                audioButton.style.display = 'flex';
            } else {
                audioButton.style.display = 'none';
            }
            
            // Display meanings
            displayMeanings(wordData.meanings);
            
            // Show results
            showResults();
        }

        // Function to display meanings
        function displayMeanings(meanings) {
            meaningsContainer.innerHTML = '';
            
            if (!meanings || meanings.length === 0) {
                return;
            }
            
            meanings.forEach(meaning => {
                const meaningSection = document.createElement('section');
                meaningSection.className = 'meaning-section';
                
                // Part of speech
                const partOfSpeech = document.createElement('h3');
                partOfSpeech.className = 'part-of-speech';
                partOfSpeech.textContent = meaning.partOfSpeech;
                meaningSection.appendChild(partOfSpeech);
                
                // Definitions
                if (meaning.definitions && meaning.definitions.length > 0) {
                    const definitionsList = document.createElement('ol');
                    definitionsList.className = 'definitions-list';
                    
                    meaning.definitions.forEach(def => {
                        const definitionItem = document.createElement('li');
                        definitionItem.className = 'definition-item';
                        definitionItem.textContent = def.definition;
                        
                        // Example if available
                        if (def.example) {
                            const example = document.createElement('p');
                            example.className = 'example';
                            example.textContent = `"${def.example}"`;
                            definitionItem.appendChild(example);
                        }
                        
                        definitionsList.appendChild(definitionItem);
                    });
                    
                    meaningSection.appendChild(definitionsList);
                }
                
                // Synonyms
                if (meaning.synonyms && meaning.synonyms.length > 0) {
                    const synonymsContainer = document.createElement('div');
                    synonymsContainer.className = 'synonyms';
                    
                    const synonymsTitle = document.createElement('h4');
                    synonymsTitle.textContent = 'Synonyms:';
                    synonymsContainer.appendChild(synonymsTitle);
                    
                    meaning.synonyms.forEach(synonym => {
                        const synonymTag = document.createElement('span');
                        synonymTag.className = 'synonym-tag';
                        synonymTag.textContent = synonym;
                        synonymsContainer.appendChild(synonymTag);
                    });
                    
                    meaningSection.appendChild(synonymsContainer);
                }
                
                // Antonyms
                if (meaning.antonyms && meaning.antonyms.length > 0) {
                    const antonymsContainer = document.createElement('div');
                    antonymsContainer.className = 'antonyms';
                    
                    const antonymsTitle = document.createElement('h4');
                    antonymsTitle.textContent = 'Antonyms:';
                    antonymsContainer.appendChild(antonymsTitle);
                    
                    meaning.antonyms.forEach(antonym => {
                        const antonymTag = document.createElement('span');
                        antonymTag.className = 'antonym-tag';
                        antonymTag.textContent = antonym;
                        antonymsContainer.appendChild(antonymTag);
                    });
                    
                    meaningSection.appendChild(antonymsContainer);
                }
                
                meaningsContainer.appendChild(meaningSection);
            });
        }

        // Function to play pronunciation
        function playPronunciation() {
            if (audioElement) {
                audioElement.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
            }
        }

        // Utility functions
        function showLoading() {
            loadingIndicator.style.display = 'block';
        }

        function hideLoading() {
            loadingIndicator.style.display = 'none';
        }

        function showResults() {
            resultsContainer.style.display = 'block';
        }

        function hideResults() {
            resultsContainer.style.display = 'none';
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        function hideError() {
            errorMessage.style.display = 'none';
        }