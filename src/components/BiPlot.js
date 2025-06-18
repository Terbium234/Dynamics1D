// client/src/components/B_i_Plot.js
import React, { useRef, useEffect, useState } from 'react'; // useState をインポート
import * as d3 from 'd3';

const BiPlot = React.forwardRef(({ iteration, pointsData, left, right, colorPalette, onSelectionChange }, ref) => {
  const svgRef = useRef();
  const timeIndex = iteration - 1; // iterationは1-indexedなので、0-indexedのtimeに変換

  // const plotHeight = 50; // 固定の高さを削除し、動的に設定するように変更
  const pointRadius = 2.5;
  const yLevelStep = 10; // 折り返し時のY方向のステップ量を大きくする

  // 範囲選択のための状態変数
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRectPixels, setSelectionRectPixels] = useState({ x1: null, y1: null, x2: null, y2: null });
  const [drawnPoints, setDrawnPoints] = useState([]); // 描画された点の情報を保持

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || !pointsData || !colorPalette || colorPalette.length === 0) {
      return;
    }

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove(); // 描画前に既存の要素をクリア

    const width = svgElement.clientWidth || 300; // 親要素の幅を取得、なければデフォルト

    // 選択範囲描画用のグループ (他の要素より手前に来るように最後に追加も検討)
    let selectionRectGroup = svg.select("g.selection-rect-group");
    if (selectionRectGroup.empty()) {
      selectionRectGroup = svg.append("g").attr("class", "selection-rect-group");
    }
    selectionRectGroup.selectAll("*").remove(); // 既存の選択矩形をクリア

    // 選択矩形の描画ロジックは、SVGの高さが決定した後に移動済みのため、この古いコメントブロックは削除

    const xScale = d3.scaleLinear().domain([left, right]).range([0, width]);
    // const interpolator = colorPalette[0]; // initialColor を使うため不要に

    let currentYLevel = pointRadius + 2; // 最初の点のY座標の基準
    let lastX = null;
    let lastDirection = null; // null: 初期, 0: 減少, 1: 増加

    const currentPointsToDraw = []; // useEffect内で完結させるため、stateではなくローカル変数に

    for (let i = 0; i < pointsData.length; i++) {
      const pData = pointsData[i];
      if (pData.positions && pData.positions.length > timeIndex && pData.positions[timeIndex]) {
        const currentPoint = pData.positions[timeIndex];
        const xPos = currentPoint.x;

        if (xPos >= left && xPos <= right) {
          let color;
          if (pData.dragged) {
            color = 'red'; // 選択されたら赤色に
          } else {
            color = pData.initialColor; // App.jsで計算済みの初期色を使用
          }

          let yPos = currentYLevel;
          if (lastX !== null) {
            let currentDirection = null;
            if (xPos > lastX) currentDirection = 1; // 増加
            else if (xPos < lastX) currentDirection = 0; // 減少

            // 方向転換の検出 (山または谷)
            // (lastDirection が null でない) かつ (currentDirection が null でない) かつ (lastDirection と currentDirection が異なる)
            if (lastDirection !== null && currentDirection !== null && lastDirection !== currentDirection) {
              currentYLevel += yLevelStep; // 方向が変わったらYレベルを下げる
              yPos = currentYLevel;
            }
            lastDirection = currentDirection;
          } else {
             // 最初の点の場合の初期方向 (次の点との比較のため)
            if (i + 1 < pointsData.length && pointsData[i+1].positions && pointsData[i+1].positions.length > timeIndex && pointsData[i+1].positions[timeIndex]) {
                const nextXPos = pointsData[i+1].positions[timeIndex].x;
                if (nextXPos > xPos) lastDirection = 1;
                else if (nextXPos < xPos) lastDirection = 0;
            }
          }
          lastX = xPos;
          currentPointsToDraw.push({
            id: pData.id, // pointsDataのidを保持
            displayX: xScale(xPos), // SVG上のX座標
            displayY: yPos,         // SVG上のY座標
            originalX: xPos,        // 元のデータ空間でのX座標
            fill: color,
            stroke: 'none', // 枠線なし
            strokeWidth: 0    // 枠線なし
          });
        }
      }
    }

    // X座標でソートしてから描画 (重なりの順序のため)
    currentPointsToDraw.sort((a,b) => a.originalX - b.originalX);
    setDrawnPoints(currentPointsToDraw); // 描画した点の情報をstateに保存 (マウスイベントで使用)

    // 描画する点のY座標の最大値に基づいてSVGの高さを決定
    let maxYPos = pointRadius + 2; // 最小の高さ（最初の点のY座標の基準）
    if (currentPointsToDraw.length > 0) {
      maxYPos = d3.max(currentPointsToDraw, d => d.displayY) + pointRadius + 2; // 最大Y座標 + 半径 + 余白
    }
    const dynamicPlotHeight = Math.max(20, maxYPos); // 最低でも20pxの高さは確保

    svg.attr('height', dynamicPlotHeight)
       .style('background-color', '#f0f0ff')
       .style('border', '1px dashed #9999ff');

    // SVGの高さが決定したので、選択矩形を再描画 (もし選択中なら)
    if (isSelecting && selectionRectPixels.x1 !== null) {
      selectionRectGroup.append("rect")
        .attr("x", Math.min(selectionRectPixels.x1, selectionRectPixels.x2))
        .attr("y", Math.min(selectionRectPixels.y1, selectionRectPixels.y2))
        .attr("width", Math.abs(selectionRectPixels.x2 - selectionRectPixels.x1))
        .attr("height", Math.abs(selectionRectPixels.y2 - selectionRectPixels.y1))
        .attr("fill", "rgba(0, 100, 255, 0.3)");
    }

    svg.selectAll("circle")
      .data(currentPointsToDraw)
      .enter()
      .append("circle")
      .attr("cx", d => d.displayX)
      .attr("cy", d => d.displayY)
      .attr("r", pointRadius)
      .style("fill", d => d.fill)
      .style("stroke", d => d.stroke)
      .style("stroke-width", d => d.strokeWidth);

  }, [pointsData, timeIndex, left, right, colorPalette, iteration, isSelecting, selectionRectPixels]); // 依存配列を更新

  const handleMouseDown = (event) => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // SVGローカルX座標
    const y = event.clientY - rect.top;  // SVGローカルY座標

    setIsSelecting(true);
    setSelectionRectPixels({ x1: x, y1: y, x2: x, y2: y }); // y1, y2 もマウス位置で初期化
  };

  const handleMouseMove = (event) => {
    if (!isSelecting) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setSelectionRectPixels(prev => ({ ...prev, x2: x, y2: y })); // y2 も更新
  };

  const handleMouseUpOrLeave = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const { x1: pixelX1, y1: pixelY1, x2: pixelX2, y2: pixelY2 } = selectionRectPixels;
    // x1, y1, x2, y2 のいずれかがnullなら処理中断
    if (pixelX1 === null || pixelY1 === null || pixelX2 === null || pixelY2 === null) {
      setSelectionRectPixels({ x1: null, y1: null, x2: null, y2: null });
      return;
    }

    const selectionStartPixelX = Math.min(pixelX1, pixelX2); // 変数名を X を含むものに統一
    const selectionEndPixelX = Math.max(pixelX1, pixelX2);   // 変数名を X を含むものに統一
    const selectionStartPixelY = Math.min(pixelY1, pixelY2);
    const selectionEndPixelY = Math.max(pixelY1, pixelY2);

    const selectedIds = new Set();
    drawnPoints.forEach(point => {
      // X座標とY座標の両方が選択範囲内にあるかチェック
      if (point.displayX >= selectionStartPixelX && point.displayX <= selectionEndPixelX &&
          point.displayY >= selectionStartPixelY && point.displayY <= selectionEndPixelY) {
        selectedIds.add(point.id);
      }
    });

    if (onSelectionChange && pointsData) {
      const updatedPointsData = pointsData.map(pData => {
        // BiPlotでは全点のdragged状態を更新対象とする (PlotAreaと異なり、表示されている点=全点ではないため)
        // ただし、選択されたIDセットに基づいてdraggedを更新
        if (selectedIds.has(pData.id)) {
          return { ...pData, dragged: true };
        }
        // 選択されなかった点は、現在のdragged状態を維持するか、falseにするかを選択できる
        // ここでは、選択されなかったものはfalseにする（PlotAreaの挙動に合わせる）
        return { ...pData, dragged: false };
      });
      onSelectionChange(updatedPointsData);
    }

    setSelectionRectPixels({ x1: null, y1: null, x2: null, y2: null });
  };

  return (
    <div
      ref={ref}
      style={{ marginBottom: '10px', border: '1px solid blue', padding: '5px', backgroundColor: '#e0e0ff', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave} // SVG外に出た場合も選択終了
    >
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#333' }}>
        点の分布 (B) - 時刻: {timeIndex} (反復: {iteration})
      </p>
      <svg ref={svgRef} style={{ width: '100%' }}></svg>
    </div>
  );
});

export default BiPlot;