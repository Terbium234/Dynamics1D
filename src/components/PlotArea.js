// client/src/components/PlotArea.js
import React from 'react';

function PlotArea() {
  return (
    <main style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', margin: '10px' }}>
      <h2>プロットエリア</h2>
      {/* ここにグラフや可視化要素が配置されます */}
      <p>ここにシミュレーション結果が表示されます。</p>
    </main>
  );
}

export default PlotArea;