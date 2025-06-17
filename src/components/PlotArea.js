// client/src/components/PlotArea.js
import React, { useEffect, useState } from 'react';
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

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (parsedFunction && typeof left === 'number' && typeof right === 'number' && left <= right) {
    //   const l = right - left;
    //   const domainMin = left - (l === 0 ? 0.1 : l / 10);
    //   const domainMax = right + (l === 0 ? 0.1 : l / 10);
    //   const numberOfSamplePoints = 1000; // グラフの滑らかさ。必要に応じて調整
    //   const step = (domainMax - domainMin) / (numberOfSamplePoints > 1 ? numberOfSamplePoints - 1 : 1);
      
      const l = right - left;
      const domainMin = left - l / 10;
      const domainMax = right + l / 10;
      const numberOfSamplePoints = 1000; // グラフの滑らかさ。必要に応じて調整
      const step = (domainMax - domainMin) / (numberOfSamplePoints - 1);


      const labels = [];
      const dataPoints = [];
      const pointBackgroundColors = [];
      const pointRadii = [];

      for (let i = 0; i < numberOfSamplePoints; i++) {
        const x = domainMin + i * step;
        labels.push(x.toFixed(3)); // X軸のラベル
        try {
          const y = parsedFunction(x);
          // InfinityやNaNはグラフ描画に適さないためnullにするかフィルタリング
          if (typeof y === 'number' && isFinite(y)) {
            dataPoints.push(y);
            // 原点に近い点を強調 (例: xとyがほぼ0)
            // if (Math.abs(x) < step / 2 && Math.abs(y) < (step * 5)) { // yの許容範囲は調整が必要
            //   pointBackgroundColors.push('black'); // 強調色を黒に変更
            //   pointRadii.push(5);
            // } else {
            //   pointBackgroundColors.push('rgba(75, 192, 192, 0.5)'); // 通常の点の色を少し薄く
            //   pointRadii.push(2); // 通常の点の半径
            // }
          } else {
            dataPoints.push(null); // 無効な値はグラフ上で途切れさせる
            pointBackgroundColors.push('rgb(75, 192, 192)');
            pointRadii.push(2);
          }
        } catch (error) {
          console.error(`Error evaluating function at x=${x}:`, error);
          dataPoints.push(null);
          pointBackgroundColors.push('rgb(75, 192, 192)');
          pointRadii.push(2);
        }
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'f(x)',
            data: dataPoints,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: pointBackgroundColors, // 点の色
            tension: 0.1,
            spanGaps: true, // nullの箇所を繋がない
            pointRadius: pointRadii, // 点の半径
          },
        ],
      });
    } else {
      setChartData(null); // 関数がない場合はグラフデータをクリア
    }
  }, [parsedFunction, left, right]);

  // pointsDataの時刻0の点をグラデーション表示
  const initialPointsForDisplay = [];
  if (pointsData && pointsData.length > 0 && typeof left === 'number' && typeof right === 'number' && left <= right) {
    const range = right - left;
    pointsData.forEach((point, index) => {
      if (point.positions && point.positions.length > 0 && point.positions[0]?.time === 0) {
        const xPos = point.positions[0].x;
        initialPointsForDisplay.push({
          id: point.id,
          x: xPos,
          // leftからrightの範囲における相対位置で色を決定
          color: d3.interpolateViridis(range === 0 ? 0.5 : (xPos - left) / range),
        });
      }
    });
  }

  return (
    <main style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', margin: '10px' }}>
      <h2>プロットエリア</h2>
      {chartData && (
        <div style={{ minHeight: '300px', maxHeight: '400px', marginBottom: '10px', flexShrink: 0 }}> {/* グラフのコンテナサイズとマージン調整 */}
          {/* グラフのコンテナの幅も高さに合わせて調整するか、アスペクト比をChart.js側で設定 */}
        {/* <div style={{ width: '300px', height: '300px', marginBottom: '20px' }}> */}
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true, // 縦横比を維持しようとします
              // aspectRatio: 1, // Chart.js v3.7+ で利用可能。1で正方形に近くなる。
              scales: {
                x: {
                  // グラフのX軸描画範囲を明示的に設定 (left === right の場合も考慮)
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // 通常のグリッド線の色
                  },
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
              }
            }} />
        </div>
      )}
      {/* <p style={{ marginTop: '20px' }}>最初の3点の位置情報:</p>
      {pointsToDisplay.length > 0 ? (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {pointsToDisplay.map(point => (
            <li key={point.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <strong>点ID: {point.id}</strong>
              {point.positions.length > 0 ? (
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '5px' }}>
                  {point.positions.map(pos => (
                    <li key={`${point.id}-time-${pos.time}`}>
                      時刻 {pos.time}: 位置{' '}
                      {typeof pos.x === 'number' && isFinite(pos.x)
                        ? pos.x.toFixed(4)
                        : typeof pos.x?.toString === 'function' 
                          ? format(pos.x, { precision: 4, notation: 'fixed' }) // math.jsの型かもしれないのでformatを試す
                          : String(pos.x) // その他の場合は文字列として表示
                      }
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginLeft: '20px', fontStyle: 'italic' }}>位置情報がありません。</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>表示する点のデータがありません。コントロールパネルで設定後、「次の反復を表示」を押してください。</p>
      )} */}
      {initialPointsForDisplay.length > 0 && (
        <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          {/* 点を表示するコンテナ: このコンテナの幅が left から right に対応する */}
          <div style={{
              display: 'flex', // 点を横に並べるため
              width: '100%', // 親要素いっぱいに広がる
              height: '20px', // 点の列の高さ
              backgroundColor: '#f0f0f0', // 背景色
              position: 'relative', // 子要素の絶対配置の基準 (今回は使いませんが、拡張性を考慮)
              border: '1px solid #ddd',
              overflow: 'hidden', // はみ出し防止
            }}>
            {initialPointsForDisplay.map(point => (
                <div
                key={point.id}
                title={`x: ${point.x.toFixed(3)}`}
                style={{
                    flexGrow: 1, // 各点が利用可能なスペースを均等に分け合う
                    height: '100%', // コンテナの高さに合わせる
                    backgroundColor: point.color,
                }}
                />
            ))}
            <h4>初期点の分布 (N_points: {initialPointsForDisplay.length})</h4>
          </div>
        </div>
      )}
    </main>
  );
}

export default PlotArea;