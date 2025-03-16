"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Play, Square, Download, X, Settings, Volume2, RefreshCw, Smile, Music, Type, Copy, Clock, Trash2, Search, Star, StarOff, Filter, Trash, AlertCircle, ChevronDown, BarChart2, Wand2, Sparkles, Music2, Layers, Activity, Mic2, Wind } from "lucide-react";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { ThemeToggle } from "./theme-toggle";

// We'll get available voices from the browser
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

// Enhanced voice effects with working parameters
const VOICE_EFFECTS = {
  normal: { pitch: 1, rate: 1, distortion: 0, echo: 0, reverb: 0 },
  robot: { pitch: 0.5, rate: 0.8, distortion: 0.3, echo: 0.2, reverb: 0.3 },
  chipmunk: { pitch: 2, rate: 1.5, distortion: 0.1, echo: 0, reverb: 0.1 },
  giant: { pitch: 0.6, rate: 0.7, distortion: 0.2, echo: 0.3, reverb: 0.4 },
  alien: { pitch: 1.5, rate: 0.5, distortion: 0.4, echo: 0.4, reverb: 0.5 },
  underwater: { pitch: 0.8, rate: 0.9, distortion: 0.1, echo: 0.6, reverb: 0.7 },
  ghost: { pitch: 1.2, rate: 0.7, distortion: 0.2, echo: 0.8, reverb: 0.6 },
  demon: { pitch: 0.4, rate: 0.6, distortion: 0.5, echo: 0.3, reverb: 0.8 },
};

// Simple emotion detection based on keywords
const EMOTIONS = {
  happy: ['happy', 'joy', 'great', 'excellent', 'wonderful', 'smile', 'laugh'],
  sad: ['sad', 'unhappy', 'terrible', 'awful', 'cry', 'miserable'],
  angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed'],
  surprised: ['wow', 'omg', 'amazing', 'incredible', 'surprised', 'shocked'],
  neutral: [],
};

// Text transformation presets
const TEXT_TRANSFORMS = {
  normal: (text: string) => text,
  uppercase: (text: string) => text.toUpperCase(),
  lowercase: (text: string) => text.toLowerCase(),
  capitalize: (text: string) => text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
  alternating: (text: string) => text.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join(''),
};

// Text analysis patterns
const TEXT_ANALYSIS = {
  sentiment: {
    positive: /\b(happy|good|great|excellent|wonderful|amazing|love|awesome)\b/gi,
    negative: /\b(sad|bad|terrible|awful|horrible|hate|dislike|worst)\b/gi,
    question: /\?$/,
    exclamation: /!$/,
  },
  complexity: {
    complex: /\b\w{10,}\b/g, // Words with 10+ characters
    simple: /\b\w{1,4}\b/g,  // Words with 1-4 characters
  }
};

// Add new type for history entries
type HistoryEntry = {
  id: string;
  text: string;
  audioData: Blob;
  effect: string;
  timestamp: number;
  voice: string;
  isFavorite: boolean;
  category: string;
};

// Add IndexedDB initialization
const initializeDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('TextToSpeechDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
};

// Add new voice mixing presets
const VOICE_HARMONIES = {
  solo: { voices: 1, spread: 0, detune: 0 },
  duet: { voices: 2, spread: 0.2, detune: 10 },
  trio: { voices: 3, spread: 0.3, detune: 15 },
  choir: { voices: 4, spread: 0.4, detune: 20 },
};

// Add ambient background sounds
const AMBIENT_SOUNDS = {
  none: null,
  nature: { url: '/ambient/nature.mp3', gain: 0.2 },
  space: { url: '/ambient/space.mp3', gain: 0.15 },
  dream: { url: '/ambient/dream.mp3', gain: 0.25 },
  cyber: { url: '/ambient/cyber.mp3', gain: 0.2 },
};

// Add voice modulation presets
const VOICE_MODULATIONS = {
  normal: { frequency: 0, depth: 0 },
  vibrato: { frequency: 5, depth: 0.5 },
  tremolo: { frequency: 10, depth: 0.3 },
  wobble: { frequency: 2, depth: 0.7 },
};

