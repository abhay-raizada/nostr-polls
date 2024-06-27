// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PollCreator } from './components/PollCreator';
import { PollResponse } from './components/PollResponse';
import { PollResults } from './components/PollResults';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          <Route path="/create" element={<PollCreator />} />
          <Route path="/respond" element={<PollResponse />} />
          <Route path="/result" element={<PollResults />} />
          {/* You can add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
