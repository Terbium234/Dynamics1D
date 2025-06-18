// client/src/App.js
import React,{useState ,useEffect} from 'react';
import Header from './components/Header';
import * as d3 from 'd3'; // d3をインポート
import ControlPanel from './components/ControlPanel';
import PlotArea from './components/PlotArea';
import './App.css'; // 必要に応じてグローバルCSSをインポート
import BContainer from './components/BContainer'; // ファイル名とコンポーネント名を BContainer に変更

function App() {
  const [plotCount, setPlotCount] = useState(0); // 表示するB_i_Plotの数を管理
  const [N_points, setN_points] = useState(1000); // N_pointsをstateで管理
  const [left, setLeft] = useState(0); // leftをstateで管理
  const [right, setRight] = useState(1); // rightをstateで管理
  const [pointsData, setPointsData] = useState([]); // N個の点の時系列データを管理
  const [parsedFunction, setParsedFunction] = useState(null); // パースされた関数を保持
  // 明るい水色 -> ライムグリーン -> 黄色 -> 明るいオレンジ のグラデーション
  const [colorPalette, setColorPalette] = useState([
    d3.scaleLinear()
      .domain([0, 0.33, 0.66, 1]) // グラデーションの変化点を4つに分割
      .range(["rgba(135, 206, 250, 0.7)", "rgba(50, 205, 50, 0.7)", "rgba(255, 255, 0, 0.7)", "rgba(255, 165, 0, 0.7)"]) // 各変化点の色を指定
      .interpolate(d3.interpolateRgb) // 色空間の補間方法
  ]);



  const handleAddPlot = () => {
    setPlotCount(prevCount => prevCount + 1);
  };

  // N_pointsが変更されたときに点の初期データを生成する
  useEffect(() => {
  // N_points, left, right のいずれかが変更されるとこのフックが実行されます

    // 条件1: N_pointsが0以下の場合の処理
    if (N_points <= 0) {
      setPointsData([]); // 点のデータを空にする
      setPlotCount(0);   // B_i_Plotの数をゼロに戻す
      return;
    }

    // 条件2: 点の初期位置を再計算
    const step = (right - left) / (N_points > 1 ? N_points -1 : 1);
    const interpolator = colorPalette[0]; // App.jsで管理しているカラーパレットを使用
    const range = right - left;

    const initialPoints = Array.from({ length: N_points }, (_, i) => {
      const initialX = N_points === 1 ? left + (right - left) / 2 : left + i * step;
      let color;
      if (range === 0) {
        color = interpolator(0.5);
      } else {
        const relativePos = Math.max(0, Math.min(1, (initialX - left) / range));
        color = interpolator(relativePos);
      }
      if (d3.color(color)) {
        color = d3.color(color).copy({opacity: 0.7}).toString();
      }

      return {
        id: `point-${i}`,
        positions: [{ time: 0, x: initialX }], // 時刻0の初期位置を登録
        dragged: false, // 初期状態ではドラッグされていない
        initialColor: color, // 初期位置のグラデーション色を保持
      };
    });
    setPointsData(initialPoints); // 再計算された初期位置で点のデータを更新

    // 条件3: B_i_Plotの数をゼロに戻す
    setPlotCount(0); // plotCountを0にリセットし、時刻0のデータは表示準備完了状態とする

  }, [N_points,left,right,parsedFunction, colorPalette]); // colorPaletteも依存配列に追加

  // left, right が変更されたときにカラーパレットを更新 (現在は固定のカスタムスケールなので、このuseEffectは不要になるか、別のロジックに変更可能)
  useEffect(() => {
    if (typeof left === 'number' && typeof right === 'number') {
      // 必要に応じて、leftやrightの値に基づいてdomainやrangeを動的に変更するロジックをここに追加できます。
      // 今回は固定のカスタムスケールを使用するため、現状のままでも動作しますが、
      // Appの初期化時に一度だけ設定したい場合は、このuseEffectは削除しても構いません。
      // setColorPalette([d3.interpolateViridis]); // Viridisに戻す場合の例
      // ここでは、初期値と同じカスタムスケールを再設定する形になっています。
      // より動的にしたい場合は、この部分のロジックを調整してください。
    }
  }, [left, right]);


  // plotCountが変更されたとき（新しい反復が追加されたとき）に、
  // 各点の新しい位置情報を生成して追加する
  useEffect(() => {
    // plotCountが0の場合は、初期状態（またはN_points変更直後）なので何もしない
    if (plotCount === 0) {
      // 時刻0のデータはN_pointsのuseEffectで設定済みなので、ここでは追加処理をしない
      return; 
    }

    setPointsData(prevPointsData => {
      // pointsDataがまだ初期化されていない場合は何もしない（N_pointsのuseEffectで初期化される）
      if (!prevPointsData || prevPointsData.length === 0) return prevPointsData;

      return prevPointsData.map(point => ({
        ...point,
        // 新しい時刻の位置。時刻は現在のplotCountの値とする
        // 最後の位置を取得し、それに関数を適用する（より現実的なシミュレーションのため）
        positions: [
          ...point.positions,
          {
            time: plotCount,
            x: parsedFunction
              ? parsedFunction(point.positions[point.positions.length - 1]?.x) // math.jsでコンパイルされた関数を呼び出す
              : Math.random() * (right - left) + left // パースされた関数がなければランダム
          }
        ]
      }));
    });
  }, [plotCount, left, right, parsedFunction]); // parsedFunction も依存配列に追加


  return (
    <div className="App">
      <Header />
      <div className="main-content">
        {/* 左側のセクション：PlotAreaとControlPanelを縦に並べる */}
        <div className="left-section">
          <PlotArea
            pointsData={pointsData}
            setPointsData={setPointsData}
            parsedFunction={parsedFunction}
            left={left}
            right={right}
            colorPalette={colorPalette} // AppからPlotAreaへカラーパレットを渡す
          />
          <ControlPanel
            onAddPlot={handleAddPlot}
            N_points={N_points}
            setN_points={setN_points}
            left={left}
            setLeft={setLeft}
            right={right}
            setRight={setRight}
            onFunctionParsed={setParsedFunction} // パースされた関数をAppに渡す
          />
        </div>
        {/* 右側のセクション：B_Container */}
        <div className="right-section">
          <BContainer
            plotCount={plotCount}
            pointsData={pointsData} // 点のデータをB_Containerに渡す (時刻情報はplotCountやpositions内のtimeで判断)
            left={left} // BContainer経由でBiPlotへ渡す
            right={right} // BContainer経由でBiPlotへ渡す
            colorPalette={colorPalette} // BContainer経由でBiPlotへ渡す
            setPointsData={setPointsData} // BiPlotでの選択結果をAppのstateに反映させるため
          />
        </div>
      </div>
      {/* <Footer /> 必要であれば */}
    </div>
  );
}
export default App;