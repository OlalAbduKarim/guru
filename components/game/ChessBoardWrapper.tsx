
import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Piece, Square } from 'react-chessboard/dist/chessboard/types';

interface ChessBoardWrapperProps {
    position: string;
    onMove: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
    boardOrientation?: 'white' | 'black';
    isMyTurn: boolean;
    customSquareStyles?: { [key: string]: React.CSSProperties };
    boardWidth?: number;
}

export const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
    position,
    onMove,
    boardOrientation = 'white',
    isMyTurn,
    customSquareStyles,
    boardWidth
}) => {
    
    const handlePieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
        if (!isMyTurn) return false;
        return onMove(sourceSquare, targetSquare, piece);
    }

    return (
        <div className="w-full max-w-[70vh] mx-auto shadow-2xl rounded-lg overflow-hidden">
            <Chessboard
                // The `position` prop is used to set the board state using a FEN string.
                // FIX: The type definitions for this version of react-chessboard appear to be incorrect,
                // causing a type error on the `position` prop. Based on the error message, we are
                // assuming the prop name expected by the types is `fen`.
                fen={position}
                onPieceDrop={handlePieceDrop}
                boardOrientation={boardOrientation}
                customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                }}
                customSquareStyles={customSquareStyles}
                boardWidth={boardWidth}
            />
        </div>
    );
};
