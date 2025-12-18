
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';
import { BrandLogo, WhatsAppIcon } from '../constants';

// --- Type Definitions ---
type Transcription = {
    sender: 'user' | 'bot';
    text: string;
    isFinal: boolean;
};
type AgentStatus = 'idle' | 'listening' | 'speaking' | 'connecting' | 'error';

// --- Audio Utility Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): GenAiBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const VoiceAgent: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
    const [status, setStatus] = useState<AgentStatus>('idle');
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const stopConversation = useCallback((closeSession = true) => {
        if (closeSession && sessionRef.current) {
           sessionRef.current.close();
        }
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }

        sessionRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamRef.current = null;
        setStatus('idle');
    }, []);

    const startConversation = async () => {
        if (status !== 'idle' && status !== 'error') return;

        setStatus('connecting');
        setError(null);
        setTranscriptions([{ sender: 'bot', text: "Establishing Highshift secure audio link...", isFinal: true }]);

        try {
            // Browsers require AudioContext to be created/resumed on user gesture
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            await inputCtx.resume();
            await outputCtx.resume();
            
            inputAudioContextRef.current = inputCtx;
            outputAudioContextRef.current = outputCtx;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: 'You are Highshift AI, a professional consulting agent. Speak clearly, be brief, and represent Highshift Media excellence. Always be ready to help with AI automation, chatbots, or content strategy.',
                },
                callbacks: {
                    onopen: async () => {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            mediaStreamRef.current = stream;
                            
                            const source = inputCtx.createMediaStreamSource(stream);
                            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current = scriptProcessor;

                            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputCtx.destination);
                            setStatus('listening');
                        } catch (e) {
                            setError("Microphone access failed.");
                            stopConversation();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            setTranscriptions(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.sender === 'user' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: currentInputTranscriptionRef.current }];
                                }
                                return [...prev, { sender: 'user', text: currentInputTranscriptionRef.current, isFinal: false }];
                            });
                        } else if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                            setStatus('speaking');
                            setTranscriptions(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.sender === 'bot' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: currentOutputTranscriptionRef.current }];
                                }
                                return [...prev, { sender: 'bot', text: currentOutputTranscriptionRef.current, isFinal: false }];
                            });
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscriptions(prev => prev.map(t => ({...t, isFinal: true})));
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                            setStatus('listening');
                        }

                        // Handle Audio
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setStatus('listening');
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        setError('Neural link disrupted. Retrying...');
                        stopConversation();
                    },
                    onclose: () => stopConversation(false),
                }
            });
            
            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setError("Could not initiate voice protocol.");
            setStatus('error');
        }
    };

    useEffect(() => {
        return () => stopConversation();
    }, [stopConversation]);
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl h-[85vh] max-h-[750px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
                <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center flex-shrink-0 bg-white/5">
                    <div className="flex items-center gap-4">
                        <BrandLogo className="h-12 w-12" />
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight leading-none">Highshift Voice</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`h-2 w-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${status === 'listening' ? 'bg-emerald-400 shadow-emerald-400 animate-pulse' : status === 'speaking' ? 'bg-sky-400 shadow-sky-400 animate-bounce' : status === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-white/10'}`}></span>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{status}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Quit</button>
                </header>

                <div className="flex-1 px-8 py-8 space-y-6 overflow-y-auto scrollbar-hide">
                    {transcriptions.map((t, i) => (
                        <div key={i} className={`flex ${t.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                            <div className={`px-5 py-3 rounded-2xl max-w-[85%] ${t.sender === 'user' ? 'bg-sky-500/20 border border-sky-400/30 text-white rounded-br-none' : 'glass-panel border-white/10 text-white/80 rounded-bl-none'} ${!t.isFinal ? 'opacity-60 italic' : ''}`}>
                                <p className="text-[15px] leading-relaxed">{t.text}</p>
                            </div>
                        </div>
                    ))}
                    {status === 'connecting' && (
                        <div className="flex justify-center py-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-12 w-12 rounded-full border-4 border-sky-500/10 border-t-sky-500 animate-spin" />
                                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em]">Syncing Neural Engine</p>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-10 border-t border-white/5 flex flex-col items-center justify-center flex-shrink-0 bg-white/5 relative">
                    {error && (
                        <div className="absolute top-0 -translate-y-full w-full px-10 text-center pb-4">
                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>
                        </div>
                    )}
                    
                    {status === 'idle' || status === 'error' ? (
                        <button 
                            onClick={startConversation} 
                            className="group bg-sky-500 text-white font-bold py-6 px-12 rounded-3xl hover:bg-sky-400 transition-all duration-300 shadow-2xl shadow-sky-500/30 flex items-center gap-5 relative overflow-hidden active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                            INITIALIZE VOICE LINK
                        </button>
                    ) : (
                        <button 
                            onClick={() => stopConversation()} 
                            className="bg-white/5 border border-white/10 text-white/40 font-bold py-5 px-10 rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30 transition-all duration-300 flex items-center gap-4 active:scale-95"
                        >
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            END CONSULTATION
                        </button>
                    )}
                    
                    <p className="mt-8 text-[9px] font-bold text-white/10 uppercase tracking-[0.5em]">Highshift Secure Biometric Stream v2.5</p>
                </footer>
            </div>
            
            {/* Minimal WhatsApp link for persistent access */}
            <a 
                href="https://Wa.me/+16307033569" 
                target="_blank" 
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 p-4 bg-[#25D366] rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-transform z-50"
            >
                <WhatsAppIcon />
            </a>
        </div>
    );
};
