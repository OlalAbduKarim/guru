import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoardWrapper } from '../game/ChessBoardWrapper';
import { useStockfish } from '../../hooks/useStockfish';
import { Card } from '../ui/Card';
import { ClipboardEdit, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const EvaluationBar: React.FC<{ evaluation: string | null }> = ({ evaluation }) => {
    let score = 0;
    if (evaluation) {
        if (evaluation.startsWith('Mate')) {
            score = evaluation.includes('-') ? -100 : 100;
        } else {
            score = parseFloat(evaluation);
        }
    }

    const whiteAdvantage = Math.max(0, Math.min(100, 50 + score * 5));
    const blackAdvantage = 100 - whiteAdvantage;

    return (
        <div className="w-full h-8 flex rounded-lg overflow-hidden bg-gray-700 my-2">
            <div
                className="bg-white transition-all duration-500"
                style={{ width: `${whiteAdvantage}%` }}
            ></div>
            <div
                className="bg-black transition-all duration-500"
                style={{ width: `${blackAdvantage}%` }}
            ></div>
        </div>
    );
};


export const AnalysisScreen: React.FC = () => {
    const game = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(game.fen());
    const [history, setHistory] = useState(game.history({ verbose: true }));
    const [pgn, setPgn] = useState('');
    const { isReady, bestMove, evaluation, analyzePosition } = useStockfish();

    useEffect(() => {
        if (isReady) {
            analyzePosition(fen);
        }
    }, [fen, isReady, analyzePosition]);
    
    const loadPgn = () => {
        try {
            game.loadPgn(pgn);
            setFen(game.fen());
            setHistory(game.history({ verbose: true }));
        } catch (e) {
            console.error("Invalid PGN");
            alert("Invalid PGN string!");
        }
    };

    const handleMove = (moveIndex: number) => {
        game.reset();
        try {
            for (let i = 0; i <= moveIndex; i++) {
                game.move(history[i]);
            }
            setFen(game.fen());
        } catch(e) {
             console.error("Error replaying moves", e);
             // Reset to a known good state if history becomes invalid
             game.reset();
             setFen(game.fen());
        }
    };
    
    const currentMoveIndex = game.history().length - 1;

    return (
        <div className="p-4">
             <h1 className="text-3xl font-bold text-text-charcoal mb-4 flex items-center gap-3">
                <ClipboardEdit /> Analysis Board
            </h1>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <ChessBoardWrapper fen={fen} onMove={() => false} isMyTurn={false} />
                </div>
                <Card className="lg:w-96 p-4 space-y-4">
                    <div>
                        <label className="font-bold text-lg">Engine Analysis</label>
                        {!isReady ? (
                            <p className="text-highlight-amber">Initializing Stockfish...</p>
                        ) : (
                            <>
                               <EvaluationBar evaluation={evaluation} />
                                <div className="text-center font-mono text-lg font-bold">
                                    {evaluation ?? '...'}
                                </div>
                                <p className="text-center">Best move: <span className="font-mono">{bestMove ?? '...'}</span></p>
                            </>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="pgn" className="font-bold text-lg">Load PGN</label>
                        <textarea 
                            id="pgn"
                            value={pgn}
                            onChange={(e) => setPgn(e.target.value)}
                            className="w-full h-24 p-2 mt-2 border rounded-lg font-mono text-sm"
                            placeholder="Paste PGN here..."
                        ></textarea>
                        <button onClick={loadPgn} className="w-full mt-2 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-opacity-90">Load</button>
                    </div>

                    <div>
                         <label className="font-bold text-lg">Moves</label>
                         <div className="h-48 overflow-y-auto bg-gray-100 rounded-lg p-2 mt-2">
                             <ol className="list-decimal list-inside">
                                 {history.map((move, index) => (
                                     index % 2 === 0 && (
                                         <li key={index} className="grid grid-cols-2">
                                             <span onClick={() => handleMove(index)} className={`cursor-pointer p-1 rounded ${currentMoveIndex === index ? 'bg-highlight-amber/50' : ''}`}>{move.san}</span>
                                             {history[index+1] && <span onClick={() => handleMove(index+1)} className={`cursor-pointer p-1 rounded ${currentMoveIndex === index + 1 ? 'bg-highlight-amber/50' : ''}`}>{history[index+1].san}</span>}
                                         </li>
                                     )
                                 ))}
                             </ol>
                         </div>
                         <div className="flex justify-center gap-2 mt-2">
                            <button onClick={() => handleMove(-1)} className="p-2 bg-gray-200 rounded-lg"><ChevronsLeft /></button>
                            <button onClick={() => handleMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0} className="p-2 bg-gray-200 rounded-lg disabled:opacity-50"><ChevronLeft /></button>
                            <button onClick={() => handleMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= history.length -1} className="p-2 bg-gray-200 rounded-lg disabled:opacity-50"><ChevronRight /></button>
                            <button onClick={() => handleMove(history.length - 1)} className="p-2 bg-gray-200 rounded-lg"><ChevronsRight /></button>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};