// client/src/components/PlotArea.js
import React, { useEffect, useState, useMemo } from 'react'; // useMemo をインポート
import { format } from 'mathjs'; // math.jsのformat関数をインポート
import { Line } from 'react-chartjs-2';
import * as d3 from 'd3'; // ← ここでD3.jsライブラリ全体を 'd3' という名前でインポートしています

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  // Filler プラグインは、線の下を塗りつぶす場合に必要ですが、今回は散布図なので直接は不要です。
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PlotArea({ pointsData, parsedFunction, left, right, N_points }) { // N_pointsも受け取る
  // 表示する点のインデックス (0, 1, 2)
  const pointIndicesToShow = [0, 1, 2];
  const pointsToDisplay = pointsData.filter((_, index) => pointIndicesToShow.includes(index));
  const SCATTER_PLOT_Y_OFFSET = 0.1; // f(x)の最小値からのオフセット量の基準
  const MIN_SCATTER_Y_OFFSET_VALUE = 0.2; // 散布図のYオフセットの最小絶対値

  // Stateの定義
  const [fxData, setFxData] = useState(null);
  // 散布図のプロットデータ
  const [scatterPlotData, setScatterPlotData] = useState(null);
  // カラーパレット
  const [colorPalette, setColorPalette] = useState([]);

  // カラーパレットの計算
  useEffect(() => {
    if (parsedFunction && typeof left === 'number' && typeof right === 'number' && left <= right) {
      const l = right - left;
      // left === right の場合に domainMin と domainMax が同じ値にならないように調整
      const domainOffset = l === 0 ? 0.1 : l / 10;
      const domainMin = left - domainOffset;
      const domainMax = right + domainOffset;
      const numberOfSamplePoints = 1000; // グラフの滑らかさ。必要に応じて調整
      // numberOfSamplePoints が1以下の場合の0除算を避ける
      const step = numberOfSamplePoints > 1 ? (domainMax - domainMin) / (numberOfSamplePoints - 1) : 0;


      const labels = [];
      const dataPoints = [];
      // f(x)のグラフの点に関するスタイルは、データセットオブジェクト内で直接指定するため、これらの配列は不要になります。
      // const pointBackgroundColors = [];
      // const pointRadii = [];

      for (let i = 0; i < numberOfSamplePoints; i++) {
        const x = domainMin + i * step;
        labels.push(x.toFixed(3)); // X軸のラベル
        try {
          const y = parsedFunction(x);
          // InfinityやNaNはグラフ描画に適さないためnullにするかフィルタリング
          if (typeof y === 'number' && isFinite(y)) {
            dataPoints.push(y);
          } else {
            dataPoints.push(null); // 無効な値はグラフ上で途切れさせる
          }
        } catch (error) {
          console.error(`Error evaluating function at x=${x}:`, error);
          dataPoints.push(null);
        }
      }

      setFxData({
        labels,
        datasets: [
          {
            label: 'f(x)',
            data: dataPoints,
            borderColor: 'rgb(0, 0, 0)', // 関数の線の色を黒に
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // 関数の線の背景色（ほぼ透明な黒）
            tension: 0.1,
            spanGaps: true, // nullの箇所を繋がないようにする
            borderWidth: 1, // 関数の線の太さを1ピクセルに設定
            pointRadius: 0.3, // f(x)の線上の点を小さく表示する
            pointHoverRadius: 3, // ホバー時の点の半径も小さめに
          },
        ],
      });
    } else {
      setFxData(null); // 関数がない場合はf(x)データをクリア
    }
  }, [parsedFunction, left, right]); // 依存配列は関数の定義域と関数自体

  // left, right が変更されたときにデュオトーンの補間関数を生成
  useEffect(() => {
    if (typeof left === 'number' && typeof right === 'number') {
      // グラデーションを黄緑から黄色へ変更
      const color1 = 'lawngreen'; // 開始色 (黄緑)
      const color2 = 'gold';      // 終了色 (黄色)
      setColorPalette([d3.interpolate(color1, color2)]); // 配列に補間関数を格納
    } else {
      setColorPalette([d3.interpolate('lawngreen', 'gold')]); // デフォルトも同様に
    }
  }, [left, right]); // 依存配列は left と right のみ

  // pointsDataの時刻0の点をグラデーション表示
  const initialPointsForDisplay = useMemo(() => {
    const result = [];
    // colorPalette[0] に補間関数が格納されていることを期待
    if (pointsData && pointsData.length > 0 && typeof left === 'number' && typeof right === 'number' && colorPalette.length > 0 && typeof colorPalette[0] === 'function') {
      const interpolator = colorPalette[0]; // デュオトーン補間関数を取得
      const range = right - left;

      pointsData.forEach((point) => {
        if (point.positions && point.positions.length > 0 && point.positions[0]?.time === 0) {
          const xPos = point.positions[0].x;
          let color;

          if (range === 0) {
            // 範囲がゼロの場合は中間色を使用
            color = interpolator(0.5);
            // d3.colorを使って透明度を設定
            if (d3.color(color)) color = d3.color(color).copy({opacity: 0.7}).toString();
          } else {
            // x座標を [0, 1] の範囲に正規化
            const relativePos = Math.max(0, Math.min(1, (xPos - left) / range));
            // 正規化された値を使って補間関数から色を取得し、透明度を設定
            color = interpolator(relativePos);
            if (d3.color(color)) color = d3.color(color).copy({opacity: 0.7}).toString();
          }
          result.push({ id: point.id, x: xPos, color: color });
        }
      });
    }
    return result;
  }, [pointsData, left, right, colorPalette]); // colorPalette (補間関数) に依存

  // 散布図のデータセット生成
  useEffect(() => {
    // fxData とその内部データが存在し、initialPointsForDisplay も存在する場合に処理
    if (fxData && fxData.datasets && fxData.datasets[0] && fxData.datasets[0].data && initialPointsForDisplay.length > 0) {
      const yValues = fxData.datasets[0].data.filter(y => typeof y === 'number' && isFinite(y));
      const minYValue = yValues.length > 0 ? Math.min(...yValues) : 0;
      const yOffsetMagnitude = SCATTER_PLOT_Y_OFFSET * Math.max(1, Math.abs(minYValue));
      const scatterY = minYValue - Math.max(MIN_SCATTER_Y_OFFSET_VALUE, yOffsetMagnitude);

      const scatterData = initialPointsForDisplay.map(point => ({
        x: point.x,
        y: scatterY,
      }));
      const scatterColors = initialPointsForDisplay.map(point => point.color);

      setScatterPlotData({ // 散布図データ専用のstateを更新
        type: 'scatter',
        label: 'Initial Points',
        data: scatterData,
        backgroundColor: scatterColors, // 計算したデュオトーン色を適用
        pointRadius: 3, // 少し大きくして透明度の効果を見やすくする (お好みで調整)
        pointHoverRadius: 4.5,
        pointBorderWidth: 0, // 点の輪郭を消す
        showLine: false,
      });
    } else {
      setScatterPlotData(null); // 条件に合わない場合はクリア
    }
  }, [initialPointsForDisplay, fxData]); // 依存配列を整理

  // Chart.jsに渡す最終的なデータ (f(x)と散布図をマージ)
  const chartDataForRender = useMemo(() => {
    if (!fxData) return null;

    // fxData.datasets が undefined または空配列でないことを確認
    const baseDatasets = fxData.datasets ? [...fxData.datasets] : [];
    const finalDatasets = [...baseDatasets];

    if (scatterPlotData) {
      const existingScatterIndex = finalDatasets.findIndex(ds => ds.type === 'scatter');
      if (existingScatterIndex !== -1) {
        finalDatasets[existingScatterIndex] = scatterPlotData;
      } else {
        finalDatasets.push(scatterPlotData);
      }
    } else {
      // scatterPlotData が null の場合、既存の散布図データセットを削除
      const scatterIndex = finalDatasets.findIndex(ds => ds.type === 'scatter');
      if (scatterIndex !== -1) {
        finalDatasets.splice(scatterIndex, 1);
      }
    }

    return {
      labels: fxData.labels,
      datasets: finalDatasets,
    };
  }, [fxData, scatterPlotData]);

  if (!chartDataForRender) {
    return (
      <main style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', margin: '10px' }}>
        <h2>プロットエリア</h2>
        <p>データをロード中または設定が不十分です... (関数、Left, Rightを設定してください)</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', margin: '10px' }}>
      <h2>プロットエリア</h2>
      {chartDataForRender && ( // chartData を chartDataForRender に変更
        <div style={{ minHeight: '300px', maxHeight: '400px', maxWidth: '700px', margin: '0 auto 10px auto', flexShrink: 0, position: 'relative' }}> {/* 幅を制限し中央寄せ */}
          {/* グラフのコンテナの幅も高さに合わせて調整するか、アスペクト比をChart.js側で設定 */}
        {/* <div style={{ width: '300px', height: '300px', marginBottom: '20px' }}> */}
          <Line
            data={chartDataForRender} // ここを修正
            options={{
              responsive: true,
              maintainAspectRatio: true, // 縦横比を維持しようとします
              animation: false, // ★ パフォーマンス改善のためアニメーションを無効化
              // aspectRatio: 1, // Chart.js v3.7+ で利用可能。1で正方形に近くなる。
              scales: {
                x: {
                  type: 'linear', // X軸を線形スケールに変更
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // 通常のグリッド線の色
                  },
                  // labelsは不要になる (type: 'linear' のため)
                  ticks: {
                    color: '#666', // 通常の目盛りの色
                  }
                },
                y: {
                  beginAtZero: false,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // 通常のグリッド線の色
                  },
                  ticks: {
                    color: '#666', // 通常の目盛りの色
                  }
                }
              },
              plugins: {
                legend: {
                  display: true
                },
                tooltip: {
                  enabled: true
                }
              }
            }} />
        </div>
      )}
      {/* 以前の initialPointsForDisplay を表示していた div は削除 */}
    </main>
  );
}

export default PlotArea;