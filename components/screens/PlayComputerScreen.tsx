import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from '../../hooks/useStockfish';
import { ChessBoardWrapper } from '../game/ChessBoardWrapper';
import { Card } from '../ui/Card';
import { Bot, RefreshCw, User, Swords } from 'lucide-react';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';

export const PlayComputerScreen: React.FC = () => {
    const game = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(game.fen());
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
    const [status, setStatus] = useState('Playing...');
    const { isReady, bestMove, analyzePosition } = useStockfish();

    const isAITurn = game.turn() !== playerColor[0];

    useEffect(() => {
        if (game.isGameOver()) {
            if (game.isCheckmate()) setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
            else if (game.isDraw()) setStatus("Draw!");
            else if (game.isStalemate()) setStatus("Stalemate!");
            else if (game.isThreefoldRepetition()) setStatus("Draw by repetition!");
            return;
        }

        if (isAITurn) {
            analyzePosition(game.fen(), 15);
        }
    }, [fen, isAITurn, game, analyzePosition]);

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

    const resetGame = () => {
        game.reset();
        setFen(game.fen());
        setStatus('Playing...');
        if (playerColor === 'black') {
             analyzePosition(game.fen(), 15);
        }
    };
    
    const toggleSide = () => {
        const newColor = playerColor === 'white' ? 'black' : 'white';
        setPlayerColor(newColor);
        game.reset();
        setFen(game.fen());
        if(newColor === 'black') {
            analyzePosition(game.fen(), 15);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-text-charcoal mb-4 flex items-center gap-3">
                <Bot /> Play vs. Computer
            </h1>
            <Card className="p-4 mb-4">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">{status}</p>
                    <div className="flex gap-2">
                        <button onClick={toggleSide} className="bg-highlight-slate text-white p-2 rounded-lg hover:bg-opacity-80 transition"><Swords size={20}/></button>
                        <button onClick={resetGame} className="bg-primary text-white p-2 rounded-lg hover:bg-opacity-80 transition"><RefreshCw size={20}/></button>
                    </div>
                </div>
                 {!isReady && <p className="text-center text-highlight-amber font-semibold mt-2">Initializing Stockfish Engine...</p>}
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                 <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 p-3 mb-2 bg-white rounded-lg shadow">
                       <Bot size={24} className={isAITurn ? 'text-soft-emerald' : 'text-gray-400'}/>
                       <span className="font-bold text-lg">Stockfish AI</span>
                       {isAITurn && <div className="w-3 h-3 bg-soft-emerald rounded-full animate-pulse ml-auto"></div>}
                    </div>
                    
                    <ChessBoardWrapper 
                        position={fen} 
                        onMove={onMove} 
                        boardOrientation={playerColor}
                        isMyTurn={!isAITurn && !game.isGameOver()}
                    />
                    
                    <div className="flex items-center gap-3 p-3 mt-2 bg-white rounded-lg shadow">
                       <User size={24} className={!isAITurn ? 'text-soft-emerald' : 'text-gray-400'}/>
                       <span className="font-bold text-lg">You</span>
                       {!isAITurn && <div className="w-3 h-3 bg-soft-emerald rounded-full animate-pulse ml-auto"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};