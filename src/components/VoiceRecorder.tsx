import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';


interface VoiceNote {
  id: string;
  blob: Blob;
  url: string;
  timestamp: Date;
  duration: number;
  title: string;
}

interface VoiceRecorderProps {
  section?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ section = 'General' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<VoiceNote[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Load saved recordings from localStorage on component mount
  useEffect(() => {
    try {
      const savedRecordings = localStorage.getItem(`voiceNotes_${section}`);
      if (savedRecordings) {
        const parsedRecordings = JSON.parse(savedRecordings);
        // Recreate Blob objects and URLs from stored data
        const reconstructedRecordings = parsedRecordings.map((recording: any) => {
          const arrayBuffer = new Uint8Array(recording.blobData).buffer;
          const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          return {
            ...recording,
            blob,
            url,
            timestamp: new Date(recording.timestamp)
          };
        });
        setRecordings(reconstructedRecordings);
      }
    } catch (err) {
      console.error('Error loading recordings:', err);
    }
    
    // Initialize audio player
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.addEventListener('ended', handlePlaybackEnd);
    audioPlayerRef.current.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      // Clean up event listeners and any active recording
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener('ended', handlePlaybackEnd);
        audioPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Revoke object URLs to prevent memory leaks
      recordings.forEach(recording => URL.revokeObjectURL(recording.url));
    };
  }, [section]);
  
  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentPlaybackTime(audioPlayerRef.current.currentTime);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: VoiceNote = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          timestamp: new Date(),
          duration: recordingTime,
          title: `${section} Note - ${new Date().toLocaleTimeString()}`
        };
        
        const updatedRecordings = [...recordings, newRecording];
        setRecordings(updatedRecordings);
        saveRecordingsToStorage(updatedRecordings);
        
        setRecordingTime(0);
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access your microphone. Please check permissions and try again.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playRecording = (recordingId: string) => {
    const recording = recordings.find((r) => r.id === recordingId);
    
    if (recording && audioPlayerRef.current) {
      // If something is already playing, stop it
      if (currentlyPlaying) {
        audioPlayerRef.current.pause();
      }
      
      audioPlayerRef.current.src = recording.url;
      audioPlayerRef.current.play();
      setCurrentlyPlaying(recordingId);
      setCurrentPlaybackTime(0);
    }
  };
  
  const pausePlayback = () => {
    if (audioPlayerRef.current && currentlyPlaying) {
      audioPlayerRef.current.pause();
      setCurrentlyPlaying(null);
    }
  };
  
  const handlePlaybackEnd = () => {
    setCurrentlyPlaying(null);
    setCurrentPlaybackTime(0);
  };
  
  const deleteRecording = (recordingId: string) => {
    const recording = recordings.find((r) => r.id === recordingId);
    
    // If this recording is currently playing, stop it
    if (currentlyPlaying === recordingId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setCurrentlyPlaying(null);
    }
    
    // Revoke the object URL to prevent memory leaks
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    
    const updatedRecordings = recordings.filter((r) => r.id !== recordingId);
    setRecordings(updatedRecordings);
    saveRecordingsToStorage(updatedRecordings);
  };
  
  const saveRecordingsToStorage = async (recordingsToSave: VoiceNote[]) => {
  try {
    // Convert Blob objects to array buffers for storage
    const recordingsForStorage = await Promise.all(
      recordingsToSave.map(
        (recording) =>
          new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = function () {
              const arrayBuffer = reader.result as ArrayBuffer;
              resolve({
                id: recording.id,
                blobData: Array.from(new Uint8Array(arrayBuffer)),
                timestamp: recording.timestamp.toISOString(),
                duration: recording.duration,
                title: recording.title,
              });
            };
            reader.readAsArrayBuffer(recording.blob);
          })
      )
    );
    localStorage.setItem(`voiceNotes_${section}`, JSON.stringify(recordingsForStorage));
  } catch (err) {
    console.error('Error saving recordings:', err);
  }
};
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Voice Notes
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isRecording ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
              <CircularProgress size={20} color="error" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Recording... {formatTime(recordingTime)}
              </Typography>
            </Box>
            <Tooltip title="Stop Recording">
              <IconButton 
                onClick={stopRecording} 
                color="error"
                size="small"
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              Record your thoughts about this section
            </Typography>
            <Tooltip title="Start Recording">
              <IconButton 
                onClick={startRecording} 
                color="primary"
                size="small"
              >
                <MicIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
      
      {recordings.length > 0 ? (
        <List dense>
          {recordings.map((recording) => (
            <ListItem key={recording.id} sx={{ 
              bgcolor: currentlyPlaying === recording.id ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              borderRadius: 1 
            }}>
              <ListItemText
                primary={recording.title}
                secondary={`${recording.timestamp.toLocaleString()} - ${formatTime(recording.duration)}`}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              
              {currentlyPlaying === recording.id && (
                <Box sx={{ width: '100%', maxWidth: 100, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(currentPlaybackTime / (recording.duration || 1)) * 100} 
                  />
                </Box>
              )}
              
              <ListItemSecondaryAction>
                {currentlyPlaying === recording.id ? (
                  <Tooltip title="Pause">
                    <IconButton edge="end" size="small" onClick={pausePlayback}>
                      <PauseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Play">
                    <IconButton edge="end" size="small" onClick={() => playRecording(recording.id)}>
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <IconButton edge="end" size="small" onClick={() => deleteRecording(recording.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
          No recordings yet. Click the microphone icon to start.
        </Typography>
      )}
    </Paper>
  );
};

export default VoiceRecorder; 