// Add utility function for base64 to ArrayBuffer conversion
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export default function TextToSpeechConverter() {
  const [text, setText] = useState<string>("");
  const [voice, setVoice] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<string>("speech");
  const [currentEffect, setCurrentEffect] = useState<string>("normal");
  const [detectedEmotion, setDetectedEmotion] = useState<string>("neutral");
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textTransform, setTextTransform] = useState<keyof typeof TEXT_TRANSFORMS>("normal");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [textStats, setTextStats] = useState({
    sentiment: 0,
    complexity: 0,
    readingTime: 0,
    uniqueWords: 0,
  });
  const [audioEffects, setAudioEffects] = useState({
    distortion: 0,
    echo: 0,
    reverb: 0,
  });
  const [customVoiceSettings, setCustomVoiceSettings] = useState({
    pitch: 1,
    rate: 1,
    distortion: 0,
    echo: 0,
  });
  const [harmonySettings, setHarmonySettings] = useState({
    voices: 1,
    spread: 0,
    detune: 0,
  });
  const [selectedAmbient, setSelectedAmbient] = useState<string>("none");
  const [showSpectrogram, setShowSpectrogram] = useState(false);
  const [voiceColor, setVoiceColor] = useState("#4f46e5");
  const [modulation, setModulation] = useState({
    frequency: 0,
    depth: 0,
  });
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(64).fill(0));
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationFrameRef = useRef<number>();

  // Add ref for IndexedDB
  const dbRef = useRef<IDBDatabase | null>(null);

  // Add refs for audio processing nodes
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // Add ref for oscillators
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Add spectrogram visualization refs
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { toast } = useToast();

  // Initialize IndexedDB
  useEffect(() => {
    initializeDB()
      .then((db: IDBDatabase) => {
        dbRef.current = db;
        loadHistoryFromDB();
      })
      .catch(err => console.error('Failed to initialize DB:', err));

    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create audio processing nodes
      distortionNodeRef.current = audioContext.createWaveShaper();
      delayNodeRef.current = audioContext.createDelay(2.0);
      reverbNodeRef.current = audioContext.createConvolver();
      gainNodeRef.current = audioContext.createGain();

      // Create impulse response for reverb
      const sampleRate = audioContext.sampleRate;
      const length = sampleRate * 2; // 2 seconds
      const impulse = audioContext.createBuffer(2, length, sampleRate);
      const leftChannel = impulse.getChannelData(0);
      const rightChannel = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.5));
        leftChannel[i] = (Math.random() * 2 - 1) * decay;
        rightChannel[i] = (Math.random() * 2 - 1) * decay;
      }

      reverbNodeRef.current.buffer = impulse;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (synth) {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
          setVoice(availableVoices[0].name);
        }
      }
    };

    if (synth) {
      loadVoices();
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  // Word highlighting effect
  useEffect(() => {
    if (isPlaying && text) {
      const words = text.split(' ');
      let currentIndex = 0;

      const highlightInterval = setInterval(() => {
        if (currentIndex < words.length) {
          setHighlightedWords(words.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(highlightInterval);
          setHighlightedWords([]);
        }
      }, (rate * 1000) / 3); // Adjust timing based on speech rate

      return () => clearInterval(highlightInterval);
    }
  }, [isPlaying, text, rate]);

  // Detect emotion from text
  const detectEmotion = (text: string) => {
    const words = text.toLowerCase().split(' ');
    for (const [emotion, keywords] of Object.entries(EMOTIONS)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return emotion;
      }
    }
    return 'neutral';
  };

  const updateTextStats = (newText: string) => {
    setWordCount(newText.trim() ? newText.trim().split(/\s+/).length : 0);
    setCharCount(newText.length);
  };

  // Add function to analyze text
  const analyzeText = (text: string) => {
    // Calculate sentiment (-1 to 1)
    const positiveMatches = (text.match(TEXT_ANALYSIS.sentiment.positive) || []).length;
    const negativeMatches = (text.match(TEXT_ANALYSIS.sentiment.negative) || []).length;
    const sentiment = (positiveMatches - negativeMatches) / (positiveMatches + negativeMatches || 1);

    // Calculate complexity (0 to 1)
    const complexWords = (text.match(TEXT_ANALYSIS.complexity.complex) || []).length;
    const simpleWords = (text.match(TEXT_ANALYSIS.complexity.simple) || []).length;
    const complexity = complexWords / (complexWords + simpleWords || 1);

    // Calculate reading time (in seconds)
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200 * 60); // Assuming 200 words per minute

    // Calculate unique words
    const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size;

    setTextStats({
      sentiment,
      complexity,
      readingTime,
      uniqueWords,
    });
  };

  // Modify handleTextChange to include analysis
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateTextStats(newText);
    setDetectedEmotion(detectEmotion(newText));
    analyzeText(newText);
    if (error) setError(null);
    setAudioData(null);
  };

  const transformText = (type: keyof typeof TEXT_TRANSFORMS) => {
    setTextTransform(type);
    const transformed = TEXT_TRANSFORMS[type](text);
    setText(transformed);
    updateTextStats(transformed);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      setError('Failed to copy text');
    }
  };

  const handleClearText = () => {
    setText("");
    setError(null);
    setAudioData(null);
    setHighlightedWords([]);
    setDetectedEmotion('neutral');
    if (synth) {
      synth.cancel();
    }
  };

  const handleVoiceChange = (value: string) => {
    setVoice(value);
    setAudioData(null);
    if (synth) {
      synth.cancel();
    }
  };

  const applyVoiceEffect = (effect: string) => {
    const preset = VOICE_EFFECTS[effect as keyof typeof VOICE_EFFECTS];
    setCurrentEffect(effect);
    setPitch(preset.pitch);
    setRate(preset.rate);
    setAudioEffects({
      distortion: preset.distortion,
      echo: preset.echo,
      reverb: preset.reverb,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioData(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Update the canvas creation for better dark mode visibility
  const createDistortionCurve = (amount: number): Float32Array => {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  };

  // Add this function to create audio analyzer
  const createAudioAnalyzer = () => {
    if (!audioContextRef.current) return null;
    
    const analyzer = audioContextRef.current.createAnalyser();
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.8;
    return analyzer;
  };

  // Enhanced animation with theme-aware colors and transitions
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrame: number;
      let startTime = Date.now();
      
      // Animation function for bar chart visualization
      const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;

        // Get canvas dimensions
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear the canvas
        ctx.clearRect(0, 0, width, height);
        
        // Use a transparent background so the canvas background class can show through
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate time-based values for animation
        const now = Date.now();
        const elapsed = now - startTime;
        
        // Number of bars to display
        const barCount = 32;
        const barSpacing = 2;
        const barWidth = (width / barCount) - barSpacing;
        
        // Generate voice level data
        const levels = Array(barCount).fill(0).map((_, i) => {
          // If we're generating speech or playing audio, create dynamic levels
          if (isGenerating || isPlaying) {
            // Create a realistic-looking audio spectrum
            let level;
            
            if (isGenerating) {
              // When generating, create a pattern that follows progress
              const progressFactor = Math.min(1, progress / 100);
              const wordPulseFactor = 0.5 + Math.sin(now * 0.003 + i * 0.2) * 0.5;
              const frequencyResponse = Math.sin(Math.PI * (i / barCount)) * 1.2; // Mid frequencies higher
              
              level = height * 0.7 * progressFactor * wordPulseFactor * frequencyResponse;
            } else {
              // When playing, create a more varied pattern
              const time = elapsed * 0.001;
              const baseFactor = 0.3 + Math.sin(time * 2 + i * 0.3) * 0.2;
              const randomFactor = 0.2 + Math.random() * 0.2;
              
              // Shape the spectrum to look like a voice (mid-frequencies higher)
              const frequencyFactor = i < barCount / 2 ?
                Math.sin((i / (barCount / 2)) * (Math.PI / 2)) :
                Math.sin(((barCount - i) / (barCount / 2)) * (Math.PI / 2));
              
              level = height * 0.7 * baseFactor * randomFactor * frequencyFactor;
            }
            
            // Add a slight randomness for natural look
            level *= (0.9 + Math.random() * 0.2);
            
            return level;
          }
          
          // If not active, return minimal level for a subtle idle animation
          return height * 0.05 * (0.5 + Math.sin(elapsed * 0.001 + i * 0.3) * 0.5);
        });
        
        // Draw the bars with a gradient
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + barSpacing);
          const barHeight = Math.max(4, levels[i]); // Ensure minimum height for visibility
          
          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Indigo color at bottom
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.9)'); // Purple color at top
          
          // Draw bar with rounded top
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(x, height - barHeight + 4);
          ctx.arc(x + barWidth/2, height - barHeight + 4, barWidth/2, Math.PI, 0, true);
          ctx.lineTo(x + barWidth, height);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Continue animation
        animationFrame = requestAnimationFrame(animate);
      };
      
      // Start animation if generating or audio is available
      if (isGenerating || audioData) {
        animate();
      }
      
      // Cleanup on unmount
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isGenerating, isPlaying, audioData, progress]);

  // Load history from IndexedDB
  const loadHistoryFromDB = () => {
    if (!dbRef.current) return;

    const transaction = dbRef.current.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result;
      setHistory(entries);
    };

    request.onerror = () => {
      console.error('Failed to load history:', request.error);
    };
  };

  // Save entry to IndexedDB
  const saveEntryToDB = (entry: HistoryEntry) => {
    if (!dbRef.current) return;

    const transaction = dbRef.current.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    
    const request = store.put(entry);

    request.onerror = () => {
      console.error('Failed to save entry:', request.error);
    };
  };

  // Delete entry from IndexedDB
  const deleteEntryFromDB = (id: string) => {
    if (!dbRef.current) return;

    const transaction = dbRef.current.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    
    const request = store.delete(id);

    request.onerror = () => {
      console.error('Failed to delete entry:', request.error);
    };
  };

  // Clear all entries from IndexedDB
  const clearAllEntriesFromDB = () => {
    if (!dbRef.current) return;

    const transaction = dbRef.current.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    
    const request = store.clear();

    request.onerror = () => {
      console.error('Failed to clear history:', request.error);
    };
  };

  // Update delete history entry
  const deleteHistoryEntry = (id: string) => {
    deleteEntryFromDB(id);
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  // Update clear all history
  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearAllEntriesFromDB();
      setHistory([]);
    }
  };

  // Update toggle favorite
  const toggleFavorite = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, isFavorite: !entry.isFavorite };
          saveEntryToDB(updatedEntry);
          return updatedEntry;
        }
        return entry;
      });
      return newHistory;
    });
  };

  // Update category change
  const updateCategory = (id: string, category: string) => {
    setHistory(prev => {
      const newHistory = prev.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, category };
          saveEntryToDB(updatedEntry);
          return updatedEntry;
        }
        return entry;
      });
      return newHistory;
    });
  };

  // Update playStoredSpeech to use a simplified approach for audio analysis
  const playStoredSpeech = async () => {
    if (!audioData || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const arrayBuffer = await audioData.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      // Create source
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      // Store the source for stop functionality
      audioSourceRef.current = source;
      
      // Create effects chain
      const gainNode = ctx.createGain();
      const distortionNode = ctx.createWaveShaper();
      const delayNode = ctx.createDelay();
      
      // Apply effects based on current settings
      distortionNode.curve = createDistortionCurve(audioEffects.distortion * 400);
      delayNode.delayTime.value = audioEffects.echo * 0.5;
      gainNode.gain.value = volume;
      
      // Apply modulation
      const modulatedSource = applyModulation(source);
      
      // Connect nodes
      modulatedSource.connect(distortionNode);
      distortionNode.connect(delayNode);
      delayNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start playback
      source.start(0);
      setIsPlaying(true);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  // Update modulation processing to store oscillator reference
  const applyModulation = (source: AudioBufferSourceNode) => {
    if (!audioContextRef.current || modulation.frequency === 0) return source;

    const ctx = audioContextRef.current;
    const modulatorGain = ctx.createGain();
    const oscillator = ctx.createOscillator();
    
    // Store oscillator reference for cleanup
    oscillatorRef.current = oscillator;
    
    oscillator.frequency.value = modulation.frequency;
    modulatorGain.gain.value = modulation.depth;
    
    oscillator.connect(modulatorGain);
    modulatorGain.connect(source.playbackRate);
    oscillator.start();
    
    return source;
  };

  // Update stopSpeech to reset audio levels
  const stopSpeech = () => {
    // Stop speech synthesis if active
    if (synth) {
      synth.cancel();
    }
    
    // Stop oscillator if active
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        console.error('Error stopping oscillator:', error);
      }
    }
    
    // Stop audio playback if active
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      } catch (error) {
        console.error('Error stopping audio source:', error);
      }
    }
    
    // Stop recording if active
    stopRecording();
    
    // Reset UI state
    setIsGenerating(false);
    setIsPlaying(false);
    setHighlightedWords([]);
    
    // Reset audio levels
    setAudioLevels(Array(64).fill(0));
    
    // Log status
    console.log('Audio playback stopped');
  };

  const downloadAudio = () => {
    if (!audioData) return;

    const url = URL.createObjectURL(audioData);
          const a = document.createElement("a");
    a.href = url;
    a.download = `speech-${currentEffect}-${Date.now()}.wav`;
          document.body.appendChild(a);
          a.click();
            document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderText = () => {
    if (!text) return null;
    
    const words = text.split(' ');
    return words.map((word, index) => (
      <span
        key={index}
        className={`inline-block ${
          highlightedWords.includes(word)
            ? 'bg-blue-200 dark:bg-blue-800 transition-colors duration-200'
            : ''
        }`}
      >
        {word}{' '}
      </span>
    ));
  };

  // Filter history based on search, category, and favorites
  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || entry.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  // Add categories
  const categories = ["all", "business", "personal", "notes", "other"];

  // Add custom voice effect creator
  const createCustomEffect = () => {
    setCustomVoiceSettings({
      pitch: Math.random() * 1.5 + 0.5,
      rate: Math.random() * 1.5 + 0.5,
      distortion: Math.random() * 0.5,
      echo: Math.random() * 0.5,
    });
  };

  // Add new randomize function that properly applies effects
  const randomizeVoiceEffect = () => {
    const randomPitch = Math.random() * 2 + 0.5; // Range: 0.5 to 2.5
    const randomRate = Math.random() * 1.5 + 0.5; // Range: 0.5 to 2
    const randomDistortion = Math.random(); // Range: 0 to 1
    const randomEcho = Math.random(); // Range: 0 to 1
    const randomReverb = Math.random(); // Range: 0 to 1

    setPitch(randomPitch);
    setRate(randomRate);
    setAudioEffects({
      distortion: randomDistortion,
      echo: randomEcho,
      reverb: randomReverb
    });

    // Set custom effect as current
    setCurrentEffect('custom');
  };

  // Update generateSpeech to simulate audio levels during generation
  const generateSpeech = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    if (!synth) {
      setError("Text-to-speech is not supported in your browser");
      return;
    }

    try {
      setIsGenerating(true);
      setIsPlaying(true);
      setError(null);
      setAudioData(null);
      setProgress(0);

      await startRecording();

      // Start audio level simulation for visualization
      let simulationInterval: NodeJS.Timeout | null = null;
      
      const simulateAudioLevels = () => {
        // Create a simulation of audio levels based on the current progress
        // This simulates voice activity patterns during speech generation
        const amplitudeFactor = Math.min(1, progress / 25); // Ramp up amplitude at start
        const wordPulseFactor = Math.sin(Date.now() * 0.003) * 0.5 + 0.5; // Word rhythm simulation
        
        const levels = Array(64).fill(0).map((_, i) => {
          // Create a realistic pattern that varies across frequency spectrum
          // Lower frequencies (beginning of array) generally have higher amplitude in speech
          const frequencyFactor = 1 - (i / 64) * 0.5;
          
          // Add some randomness for natural variation
          const randomness = Math.random() * 20;
          
          // Combine factors into a realistic level simulation
          const level = (50 + randomness) * frequencyFactor * amplitudeFactor * (0.7 + wordPulseFactor * 0.3);
          
          return Math.min(255, Math.max(0, Math.floor(level)));
        });
        
        setAudioLevels(levels);
      };
      
      // Update simulation frequently for smooth animation
      simulationInterval = setInterval(simulateAudioLevels, 50);

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const words = text.split(' ').length;
      let wordIndex = 0;

      utterance.onboundary = (event) => {
        wordIndex++;
        setProgress(Math.min((wordIndex / words) * 100, 100));
      };

      const speechPromise = new Promise<void>((resolve, reject) => {
        utterance.onend = () => {
          // Clear simulation interval
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }
          
          stopRecording();
          setIsPlaying(false);
          setHighlightedWords([]);
          setProgress(100);
          
          // Gradually fade out audio levels
          const fadeOut = () => {
            setAudioLevels(prev => {
              const newLevels = [...prev].map(level => Math.max(0, level - 10));
              if (newLevels.every(level => level === 0)) {
                return newLevels;
              } else {
                setTimeout(fadeOut, 50);
                return newLevels;
              }
            });
          };
          
          setTimeout(fadeOut, 200);
          resolve();
        };
        utterance.onerror = (event) => {
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }
          reject(event);
        };
      });

      if (synth) {
        synth.speak(utterance);
        await speechPromise;
      }

      // Save to history after successful generation
      if (audioData) {
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          text,
          audioData,
          effect: currentEffect,
          timestamp: Date.now(),
          voice,
          isFavorite: false,
          category: 'other',
        };
        saveEntryToDB(newEntry);
        setHistory(prev => [newEntry, ...prev].slice(0, 50));
      }

      setIsGenerating(false);
    } catch (err) {
      stopRecording();
      setIsPlaying(false);
      setHighlightedWords([]);
      setProgress(0);
      setError(err instanceof Error ? err.message : "Failed to generate speech");
      setIsGenerating(false);
      setAudioLevels(Array(64).fill(0)); // Reset audio levels on error
    }
  };

  // Function to apply audio effects
  const applyAudioEffects = async (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current || !distortionNodeRef.current || !delayNodeRef.current || !reverbNodeRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    audioSourceRef.current = source;

    // Configure distortion
    const distortion = distortionNodeRef.current;
    distortion.curve = createDistortionCurve(audioEffects.distortion * 400);
    distortion.oversample = '4x';

    // Configure delay (echo)
    const delay = delayNodeRef.current;
    delay.delayTime.value = audioEffects.echo * 0.5;

    // Configure reverb
    const reverb = reverbNodeRef.current;
    const gain = gainNodeRef.current;
    gain.gain.value = audioEffects.reverb;

    // Connect nodes
    source.connect(distortion);
    distortion.connect(delay);
    delay.connect(reverb);
    reverb.connect(gain);
    gain.connect(ctx.destination);

    // Add feedback for echo
    if (audioEffects.echo > 0) {
      const feedback = ctx.createGain();
      feedback.gain.value = audioEffects.echo * 0.4;
      delay.connect(feedback);
      feedback.connect(delay);
    }

    return source;
  };

  // Add new audio processing function
  const createVoiceHarmony = async (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const voices: AudioBufferSourceNode[] = [];
    
    // Create multiple voices with slight variations
    for (let i = 0; i < harmonySettings.voices; i++) {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      // Add pitch shifting
      const pitchShift = ctx.createBiquadFilter();
      pitchShift.type = 'allpass';
      pitchShift.frequency.value = 440 * Math.pow(2, (i * harmonySettings.detune) / 1200);
      
      // Add stereo spreading
      const panner = ctx.createStereoPanner();
      panner.pan.value = (i / (harmonySettings.voices - 1) - 0.5) * harmonySettings.spread;
      
      source.connect(pitchShift);
      pitchShift.connect(panner);
      panner.connect(ctx.destination);
      
      voices.push(source);
    }
    
    return voices;
  };

  // Add spectrogram visualization
  const initSpectrogram = () => {
    if (!audioContextRef.current || !spectrogramRef.current) return;
    
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    
    const canvas = spectrogramRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Text to Speech</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {detectedEmotion !== 'neutral' && (
            <Badge variant="secondary" className="text-sm">
              <Smile className="w-4 h-4 mr-1" />
              {detectedEmotion}
            </Badge>
          )}
          <Badge variant="outline" className="text-sm">
            <Type className="w-4 h-4 mr-1" />
            {wordCount} words
          </Badge>
          <Badge variant="outline" className="text-sm">
            {charCount} chars
          </Badge>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="dark:border-gray-700">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="speech">
            <Volume2 className="w-4 h-4 mr-2" />
            Speech
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Wand2 className="w-4 h-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart2 className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="speech" className="space-y-4">
          <div className="relative">
      <Textarea
              ref={textareaRef}
        value={text}
        onChange={handleTextChange}
              placeholder="Enter text here..."
        rows={5}
              className="w-full font-mono dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => transformText('normal')}
              variant={textTransform === 'normal' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              Normal
            </Button>
            <Button
              onClick={() => transformText('uppercase')}
              variant={textTransform === 'uppercase' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              UPPERCASE
            </Button>
            <Button
              onClick={() => transformText('lowercase')}
              variant={textTransform === 'lowercase' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              lowercase
            </Button>
            <Button
              onClick={() => transformText('capitalize')}
              variant={textTransform === 'capitalize' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              Capitalize Words
            </Button>
            <Button
              onClick={() => transformText('alternating')}
              variant={textTransform === 'alternating' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              aLtErNaTiNg
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="ml-auto dark:border-gray-700"
            >
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => applyVoiceEffect('normal')}
              variant={currentEffect === 'normal' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              Normal
            </Button>
            <Button
              onClick={() => applyVoiceEffect('robot')}
              variant={currentEffect === 'robot' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              🤖 Robot
            </Button>
            <Button
              onClick={() => applyVoiceEffect('chipmunk')}
              variant={currentEffect === 'chipmunk' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              🐿️ Chipmunk
            </Button>
            <Button
              onClick={() => applyVoiceEffect('giant')}
              variant={currentEffect === 'giant' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              🗿 Giant
            </Button>
            <Button
              onClick={() => applyVoiceEffect('alien')}
              variant={currentEffect === 'alien' ? 'default' : 'outline'}
              size="sm"
              className="dark:border-gray-700"
            >
              👽 Alien
            </Button>
          </div>

      <Select onValueChange={handleVoiceChange} value={voice}>
            <SelectTrigger className="dark:border-gray-700">
              <SelectValue placeholder="Select voice" />
        </SelectTrigger>
        <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.name} value={v.name}>
                  {v.name} ({v.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex gap-2">
            {!isGenerating ? (
              <Button onClick={generateSpeech} disabled={!text.trim()} className="flex-1">
                <Play className="w-4 h-4 mr-2" /> Generate Speech
      </Button>
            ) : (
              <Button onClick={stopSpeech} variant="destructive" className="flex-1">
                <Square className="w-4 h-4 mr-2" /> Stop
      </Button>
            )}
            <Button onClick={handleClearText} variant="outline" className="dark:border-gray-700">
              <X className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>

          {(isGenerating || audioData) && (
            <Card className="dark:border-gray-700 overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    width={600}
                    height={200}
                  />
                  {isGenerating && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ 
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
                
                {isGenerating && (
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        background: "hsl(var(--primary))",
                        boxShadow: "0 0 10px hsla(var(--primary) / 0.5)"
                      }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7] 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        background: "hsl(var(--primary))",
                        boxShadow: "0 0 10px hsla(var(--primary) / 0.5)"
                      }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7] 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        delay: 0.2,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        background: "hsl(var(--primary))",
                        boxShadow: "0 0 10px hsla(var(--primary) / 0.5)"
                      }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7] 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        delay: 0.4,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.span 
                      className="ml-2 text-sm text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      Generating speech...
                    </motion.span>
                  </motion.div>
                )}

                {audioData && !isGenerating && (
                  <motion.div 
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Button 
                      onClick={isPlaying ? stopSpeech : playStoredSpeech} 
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Square className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Play className="h-4 w-4" />
                        </motion.div>
                      )}
                      {isPlaying ? "Stop" : "Play"}
                    </Button>
                    <Button onClick={downloadAudio} variant="secondary">
                      <Download className="w-4 w-4 mr-2" /> Download WAV
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card className="dark:border-gray-700">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Effects</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VOICE_EFFECTS).map(([name, settings]) => (
                    <Button
                      key={name}
                      onClick={() => applyVoiceEffect(name)}
                      variant={currentEffect === name ? 'default' : 'outline'}
                      className="w-full dark:border-gray-700"
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Custom Effect</label>
                  <Button onClick={randomizeVoiceEffect} variant="outline" size="sm" className="dark:border-gray-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Randomize
                  </Button>
                </div>
                <div className="space-y-4">
        <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Pitch</label>
                    <Slider
                      value={[pitch]}
                      onValueChange={([value]) => setPitch(value)}
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      className="dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Rate</label>
                    <Slider
                      value={[rate]}
                      onValueChange={([value]) => setRate(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Distortion</label>
                    <Slider
                      value={[audioEffects.distortion]}
                      onValueChange={([value]) => setAudioEffects(prev => ({ ...prev, distortion: value }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Echo</label>
                    <Slider
                      value={[audioEffects.echo]}
                      onValueChange={([value]) => setAudioEffects(prev => ({ ...prev, echo: value }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Reverb</label>
                    <Slider
                      value={[audioEffects.reverb]}
                      onValueChange={([value]) => setAudioEffects(prev => ({ ...prev, reverb: value }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Harmonization</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VOICE_HARMONIES).map(([name, settings]) => (
                    <Button
                      key={name}
                      onClick={() => setHarmonySettings(settings)}
                      variant={harmonySettings.voices === settings.voices ? 'default' : 'outline'}
                      className="w-full dark:border-gray-700"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ambient Background</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(AMBIENT_SOUNDS).map(([name]) => (
                    <Button
                      key={name}
                      onClick={() => setSelectedAmbient(name)}
                      variant={selectedAmbient === name ? 'default' : 'outline'}
                      className="w-full"
                    >
                      <Music2 className="w-4 h-4 mr-2" />
                      {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {showSpectrogram && (
                  <div className="relative">
                    <canvas
                      ref={spectrogramRef}
                      className="w-full h-32 bg-black dark:bg-black rounded-lg"
                      width={600}
                      height={200}
                    />
        </div>
      )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Modulation</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VOICE_MODULATIONS).map(([name, settings]) => (
                    <Button
                      key={name}
                      onClick={() => setModulation(settings)}
                      variant={modulation.frequency === settings.frequency ? 'default' : 'outline'}
                      className="w-full dark:border-gray-700"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Button>
                  ))}
                </div>
                {modulation.frequency > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Frequency</label>
                      <Slider
                        value={[modulation.frequency]}
                        onValueChange={([value]) => setModulation(prev => ({ ...prev, frequency: value }))}
                        min={0}
                        max={20}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Depth</label>
                      <Slider
                        value={[modulation.depth]}
                        onValueChange={([value]) => setModulation(prev => ({ ...prev, depth: value }))}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="dark:border-gray-700">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sentiment</label>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        textStats.sentiment > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.abs(textStats.sentiment) * 100}%`,
                        marginLeft: textStats.sentiment < 0 ? 'auto' : '0',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Complexity</label>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${textStats.complexity * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Badge variant="outline" className="flex justify-between items-center dark:border-gray-700">
                  <span>Reading Time</span>
                  <span>{textStats.readingTime}s</span>
                </Badge>
                <Badge variant="outline" className="flex justify-between items-center dark:border-gray-700">
                  <span>Unique Words</span>
                  <span>{textStats.uniqueWords}</span>
                </Badge>
              </div>

              {text.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    This text appears to be{' '}
                    {textStats.complexity > 0.7
                      ? 'complex'
                      : textStats.complexity > 0.3
                      ? 'moderate'
                      : 'simple'}{' '}
                    with a{' '}
                    {textStats.sentiment > 0.3
                      ? 'positive'
                      : textStats.sentiment < -0.3
                      ? 'negative'
                      : 'neutral'}{' '}
                    tone.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
