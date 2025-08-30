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

    // Clamp score for visualization purposes, e.g., +/- 10 pawns
    const clampedScore = Math.max(-10, Math.min(10, score));
    const whiteAdvantage = Math.max(0, Math.min(100, 50 + clampedScore * 5));

    return (
        <div className="w-full h-8 flex rounded-lg overflow-hidden bg-gray-700 my-2 shadow-inner">
            <div
                className="bg-white transition-all duration-500"
                style={{ width: `${whiteAdvantage}%` }}
            ></div>
            <div
                className="bg-gray-800 transition-all duration-500"
                style={{ width: `${100 - whiteAdvantage}%` }}
            ></div>
        </div>
    );
};


export const AnalysisScreen: React.FC = () => {
    const game = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(game.fen());
    const [history, setHistory] = useState(game.history({ verbose: true }));
    const [pgn, setPgn] = useState('');
    const { isReady, bestMove, evaluation, depth, pv, analyzePosition } = useStockfish();

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
            // To load the PGN state before replaying
            if (pgn) game.loadPgn(pgn);
            
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
                    <ChessBoardWrapper position={fen} onMove={() => false} isMyTurn={false} />
                </div>
                <Card className="lg:w-96 p-4 space-y-4">
                    <div>
                        <h3 className="font-bold text-lg">Engine Analysis</h3>
                        {!isReady ? (
                             <div className="text-center py-4">
                                <p className="text-highlight-amber font-semibold">Initializing Stockfish...</p>
                            </div>
                        ) : (
                            <div>
                               <EvaluationBar evaluation={evaluation} />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xl font-bold font-mono text-text-charcoal">{evaluation ?? '...'}</span>
                                    <span className="text-sm font-semibold text-gray-500">Depth: {depth ?? '...'}</span>
                                </div>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div>
                                        <p className="font-bold text-gray-800">Best Move:</p>
                                        <p className="font-mono text-primary font-semibold">{bestMove ?? 'Calculating...'}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Principal Variation:</p>
                                        <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded-md break-words mt-1">{pv ?? 'Calculating...'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-lg">Load PGN</h3>
                        <textarea 
                            id="pgn"
                            value={pgn}
                            onChange={(e) => setPgn(e.target.value)}
                            className="w-full h-24 p-2 mt-2 border rounded-lg font-mono text-sm focus:ring-primary focus:border-primary"
                            placeholder="Paste PGN here..."
                        ></textarea>
                        <button onClick={loadPgn} className="w-full mt-2 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-opacity-90">Load</button>
                    </div>

                    <div>
                         <h3 className="font-bold text-lg">Moves</h3>
                         <div className="h-48 overflow-y-auto bg-gray-100 rounded-lg p-2 mt-2">
                             <ol className="list-decimal list-inside">
                                 {history.map((move, index) => (
                                     index % 2 === 0 && (
                                         <li key={index} className="grid grid-cols-[auto_1fr_1fr] gap-x-2 items-baseline">
                                             <span className="text-gray-500">{index/2 + 1}.</span>
                                             <span onClick={() => handleMove(index)} className={`cursor-pointer p-1 rounded ${currentMoveIndex === index ? 'bg-highlight-amber/50' : 'hover:bg-gray-200'}`}>{move.san}</span>
                                             {history[index+1] && <span onClick={() => handleMove(index+1)} className={`cursor-pointer p-1 rounded ${currentMoveIndex === index + 1 ? 'bg-highlight-amber/50' : 'hover:bg-gray-200'}`}>{history[index+1].san}</span>}
                                         </li>
                                     )
                                 ))}
                             </ol>
                         </div>
                         <div className="flex justify-center gap-2 mt-2">
                            <button onClick={() => handleMove(-1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"><ChevronsLeft /></button>
                            <button onClick={() => handleMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0} className="p-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"><ChevronLeft /></button>
                            <button onClick={() => handleMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= history.length -1} className="p-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"><ChevronRight /></button>
                            <button onClick={() => handleMove(history.length - 1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"><ChevronsRight /></button>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};