import React from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld } from "./views";
import { MarketplacePage } from "./features/marketplace/pages/MarketplacePage";
import { GenreExplorerPage } from "./features/marketplace/pages/GenreExplorerPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MarketplacePage />} />
      <Route path="/explore/:genre" element={<GenreExplorerPage />} />
      <Route path="/hello" element={<HelloWorld />} />
    </Routes>
  );
};

export default App;
