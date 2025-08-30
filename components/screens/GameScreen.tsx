import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Chess } from 'chess.js';
import type { Game as GameType } from '../../types';
import { ChessBoardWrapper } from '../game/ChessBoardWrapper';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Crown, Swords } from 'lucide-react';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';

const PlayerInfo: React.FC<{ player: any; isTurn: boolean; isWinner: boolean }> = ({ player, isTurn, isWinner }) => (
    <div className={`p-3 bg-white rounded-lg shadow flex items-center gap-3 border-2 ${isTurn ? 'border-soft-emerald' : 'border-transparent'}`}>
        <Avatar src={player.avatarUrl} alt={player.name} />
        <div className="flex-grow">
            <p className="font-bold text-lg">{player.name}</p>
        </div>
        {isWinner && <Crown size={24} className="text-highlight-amber" />}
        {isTurn && <div className="w-3 h-3 bg-soft-emerald rounded-full animate-pulse"></div>}
    </div>
);


export const GameScreen: React.FC = () => {
    const { gameId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const game = useMemo(() => new Chess(), []);
    const [dbGame, setDbGame] = useState<GameType | null>(null);
    const [fen, setFen] = useState(game.fen());
    const [status, setStatus] = useState("Loading game...");

    const playerColor = dbGame?.whitePlayer.id === currentUser?.id ? 'white' : 'black';
    const isMyTurn = dbGame?.status === 'active' && playerColor[0] === game.turn();
    const isPlayer = dbGame?.whitePlayer.id === currentUser?.id || dbGame?.blackPlayer?.id === currentUser?.id;

    useEffect(() => {
        if (!gameId) return;
        const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
            if (doc.exists()) {
                const gameData = { id: doc.id, ...doc.data() } as GameType;
                setDbGame(gameData);
                try {
                    game.loadPgn(gameData.pgn);
                    setFen(game.fen());
                } catch (e) {
                    console.error("Failed to load PGN from database:", e);
                    setStatus("Error: Corrupted game data.");
                    // Game is corrupt, do not proceed with game logic for this snapshot
                    return;
                }

                if (gameData.status === 'waiting' && gameData.whitePlayer.id !== currentUser?.id && currentUser) {
                    // This user is joining as black
                    updateDoc(doc.ref, {
                        blackPlayer: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
                        status: 'active',
                        updatedAt: serverTimestamp(),
                    });
                }
            } else {
                navigate('/play/online');
            }
        });
        return () => unsub();
    }, [gameId, navigate, currentUser, game]);
    
    useEffect(() => {
        if (game.isGameOver()) {
            if (game.isCheckmate()) setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
            else if (game.isDraw()) setStatus("Draw!");
            else if (game.isStalemate()) setStatus("Stalemate!");
            else if (game.isThreefoldRepetition()) setStatus("Draw by repetition!");
            
            if (dbGame?.status === 'active') { // Only update winner once
                 const winner = game.isDraw() ? 'draw' : (game.turn() === 'w' ? 'black' : 'white');
                 updateDoc(doc(db, "games", gameId!), {
                    status: 'completed',
                    winner: winner,
                    endReason: status,
                    updatedAt: serverTimestamp(),
                });
            }
        } else if (dbGame?.status === 'waiting') {
            setStatus("Waiting for an opponent to join...");
        } else if (dbGame?.status === 'active') {
            setStatus(game.turn() === 'w' ? "White's turn" : "Black's turn");
        } else if (dbGame?.status === 'completed') {
            setStatus(`Game over: ${dbGame.endReason}`);
        }
    }, [fen, dbGame, game, gameId, status]);


    const onMove = (sourceSquare: Square, targetSquare: Square, piece: Piece): boolean => {
        if (!isPlayer || !isMyTurn) return false;

        try {
            const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
            if (move) {
                setFen(game.fen());
                // Fire-and-forget update to keep UI responsive
                updateDoc(doc(db, "games", gameId!), {
                    pgn: game.pgn(),
                    fen: game.fen(),
                    updatedAt: serverTimestamp(),
                }).catch(error => {
                    console.error("Error updating game document: ", error);
                    // Optional: handle error, maybe revert local state
                });
                return true;
            }
            return false;
        } catch (e) {
            console.log("Invalid move", e);
            return false;
        }
    };
    
    if (!dbGame) return <div className="text-center p-8">Loading...</div>;

    const whitePlayer = dbGame.whitePlayer;
    const blackPlayer = dbGame.blackPlayer;
    
    return (
        <div className="p-4">
             <h1 className="text-3xl font-bold text-text-charcoal mb-4 flex items-center gap-3">
                <Swords /> Live Match
            </h1>
            <Card className="p-4 mb-4 text-center">
                 <p className="font-semibold text-lg">{status}</p>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                    {blackPlayer && <PlayerInfo player={blackPlayer} isTurn={game.turn() === 'b'} isWinner={dbGame.winner === 'black'} />}
                    <div className="my-2">
                        <ChessBoardWrapper 
                            position={fen} 
                            onMove={onMove}
                            boardOrientation={playerColor}
                            isMyTurn={isMyTurn}
                        />
                    </div>
                    {whitePlayer && <PlayerInfo player={whitePlayer} isTurn={game.turn() === 'w'} isWinner={dbGame.winner === 'white'} />}
                </div>
            </div>
        </div>
    );
};