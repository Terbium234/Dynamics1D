// client/src/App.js
import React,{useState } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import PlotArea from './components/PlotArea';
import './App.css'; // 必要に応じてグローバルCSSをインポート
import B_Container from './components/B_Container';

function App() {
  const [plotCount, setPlotCount] = useState(0); // 表示するB_i_Plotの数を管理

  const handleAddPlot = () => {
    setPlotCount(prevCount => prevCount + 1);
  };

  // シミュレーション実行のロジックは今回は変更しません

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        {/* 左側のセクション：PlotAreaとControlPanelを縦に並べる */}
        <div className="left-section">
          <PlotArea />
          <ControlPanel onAddPlot={handleAddPlot} />
        </div>
        {/* 右側のセクション：B_Container */}
        <div className="right-section">
          <B_Container plotCount={plotCount} />
        </div>
      </div>
      {/* <Footer /> 必要であれば */}
    </div>
  );
}
export default App;