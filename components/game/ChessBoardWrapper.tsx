
import React, { useRef, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Piece, Square } from 'react-chessboard/dist/chessboard/types';
import { Chess } from 'chess.js';

interface ChessBoardWrapperProps {
    position: string;
    onMove: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
    boardOrientation?: 'white' | 'black';
    isMyTurn: boolean;
    customSquareStyles?: { [key: string]: React.CSSProperties };
    lastMove?: { from: Square; to: Square } | null;
}

export const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
    position,
    onMove,
    boardOrientation = 'white',
    isMyTurn,
    customSquareStyles,
    lastMove,
}) => {
    const boardWrapperRef = useRef<HTMLDivElement>(null);
    const [boardWidth, setBoardWidth] = useState<number | undefined>();
    const [dynamicSquareStyles, setDynamicSquareStyles] = useState<{ [key: string]: React.CSSProperties }>({});

    useEffect(() => {
        const updateWidth = () => {
            if (boardWrapperRef.current) {
                setBoardWidth(boardWrapperRef.current.offsetWidth);
            }
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        if (boardWrapperRef.current) {
            resizeObserver.observe(boardWrapperRef.current);
        }

        return () => {
            if (boardWrapperRef.current) {
                resizeObserver.unobserve(boardWrapperRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const newStyles: { [key: string]: React.CSSProperties } = {};

        // Highlight the last move
        if (lastMove) {
            newStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
            newStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
        }

        // Highlight all legal moves for the current player
        if (isMyTurn) {
            try {
                const game = new Chess(position);
                const moves = game.moves({ verbose: true });

                moves.forEach(move => {
                    const isCapture = move.flags.includes('c');
                    
                    if (isCapture) {
                        newStyles[move.to] = {
                            ...newStyles[move.to],
                            background: 'radial-gradient(circle, rgba(0,0,0,0.2) 85%, transparent 85%)',
                            borderRadius: '50%',
                        };
                    } else {
                        newStyles[move.to] = {
                            ...newStyles[move.to],
                            background: 'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)',
                        };
                    }
                });
            } catch (e) {
                // Ignore invalid FEN positions that chess.js might throw on
                console.warn("Could not parse FEN for legal moves:", position);
            }
        }
        
        setDynamicSquareStyles(newStyles);
    }, [position, isMyTurn, lastMove]);

    const handlePieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
        if (!isMyTurn) return false;
        return onMove(sourceSquare, targetSquare, piece);
    }

    return (
        <div ref={boardWrapperRef} className="w-full max-w-[70vh] mx-auto shadow-2xl rounded-lg overflow-hidden">
            <Chessboard
                position={position}
                onPieceDrop={handlePieceDrop}
                boardOrientation={boardOrientation}
                customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                }}
                customSquareStyles={{ ...customSquareStyles, ...dynamicSquareStyles }}
                boardWidth={boardWidth}
            />
        </div>
    );
};
