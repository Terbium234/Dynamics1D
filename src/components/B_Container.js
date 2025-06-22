// client/src/components/B_Container.js
import React, { useRef, useEffect } from 'react';
import B_i_Plot from './B_i_Plot'; // B_i_Plotのインポートを有効化

function B_Container({ plotCount }) { 
  const lastPlotRef = useRef(null); // 最後に追加されたプロットへの参照

  const plots = [];
  for (let i = 0; i < plotCount; i++) {
    // 各B_i_Plotにユニークなkeyと、識別用のiteration番号を渡す
    // 最後に追加された要素にrefを渡す
    const isLastPlot = i === plotCount - 1;
    plots.push(
      <B_i_Plot 
        key={i} 
        iteration={i + 1} 
        ref={isLastPlot ? lastPlotRef : null} 
      />
    );
  }

  useEffect(() => {
    if (lastPlotRef.current) {
      lastPlotRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [plotCount]); // plotCountが変更されるたびに実行 (新しいプロットが追加されたとき)

  return (
    // B_Container の枠組みスタイル
    <div style={{ 
        padding: '10px', 
        border: '2px solid red', 
        backgroundColor: '#ffe0e0',
        // flexGrow: 1, // 固定の高さを設定するため削除
        height: '600px', // B_Containerの高さを600pxに固定（この値は調整可能です）
        overflowY: 'auto', // B_Container自体で縦スクロールを有効にする
        boxSizing: 'border-box' // paddingとborderの計算のため維持
        // minHeight: 0 // 固定の高さを設定するため不要
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