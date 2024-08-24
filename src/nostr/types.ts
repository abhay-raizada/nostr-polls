import { Event } from "nostr-tools";

export type Profile = {
  event: Event;
  picture: string;
  [key: string]: any;
};
