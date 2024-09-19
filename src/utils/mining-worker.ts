// eslint-disable-next-line no-restricted-globals
import {Event, getEventHash, nip13, UnsignedEvent} from "nostr-tools";
import {MiningTracker} from "../nostr";

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
    console.log("Received message in worker:", event.data);

    const { event: nostrEvent, difficulty, tracker } = event.data;

    const result = minePow(nostrEvent, difficulty, tracker);
    console.log("Mining result:", result);

});

export function minePow(
    unsigned: UnsignedEvent,
    difficulty: number,
    tracker: MiningTracker
):Omit<Event, "sig"> {
    let count = 0;

    const event = unsigned as Omit<Event, "sig">;
    const tag = ["nonce", count.toString(), difficulty.toString()];
    const queryTag = ["W", difficulty.toString()];

    event.tags.push(tag);
    event.tags.push(queryTag);

    while (true) {
        const now = Math.floor(new Date().getTime() / 1000);
        if (tracker.cancelled) {
            throw new Error("Operation cancelled");
        }

        if (now !== event.created_at) {
            count = 0;
            event.created_at = now;
        }

        tag[1] = (++count).toString();
        event.id = getEventHash(event);
        let currentDifficulty = nip13.getPow(event.id);
        if (currentDifficulty > tracker.maxDifficultySoFar) {
            tracker.maxDifficultySoFar = currentDifficulty;
            ctx.postMessage({status: "progress", difficulty: currentDifficulty, tracker, event})
        }
        if (nip13.getPow(event.id) >= difficulty) {
            ctx.postMessage({status: "completed", difficulty: currentDifficulty, tracker, event})
            break;
        }

    }

    return event;
}
export default ctx