// client/src/components/B_i_Plot.js
import React, { useRef, useEffect } from 'react';
// import * as d3 from 'd3'; // D3.js関連を一旦削除
// import { calculateFoldedPositions } from '../utils/plotUtils'; // 一時的にコメントアウト
const B_i_Plot = React.forwardRef(({ iteration }, ref) => { // React.forwardRefを使用し、refを引数に追加
  const svgRef = useRef();
  const plotHeight = 200; // 各プロットの高さを200pxに変更
  // const margin = { top: 15, right: 20, bottom: 5, left: 20 };

  useEffect(() => {
    // useEffect内の描画ロジックを一旦全て削除
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.innerHTML = ''; // 簡単なクリア
      // svgElement.setAttribute('width', plotWidth); // 固定幅設定を削除 (style.width='100%'で対応)
      svgElement.style.width = '100%'; // 幅を親要素に合わせる
      svgElement.style.backgroundColor = '#f0f0ff';
      svgElement.style.border = '1px dashed #9999ff';
    }
  }, []); // 依存配列を空に

  return (
    // div のスタイルも調整して枠組みを明確に
    <div ref={ref} style={{ marginBottom: '10px', border: '1px solid blue', padding: '5px', backgroundColor: '#e0e0ff' }}>
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#333' }}>B_i_Plot - 反復: {iteration || 'N/A'}</p>
      <svg ref={svgRef}></svg>
    </div>
  );
});

export default B_i_Plot;