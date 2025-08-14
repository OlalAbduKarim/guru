import { useState, useEffect, useRef } from 'react';

// NOTE: This implementation assumes the environment can load a Web Worker from a remote URL.
// The stockfish.js library is complex and this is a simplified interface.
const STOCKFISH_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';

interface StockfishOutput {
    bestmove?: string;
    info?: string;
}

export const useStockfish = () => {
    const [engine, setEngine] = useState<Worker | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [bestMove, setBestMove] = useState<string | null>(null);
    const [evaluation, setEvaluation] = useState<string | null>(null);
    const analysisRequestId = useRef(0);

    useEffect(() => {
        const worker = new Worker(STOCKFISH_WORKER_URL);
        setEngine(worker);

        worker.onmessage = (event: MessageEvent) => {
            const line: string = event.data;
            // console.log(`Stockfish: ${line}`);

            if (line === 'uciok') {
                worker.postMessage('isready');
            } else if (line === 'readyok') {
                setIsReady(true);
            } else {
                const match = line.match(/bestmove\s+(\S+)/);
                if (match) {
                    setBestMove(match[1]);
                }
                const scoreMatch = line.match(/score\s(cp|mate)\s(-?\d+)/);
                if(scoreMatch) {
                    const type = scoreMatch[1];
                    const score = parseInt(scoreMatch[2], 10);
                    const currentEval = type === 'mate' ? `Mate in ${score}` : (score / 100).toFixed(2);
                    setEvaluation(currentEval);
                }
            }
        };
        
        worker.postMessage('uci');

        return () => {
            worker.postMessage('quit');
            worker.terminate();
        };
    }, []);

    const sendCommand = (command: string) => {
        if (engine && isReady) {
            engine.postMessage(command);
        }
    };
    
    const analyzePosition = (fen: string, depth: number = 15) => {
        if (engine && isReady) {
            // New request, reset old state
            analysisRequestId.current += 1;
            setBestMove(null);
            setEvaluation(null);

            sendCommand(`position fen ${fen}`);
            sendCommand(`go depth ${depth}`);
        }
    };

    return { isReady, bestMove, evaluation, analyzePosition, sendCommand };
};