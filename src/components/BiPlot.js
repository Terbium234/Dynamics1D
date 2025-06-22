// client/src/components/B_i_Plot.js
import React, { useRef, useEffect, useState } from 'react'; // useState をインポート
import * as d3 from 'd3';

const BiPlot = React.forwardRef(({ iteration, pointsData, left, right, colorPalette, onSelectionChange }, ref) => {
  const svgRef = useRef();
  const timeIndex = iteration - 1; // iterationは1-indexedなので、0-indexedのtimeに変換

  // const plotHeight = 50; // 固定の高さを削除し、動的に設定するように変更
  const pointRadius = 2.5;
  const yLevelStep = 10; // 折り返し時のY方向のステップ量を大きくする

  // X軸の描画スペースを確保するためのマージン
  const margin = { top: 5, right: 15, bottom: 25, left: 15 };

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

    // マージンを考慮した描画領域の幅
    const width = (svgElement.clientWidth || 300) - margin.left - margin.right;
    if (width <= 0) return; // 幅がなければ描画を中断

    // X座標のスケールを定義
    const xScale = d3.scaleLinear().domain([left, right]).range([0, width]);

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

    // 点が描画されるエリアの高さを計算
    let plotAreaHeight;
    if (currentPointsToDraw.length > 0) {
      const maxYPos = d3.max(currentPointsToDraw, d => d.displayY) + pointRadius + 2; // 最大Y座標 + 半径 + 余白
      plotAreaHeight = Math.max(20, maxYPos); // 最低でも20pxの高さは確保
    } else {
      plotAreaHeight = 20; // 点がない場合も最低限の高さを確保
    }
    // SVG全体の高さ = プロットエリアの高さ + 上下マージン
    const dynamicPlotHeight = plotAreaHeight + margin.top + margin.bottom;

    svg.attr('height', dynamicPlotHeight)
       .style('background-color', '#f0f0ff')
       .style('border', '1px dashed #9999ff');

    // 描画用の <g> 要素 (plotGroup) を作成し、マージン分移動
    const plotGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X軸ジェネレーターを作成
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);

    // X軸を描画
    plotGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${plotAreaHeight})`) // プロットエリアの下端に配置
      .call(xAxis)
      .selectAll("text")
        .style("font-size", "10px"); // メモリの文字サイズを調整

    // 選択矩形を描画 (もし選択中なら)
    if (isSelecting && selectionRectPixels.x1 !== null) {
      plotGroup.append("rect")
        .attr("x", Math.min(selectionRectPixels.x1, selectionRectPixels.x2))
        .attr("y", Math.min(selectionRectPixels.y1, selectionRectPixels.y2))
        .attr("width", Math.abs(selectionRectPixels.x2 - selectionRectPixels.x1))
        .attr("height", Math.abs(selectionRectPixels.y2 - selectionRectPixels.y1))
        .attr("fill", "rgba(0, 100, 255, 0.3)");
    }

    // 点を plotGroup 内に描画
    plotGroup.selectAll("circle")
      .data(currentPointsToDraw)
      .enter()
      .append("circle")
      .attr("cx", d => d.displayX)
      .attr("cy", d => d.displayY)
      .attr("r", pointRadius)
      .style("fill", d => d.fill)
      .style("stroke", d => d.stroke)
      .style("stroke-width", d => d.strokeWidth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsData, timeIndex, left, right, colorPalette, iteration, isSelecting, selectionRectPixels]);

  const handleMouseDown = (event) => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    // SVGローカル座標からマージンを引いて、plotGroup内の座標に変換
    const x = event.clientX - rect.left - margin.left;
    const y = event.clientY - rect.top - margin.top;

    setIsSelecting(true);
    setSelectionRectPixels({ x1: x, y1: y, x2: x, y2: y }); // y1, y2 もマウス位置で初期化
  };

  const handleMouseMove = (event) => {
    if (!isSelecting) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const y = event.clientY - rect.top - margin.top;

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

    // 選択範囲の座標 (plotGroupローカル座標系)
    const selectionStartPixelX = Math.min(pixelX1, pixelX2);
    const selectionEndPixelX = Math.max(pixelX1, pixelX2);
    const selectionStartPixelY = Math.min(pixelY1, pixelY2);
    const selectionEndPixelY = Math.max(pixelY1, pixelY2);

    const selectedIds = new Set();
    drawnPoints.forEach(point => { // drawnPointsの座標もplotGroupローカル
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
        点の分布 (B) - 反復: {timeIndex}
      </p>
      <svg ref={svgRef} style={{ width: '100%' }}></svg>
    </div>
  );
});

export default BiPlot;