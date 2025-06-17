// client/src/components/ControlPanel.js
import React, { useState } from 'react';
import { safeFunctionParser } from '../utils/functionUtils'; // 作成したパーサーをインポート

function ControlPanel({
  onAddPlot,
  N_points,
  setN_points,
  left,
  setLeft,
  right,
  setRight,
  onFunctionParsed // App.jsから渡されるコールバック
}) {

  const [functionString, setFunctionString] = useState("x * 0.5 * (1 - x)"); // 関数の初期値を数式の例として設定
  const [parseError, setParseError] = useState(null); // パースエラーメッセージ用

  // ロジックを一旦削除
  const handleSimulate = () => {
    setParseError(null); // エラーメッセージをリセット
    const parsedFunc = safeFunctionParser(functionString);
    if (parsedFunc) {
      console.log("関数パース成功:", parsedFunc);
      onFunctionParsed(() => parsedFunc); // App.jsに関数オブジェクトを渡す (関数として渡すことで再生成を防ぐ)
    } else {
      console.error("関数パース失敗");
      setParseError("数式の形式が正しくありません。例: x * 0.5 * (1 - x) や sin(x)");
      onFunctionParsed(null); // パース失敗をApp.jsに伝える
    }
  };

  return (
    <aside style={{ padding: '10px', backgroundColor: '#e9e9e9', borderTop: '1px solid #ccc' /* PlotAreaとの区切り */ }}>
      <h2>コントロールパネル</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleSimulate} style={{ marginLeft: '10px' }}>関数を適用</button>
        <button onClick={onAddPlot}>次の反復を表示</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="function_input" style={{ display: 'block', marginBottom: '5px' }}>{'数式 F(x): (例: x * 0.5 * (1 - x) または sin(x) )'}</label>
        <textarea
          id="function_input"
          value={functionString}
          onChange={(e) => setFunctionString(e.target.value)}
          rows={3}
          style={{ width: '95%', fontFamily: 'monospace', fontSize: '14px', padding: '5px' }}
        />
        {parseError && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{parseError}</p>}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="n_points_input" style={{ marginRight: '5px' }}>N_points:</label>
        <input
          type="number"
          id="n_points_input"
          value={N_points}
          onChange={(e) => setN_points(parseInt(e.target.value, 10))}
          style={{ width: '80px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="left_input" style={{ marginRight: '5px' }}>Left:</label>
        <input
          type="number"
          id="left_input"
          value={left}
          onChange={(e) => setLeft(parseFloat(e.target.value))}
          style={{ width: '80px', marginRight: '10px' }}
        />
        <label htmlFor="right_input" style={{ marginRight: '5px' }}>Right:</label>
        <input
          type="number"
          id="right_input"
          value={right}
          onChange={(e) => setRight(parseFloat(e.target.value))}
          style={{ width: '80px' }}
        />
      </div>
    </aside>
  );
}

export default ControlPanel;