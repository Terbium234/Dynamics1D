// client/src/components/B_Container.js
import React, { useRef, useEffect } from 'react';
import BiPlot from './BiPlot'; // インポートパスを './BiPlot' に（ファイル名変更後）
function BContainer({ plotCount, pointsData, left, right, colorPalette, setPointsData }) { // setPointsData を追加
  const lastPlotRef = useRef(null); // 最後に追加されたプロットへの参照

  const plots = [];
  for (let i = 0; i < plotCount; i++) {
    // 各B_i_Plotにユニークなkeyと、識別用のiteration番号を渡す
    // 最後に追加された要素にrefを渡す
    const isLastPlot = i === plotCount - 1;
    plots.push(
      <BiPlot  // JSXタグを BiPlot に変更
        key={i} 
        iteration={i + 1} // iteration は 1-indexed (time は 0-indexed なので注意)
        ref={isLastPlot ? lastPlotRef : null} 
        pointsData={pointsData}
        left={left}
        right={right}
        colorPalette={colorPalette}
        onSelectionChange={setPointsData} // BiPlotからの変更をAppのstateに反映
      />
    );
  }

  useEffect(() => {
    if (lastPlotRef.current) {
      lastPlotRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [plotCount]); // plotCountが変更されるたびに実行 (新しいプロットが追加されたとき)

  return (
    // BContainer の枠組みスタイル
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

export default BContainer;