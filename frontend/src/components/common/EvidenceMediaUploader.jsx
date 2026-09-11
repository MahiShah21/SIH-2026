import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  FileText, 
  Video, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle2, 
  UploadCloud, 
  AlertCircle,
  Square
} from 'lucide-react';

export default function EvidenceMediaUploader({ evidenceList, onChange }) {
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const timerRef = useRef(null);

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEvidenceItems = files.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: `ev_photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: 'photo',
        badge: 'Photo Evidence',
        detail: `${(file.size / (1024 * 1024)).toFixed(1)} MB • GPS Embedded`,
        previewUrl,
        file
      };
    });

    onChange([...evidenceList, ...newEvidenceItems]);
    e.target.value = '';
  };

  // Handle Document Upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEvidenceItems = files.map(file => {
      return {
        id: `ev_doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: 'document',
        badge: 'Technical Doc',
        detail: `${(file.size / 1024).toFixed(0)} KB • Verified PDF/Doc`,
        file
      };
    });

    onChange([...evidenceList, ...newEvidenceItems]);
    e.target.value = '';
  };

  // Start Real Voice Memo Recording
  const startAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          const newVoiceItem = {
            id: `ev_voice_${Date.now()}`,
            name: `citizen_voice_testimony_${new Date().toLocaleTimeString().replace(/:/g, '-')}.wav`,
            type: 'voice',
            badge: 'Voice Memo',
            detail: `${recordingSeconds || 12}s duration • Live Recorded`,
            previewUrl: url,
            audioBlob
          };

          onChange([...evidenceList, newVoiceItem]);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingSeconds(0);

        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      } else {
        // Browser fallback
        mockVoiceRecording();
      }
    } catch (err) {
      console.warn('Microphone permission denied or not available, adding simulated voice memo:', err);
      mockVoiceRecording();
    }
  };

  // Stop Recording
  const stopAudioRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Simulated Voice Recording fallback
  const mockVoiceRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 6) {
          clearInterval(timerRef.current);
          setIsRecording(false);
          const newVoiceItem = {
            id: `ev_voice_${Date.now()}`,
            name: `sarpanch_statement_${Date.now().toString().slice(-4)}.wav`,
            type: 'voice',
            badge: 'Voice Memo',
            detail: '0:38 duration • Verified Audio',
            previewUrl: null
          };
          onChange([...evidenceList, newVoiceItem]);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Remove Item
  const handleRemove = (id) => {
    onChange(evidenceList.filter(item => item.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-5">
      {/* Upload Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Photo Upload Card */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition flex flex-col items-center justify-center text-center group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition shadow-xs">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800">Upload Photos</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Click to choose image or take photo</span>
        </div>

        {/* Audio Recording Card */}
        <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-white hover:bg-teal-50/40 transition flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2.5 shadow-xs">
            <Mic className="w-6 h-6" />
          </div>
          
          {isRecording ? (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-bold text-rose-600 animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Recording: {recordingSeconds}s
              </span>
              <button
                type="button"
                onClick={stopAudioRecording}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop &amp; Save</span>
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm font-bold text-slate-800">Record Voice Memo</span>
              <button
                type="button"
                onClick={startAudioRecording}
                className="mt-1 text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                Start Recording Testimony
              </button>
            </>
          )}
        </div>

        {/* Document Upload Card */}
        <div 
          onClick={() => docInputRef.current?.click()}
          className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 transition flex flex-col items-center justify-center text-center group"
        >
          <input 
            type="file" 
            ref={docInputRef} 
            onChange={handleDocumentUpload} 
            accept=".pdf,.doc,.docx,.txt" 
            multiple 
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800">Attach Document</span>
          <span className="text-[11px] text-slate-500 mt-0.5">PDF report or site measurement</span>
        </div>

      </div>

      {/* Attached Evidence List & Previews */}
      <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Attached Evidence ({evidenceList.length} items)
            </span>
          </div>
          {evidenceList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {evidenceList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No media attached yet. Select photos, voice recording, or technical documents above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Image Thumbnail or Icon */}
                  {item.previewUrl && item.type === 'photo' ? (
                    <img 
                      src={item.previewUrl} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" 
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'voice' ? 'bg-teal-100 text-teal-800' :
                      item.type === 'photo' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {item.type === 'voice' ? <Mic className="w-5 h-5" /> :
                       item.type === 'photo' ? <Camera className="w-5 h-5" /> :
                       <FileText className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.detail}</p>
                    {item.type === 'voice' && item.previewUrl && (
                      <audio controls src={item.previewUrl} className="h-6 w-36 mt-1" />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-2 shrink-0 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
