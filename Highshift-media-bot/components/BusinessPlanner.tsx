
import React, { useState, useRef, useEffect } from 'react';
import { BUSINESS_PLAN_QUESTIONS, BrandLogo } from '../constants';
import { generateBusinessPlan } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface BusinessPlannerProps {
    onRestart: () => void;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
             <div className="absolute inset-0 rounded-full border-4 border-sky-500/10" />
             <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 animate-spin" />
        </div>
        <p className="text-sm font-bold text-sky-400/80 uppercase tracking-widest animate-pulse">Consulting AI...</p>
    </div>
);


export const BusinessPlanner: React.FC<BusinessPlannerProps> = ({ onRestart }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [businessPlan, setBusinessPlan] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentQuestionIndex]);


    const handleNextQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentInput.trim() === '') return;

        const newAnswers = [...answers, currentInput];
        setAnswers(newAnswers);
        setCurrentInput('');

        if (currentQuestionIndex < BUSINESS_PLAN_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setIsLoading(true);
            const plan = await generateBusinessPlan(newAnswers);
            setBusinessPlan(plan);
            setIsLoading(false);
        }
    };

    const progress = Math.round(((currentQuestionIndex + 1) / BUSINESS_PLAN_QUESTIONS.length) * 100);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-5xl h-[85vh] max-h-[850px] glass-panel rounded-[2.5rem] shadow-2xl flex flex-col border-white/5 overflow-hidden">
                <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center flex-shrink-0 bg-white/5">
                    <div className="flex items-center gap-4">
                        <BrandLogo className="h-12 w-12" />
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white leading-none">AI Business Architect</h2>
                            <p className="text-[11px] font-bold text-sky-400/80 uppercase tracking-widest mt-1.5">Strategy Powered by Highshift</p>
                        </div>
                    </div>
                    <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Back</button>
                </header>

                <div className="flex-1 p-10 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingIndicator />
                        </div>
                    ) : businessPlan ? (
                        <div className="prose prose-invert prose-sky max-w-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{businessPlan}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
                            <div className="mb-10">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em]">Step {currentQuestionIndex + 1} / {BUSINESS_PLAN_QUESTIONS.length}</span>
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{progress}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5 overflow-hidden">
                                    <div className="bg-sky-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(14,165,233,0.5)]" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-10 leading-tight tracking-tight animate-in fade-in slide-in-from-left-4 duration-500">
                                {BUSINESS_PLAN_QUESTIONS[currentQuestionIndex]}
                            </h3>
                        </div>
                    )}
                </div>
                
                {!businessPlan && !isLoading && (
                    <div className="p-8 border-t border-white/5 bg-white/5 flex-shrink-0">
                        <form onSubmit={handleNextQuestion} className="max-w-3xl mx-auto flex items-center gap-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                placeholder="Type your strategic insight here..."
                                className="w-full bg-white/5 text-white placeholder-white/20 rounded-2xl py-5 px-8 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-lg"
                            />
                            <button
                                type="submit"
                                disabled={!currentInput.trim()}
                                className="bg-sky-500 text-white rounded-2xl p-5 hover:bg-sky-400 transition-all duration-300 shadow-lg shadow-sky-500/20 disabled:bg-white/10 disabled:text-white/20 disabled:shadow-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
