import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PollCreator } from "./components/PollCreator";
import { PollResponse } from "./components/PollResponse";
import { PollResults } from "./components/PollResults";
import type { WindowNostr } from "nostr-tools/lib/types/nip07";
import { PrepareFeed } from "./components/Feed";
import { AppContextProvider } from "./contexts/app-context";
import Header from "./components/Header";
import { ListProvider } from "./contexts/lists-context";

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <ListProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/create" element={<PollCreator />} />
            <Route path="/respond/:eventId" element={<PollResponse />} />
            <Route path="/result/:eventId" element={<PollResults />} />
            <Route index path="/" element={<PrepareFeed />} />
          </Routes>
        </Router>
      </ListProvider>
    </AppContextProvider>
  );
};

export default App;
