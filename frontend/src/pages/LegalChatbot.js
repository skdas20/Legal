import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import PageBackground from '../components/PageBackground';
import TypingEffect from '../components/TypingEffect';
import ReasoningDisplay from '../components/ReasoningDisplay';

const LegalChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! I\'m your AI-powered legal assistant specialized in Indian law. I can provide information about Indian legal matters including constitutional law, criminal law, civil law, family law, corporate law, and more. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [typingComplete, setTypingComplete] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize speech synthesis
    if (window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        setInput(transcript);
        
        // Auto-submit after a short delay
        setTimeout(() => {
          if (transcript.trim()) {
            handleSubmit();
          }
        }, 500);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
    }
    
    return () => {
      // Clean up speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Clean up speech synthesis
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Fix for scrolling issue - prevent auto-scroll on initial load
  useEffect(() => {
    // Only set initial position once after component mounts
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-scroll to bottom of messages only when new messages are added
  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, typingComplete]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    
    try {
      if (isListening) {
        console.log('Stopping speech recognition');
        recognitionRef.current.stop();
      } else {
        console.log('Starting speech recognition');
        recognitionRef.current.start();
      }
      
      setIsListening(!isListening);
    } catch (err) {
      console.error('Error toggling speech recognition:', err);
      setError(`Failed to ${isListening ? 'stop' : 'start'} listening: ${err.message}`);
    }
  };
  
  const toggleVoiceChat = () => {
    if (!speechSynthesis) {
      setError('Speech synthesis is not supported in your browser.');
      return;
    }
    
    setVoiceChatActive(!voiceChatActive);
    
    // If activating voice chat, also start listening
    if (!voiceChatActive && !isListening) {
      toggleListening();
    }
  };
  
  const speakResponse = (text) => {
    if (voiceChatActive && speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to find an Indian English voice
      const voices = speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang === 'en-IN' || voice.lang === 'hi-IN'
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      
      // Speak the response
      speechSynthesis.speak(utterance);
    }
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // If listening, stop
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    const userMessage = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuery(input);
    setInput('');
    setLoading(true);
    setError(null);
    setTypingComplete(true);
    
    try {
      const response = await aiAPI.chat(input);
      
      if (response.data.success) {
        const assistantResponse = response.data.data.response;
        setTypingComplete(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: assistantResponse,
          isTyping: true
        }]);
        
        // If voice chat is active, speak the response
        if (voiceChatActive) {
          // Wait for typing effect to complete before speaking
          setTimeout(() => {
            speakResponse(assistantResponse);
          }, 500);
        }
      } else {
        setError('Failed to get response. Please try again.');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTypingComplete = () => {
    setTypingComplete(true);
  };
  
  const toggleReasoning = () => {
    setShowReasoning(!showReasoning);
  };
  
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isLastAssistantMessage = !isUser && index === messages.length - 1;
    
    return (
      <div 
        key={index} 
        className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}
      >
        {!isUser && isLastAssistantMessage && showReasoning && (
          <ReasoningDisplay query={currentQuery} isVisible={true} />
        )}
        <div 
          className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
            isUser 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white'
          }`}
        >
          {isUser || (isLastAssistantMessage && !message.isTyping) ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isLastAssistantMessage && message.isTyping ? (
            <TypingEffect 
              text={message.content} 
              speed={30} 
              onComplete={handleTypingComplete}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderSuggestions = () => {
    const suggestions = [
      "What are my rights if I'm arrested?",
      "How do I file for divorce in India?",
      "Explain the GST registration process",
      "What are the requirements for starting a company in India?",
      "How does property inheritance work in India?"
    ];
    
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested questions:</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(suggestion);
                // Focus the input field
                document.getElementById('chat-input').focus();
              }}
              className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderVoiceChatInterface = () => {
    if (!voiceChatActive) return null;
    
    return (
      <div className="fixed bottom-24 right-8 z-50 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl p-6 flex flex-col items-center">
          <div 
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 cursor-pointer ${isListening ? 'bg-indigo-100 dark:bg-indigo-900 animate-pulse' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isListening ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {isListening ? 'Listening...' : 'Click to speak'}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleVoiceChat}
              className="p-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (input.trim()) {
                  handleSubmit();
                }
              }}
              disabled={!input.trim()}
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DigiLex Legal Assistant</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get expert legal guidance on Indian laws, regulations, and procedures.
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={toggleReasoning}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                showReasoning 
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${showReasoning ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Show Reasoning
            </button>
            <button 
              onClick={toggleVoiceChat}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                voiceChatActive 
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${voiceChatActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
              </svg>
              Voice Chat
            </button>
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-4">
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50/70 dark:bg-gray-900/70 rounded-lg"
          >
            {messages.map(renderMessage)}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center py-2">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your legal question here..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading || !typingComplete}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                isListening 
                  ? 'text-white bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'text-white bg-gray-500 hover:bg-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              disabled={loading || !typingComplete}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isListening && <span className="ml-1">Listening...</span>}
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim() || !typingComplete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          
          {messages.length <= 2 && renderSuggestions()}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>
            This AI assistant provides general legal information based on Indian law. 
            It is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
      
      {renderVoiceChatInterface()}
    </PageBackground>
  );
};

export default LegalChatbot; 