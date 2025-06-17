// client/src/components/PlotArea.js
import React from 'react';
import { format } from 'mathjs'; // math.jsのformat関数をインポート

function PlotArea({ pointsData }) {
  // 表示する点のインデックス (0, 1, 2)
  const pointIndicesToShow = [0, 1, 2];
  const pointsToDisplay = pointsData.filter((_, index) => pointIndicesToShow.includes(index));

  return (
    <main style={{ padding: '10px', flexGrow: 1, border: '1px solid #ddd', margin: '10px' }}>
      <h2>プロットエリア</h2>
      <p>最初の3点の位置情報:</p>
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
      )}
    </main>
  );
}

export default PlotArea;