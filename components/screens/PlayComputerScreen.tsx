
import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from '../../hooks/useStockfish';
import { ChessBoardWrapper } from '../game/ChessBoardWrapper';
import { Card } from '../ui/Card';
import { Bot, RefreshCw, User, Swords, BrainCircuit } from 'lucide-react';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export const PlayComputerScreen: React.FC = () => {
    const game = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(game.fen());
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
    const [status, setStatus] = useState('Playing...');
    const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
    const { isReady, bestMove, analyzePosition } = useStockfish();

    const difficultyLevels: Record<Difficulty, number> = {
        Beginner: 5,
        Intermediate: 10,
        Advanced: 15,
    };

    const isAITurn = game.turn() !== playerColor[0];

    useEffect(() => {
        if (game.isGameOver()) {
            if (game.isCheckmate()) setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
            else if (game.isDraw()) setStatus("Draw!");
            else if (game.isStalemate()) setStatus("Stalemate!");
            else if (game.isThreefoldRepetition()) setStatus("Draw by repetition!");
            return;
        }

        if (isAITurn && isReady) {
            analyzePosition(game.fen(), difficultyLevels[difficulty]);
        }
    }, [fen, isAITurn, game, analyzePosition, difficulty, isReady]);

    useEffect(() => {
        if (bestMove && isAITurn) {
            game.move(bestMove);
            setFen(game.fen());
        }
    }, [bestMove, isAITurn, game]);

    const onMove = (sourceSquare: Square, targetSquare: Square, piece: Piece): boolean => {
        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });
            if (move) {
                setFen(game.fen());
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };
    
    const resetGameWithSide = (side: 'white' | 'black') => {
        game.reset();
        setFen(game.fen());
        setPlayerColor(side);
        setStatus('Playing...');
        if (side === 'black' && isReady) {
             analyzePosition(game.fen(), difficultyLevels[difficulty]);
        }
    }

    const resetGame = () => {
        resetGameWithSide(playerColor);
    };
    
    const toggleSide = () => {
        const newColor = playerColor === 'white' ? 'black' : 'white';
        resetGameWithSide(newColor);
    };

    const history = game.history({ verbose: true });
    const lastMove = history.length > 0 ? history[history.length - 1] : null;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-text-charcoal mb-4 flex items-center gap-3">
                <Bot /> Play vs. Computer
            </h1>
            <Card className="p-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="font-semibold text-lg order-1 sm:order-none">{status}</p>
                    <div className="flex gap-2 order-3 sm:order-none">
                        <button onClick={toggleSide} title="Switch Sides" className="bg-highlight-slate text-white p-2 rounded-lg hover:bg-opacity-80 transition"><Swords size={20}/></button>
                        <button onClick={resetGame} title="New Game" className="bg-primary text-white p-2 rounded-lg hover:bg-opacity-80 transition"><RefreshCw size={20}/></button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                        <BrainCircuit size={18} />
                        <span>Difficulty:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {(Object.keys(difficultyLevels) as Difficulty[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                                    difficulty === level ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
                 {!isReady && <p className="text-center text-highlight-amber font-semibold mt-2">Initializing Stockfish Engine...</p>}
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                 <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 p-3 mb-2 bg-white rounded-lg shadow">
                       <Bot size={24} className={isAITurn ? 'text-soft-emerald' : 'text-gray-400'}/>
                       <span className="font-bold text-lg">Stockfish AI ({difficulty})</span>
                       {isAITurn && <div className="w-3 h-3 bg-soft-emerald rounded-full animate-pulse ml-auto"></div>}
                    </div>
                    
                    <ChessBoardWrapper 
                        position={fen} 
                        onMove={onMove} 
                        boardOrientation={playerColor}
                        isMyTurn={!isAITurn && !game.isGameOver()}
                        lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : null}
                    />
                    
                    <div className="flex items-center gap-3 p-3 mt-2 bg-white rounded-lg shadow">
                       <User size={24} className={!isAITurn ? 'text-soft-emerald' : 'text-gray-400'}/>
                       <span className="font-bold text-lg">You</span>
                       {!isAITurn && !game.isGameOver() && <div className="w-3 h-3 bg-soft-emerald rounded-full animate-pulse ml-auto"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
