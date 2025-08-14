import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Users, Bot, ClipboardEdit, ArrowRight } from 'lucide-react';

export const PlayScreen: React.FC = () => {
    const navigate = useNavigate();

    const options = [
        {
            title: "Play Online",
            description: "Challenge another member of the academy to a live game.",
            icon: <Users size={32} className="text-primary" />,
            path: "/play/online",
            color: "border-t-primary"
        },
        {
            title: "Play Computer",
            description: "Test your skills against the powerful Stockfish AI.",
            icon: <Bot size={32} className="text-soft-emerald" />,
            path: "/play/computer",
            color: "border-t-soft-emerald"
        },
        {
            title: "Analysis Board",
            description: "Analyze your games with engine assistance.",
            icon: <ClipboardEdit size={32} className="text-highlight-amber" />,
            path: "/play/analysis",
            color: "border-t-highlight-amber"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-text-charcoal mb-8">Play Chess</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {options.map((option) => (
                    <Card 
                        key={option.title} 
                        onClick={() => navigate(option.path)}
                        className={`flex flex-col justify-between p-6 border-t-4 ${option.color}`}
                    >
                        <div>
                            <div className="mb-4">{option.icon}</div>
                            <h2 className="text-2xl font-bold text-text-charcoal">{option.title}</h2>
                            <p className="text-gray-600 mt-2 h-20">{option.description}</p>
                        </div>
                        <div className="flex justify-end items-center mt-4 font-semibold text-primary">
                            <span>Start</span>
                            <ArrowRight size={20} className="ml-2" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};