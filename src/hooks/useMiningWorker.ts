import {Event, UnsignedEvent} from "nostr-tools";
import {MiningTracker} from "../nostr";
import React from "react";

export const useMiningWorker = ( difficulty: number, tracker: MiningTracker) => {
    const [trackerState, setTracker] = React.useState(tracker)
    const [progress, updateProgress] = React.useState({
        maxDifficultyAchieved: 0,
        numHashes: 0
    })
    const [isCompleted, setIsCompleted] = React.useState(false)
    const workerRef = React.useRef<null | Worker>(null)
    React.useEffect(() => {
        return ()=> {
            if(workerRef.current) {
                workerRef.current.terminate()
            }
        }
    }, [])
    const minePow = (event: UnsignedEvent,) => {
        if(workerRef.current) {
            workerRef.current.terminate()
        }
        const worker = new Worker(new URL("../utils/mining-worker", import.meta.url))
        workerRef.current = worker
        worker.postMessage({ event, difficulty, tracker })
        return new Promise<Omit<Event, "sig">>((resolve) => {
            worker.onmessage = (event) => {
                if(event.data.status === 'progress') {
                    updateProgress({
                        maxDifficultyAchieved: event.data.tracker.maxDifficultySoFar,
                        numHashes: event.data.numHashes
                    })
                } else if(event.data.status ==='completed') {
                    setTracker(event.data.tracker)
                    setIsCompleted(true)
                    worker.terminate()
                    resolve({...event, ...event.data.event} as Omit<Event, "sig">)
                }
            }
        })
    }
    const cancelMining = () => {
        if(workerRef.current) {
            workerRef.current.terminate()
        }
        tracker.cancel()
        setTracker(tracker)
        updateProgress({numHashes: 0, maxDifficultyAchieved: 0})
    }
    return {
        minePow,
        tracker: trackerState,
        isCompleted,
        cancelMining,
        progress
    }
}