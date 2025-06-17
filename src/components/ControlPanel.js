// client/src/components/ControlPanel.js
import React from 'react';

function ControlPanel({
  onAddPlot,
  N_points,
  setN_points,
  left,
  setLeft,
  right,
  setRight
}) {


  // ロジックを一旦削除
  const handleIncrease = () => {
    console.log("次の反復を表示ボタンがクリックされました (処理なし)");
  };

  return (
    <aside style={{ padding: '10px', backgroundColor: '#e9e9e9', borderTop: '1px solid #ccc' /* PlotAreaとの区切り */ }}>
      <h2>コントロールパネル</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={onAddPlot}>次の反復を表示</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="n_points_input" style={{ marginRight: '5px' }}>N_points:</label>
        <input
          type="number"
          id="n_points_input"
          value={N_points}
          onChange={(e) => setN_points(parseInt(e.target.value, 10))}
          style={{ width: '80px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="left_input" style={{ marginRight: '5px' }}>Left:</label>
        <input
          type="number"
          id="left_input"
          value={left}
          onChange={(e) => setLeft(parseFloat(e.target.value))}
          style={{ width: '80px', marginRight: '10px' }}
        />
        <label htmlFor="right_input" style={{ marginRight: '5px' }}>Right:</label>
        <input
          type="number"
          id="right_input"
          value={right}
          onChange={(e) => setRight(parseFloat(e.target.value))}
          style={{ width: '80px' }}
        />
      </div>
    </aside>
  );
}

export default ControlPanel;