// client/src/components/ControlPanel.js
import React, { useState, useEffect, useRef } from 'react';
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

  // 各入力要素への参照を作成
  const functionInputRef = useRef(null);
  const nPointsInputRef = useRef(null);
  const leftInputRef = useRef(null);
  const rightInputRef = useRef(null);

  const [parseError, setParseError] = useState(null); // パースエラーメッセージ用

  // App.jsからのpropsが変更されたら入力フィールドの値を更新
  useEffect(() => {
    if (functionInputRef.current) functionInputRef.current.value = "3.839*x*(1-x)"; // 初期関数文字列を変更
  }, []); // マウント時に一度だけ設定
  useEffect(() => {
    if (nPointsInputRef.current) nPointsInputRef.current.value = String(N_points);
  }, [N_points]);
  useEffect(() => {
    if (leftInputRef.current) leftInputRef.current.value = String(left);
  }, [left]);
  useEffect(() => {
    if (rightInputRef.current) rightInputRef.current.value = String(right);
  }, [right]);

  const handleApplyChanges = () => {
    setParseError(null); // エラーメッセージをリセット

    // N_points, left, right の値をrefから取得して更新
    const nPointsValue = parseInt(nPointsInputRef.current.value, 10);
    if (!isNaN(nPointsValue) && nPointsValue >= 0) {
      setN_points(nPointsValue);
    } else {
      setParseError(prev => prev ? `${prev}\nN_pointsが無効です。` : 'N_pointsが無効です。');
    }

    const leftValue = parseFloat(leftInputRef.current.value);
    if (!isNaN(leftValue)) setLeft(leftValue);
    else setParseError(prev => prev ? `${prev}\nLeftが無効です。` : 'Leftが無効です。');

    const rightValue = parseFloat(rightInputRef.current.value);
    if (!isNaN(rightValue)) setRight(rightValue);
    else setParseError(prev => prev ? `${prev}\nRightが無効です。` : 'Rightが無効です。');

    // 関数のパースと適用
    const parsedFunc = safeFunctionParser(functionInputRef.current.value);
    if (parsedFunc) {
      console.log("関数パース成功:", parsedFunc);
      onFunctionParsed(() => parsedFunc); // App.jsに関数オブジェクトを渡す (関数として渡すことで再生成を防ぐ)
    } else {
      console.error("関数パース失敗");
      setParseError(prev => prev ? `${prev}\n数式の形式が正しくありません。` : "数式の形式が正しくありません。例: x * 0.5 * (1 - x) や sin(x)");
      onFunctionParsed(null); // パース失敗をApp.jsに伝える
    }
  };

  return (
    <aside style={{ padding: '10px', backgroundColor: '#e9e9e9', borderTop: '1px solid #ccc' /* PlotAreaとの区切り */ }}>
      <h2>コントロールパネル</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleApplyChanges} style={{ marginRight: '10px' }}>変更を適用</button>
        <button onClick={onAddPlot} >次の反復を表示</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="function_input" style={{ display: 'block', marginBottom: '5px' }}>{'数式 F(x): (例: 3.839x * (1 - x) または sin(x) )'}</label>
        <textarea
          id="function_input"
          ref={functionInputRef}
          defaultValue={"3.839*x*(1-x)"} // 初期値をdefaultValueで設定 (スペースを削除)
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
          ref={nPointsInputRef}
          defaultValue={String(N_points)} // 初期値をdefaultValueで設定
          style={{ width: '80px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="left_input" style={{ marginRight: '5px' }}>Left:</label>
        <input
          type="number"
          id="left_input"
          ref={leftInputRef}
          defaultValue={String(left)} // 初期値をdefaultValueで設定
          style={{ width: '80px', marginRight: '10px' }}
        />
        <label htmlFor="right_input" style={{ marginRight: '5px' }}>Right:</label>
        <input
          type="number"
          id="right_input"
          ref={rightInputRef}
          defaultValue={String(right)} // 初期値をdefaultValueで設定
          style={{ width: '80px' }}
        />
      </div>
    </aside>
  );
}

export default ControlPanel;