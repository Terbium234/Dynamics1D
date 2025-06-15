// client/src/components/B_Container.js
import React from 'react';
import B_i_Plot from './B_i_Plot'; // B_i_Plotのインポートを有効化

function B_Container({ plotCount }) { 

  const plots = [];
  for (let i = 0; i < plotCount; i++) {
    // 各B_i_Plotにユニークなkeyと、識別用のiteration番号を渡す
    plots.push(<B_i_Plot key={i} iteration={i + 1} />);
  }

  return (
    // B_Container の枠組みスタイル
    <div style={{ 
        padding: '10px', 
        border: '2px solid red', 
        backgroundColor: '#ffe0e0'
        // minHeight: '200px', // 子要素に応じて高さが変動するため、固定のminHeightは調整が必要な場合がある
        // display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' // リスト表示のためflex関連のスタイルを調整または削除
      }}>
      <h3>点の分布 (B) - 雛形</h3>
      {plotCount === 0 ? (
        <p>「次の反復を表示」ボタンを押してプロットを追加してください。</p>
      ) : (
        plots
      )}
    </div>
  );
}

export default B_Container;