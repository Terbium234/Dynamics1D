// client/src/components/ControlPanel.js
import React from 'react';

function ControlPanel({ onAddPlot }) { 

  // ロジックを一旦削除
  const handleSimulate = () => {
    console.log("シミュレーション実行ボタンがクリックされました (処理なし)");
  };
  // const handleIncrease = () => { // onAddPlot を直接使うため不要に
  //   console.log("次の反復を表示ボタンがクリックされました (処理なし)");
  // };

  return (
    <aside style={{ padding: '10px', backgroundColor: '#e9e9e9', borderTop: '1px solid #ccc' /* PlotAreaとの区切り */ }}>
      <h2>コントロールパネル</h2>
      <button onClick={handleSimulate} style={{ marginRight: '10px' }}>シミュレーション実行 (仮)</button>
      <button onClick={onAddPlot}>次の反復を表示</button>
    </aside>
  );
}

export default ControlPanel;