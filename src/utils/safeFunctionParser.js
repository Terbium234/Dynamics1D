const { VM } = require('vm2');

function createSafeFunction(userInput) {
  const vm = new VM({
    timeout: 1000,           // 無限ループ対策（1秒まで）
    sandbox: { Math }        // Math だけ使えるようにする
  });

  try {
    // 括弧で囲んで「関数式」として評価する
    const func = vm.run(`(${userInput})`);

    if (typeof func !== 'function') {
      throw new Error("入力は関数ではありません。");
    }

    // テスト実行して、出力が数値かをチェック
    const testX = 1;
    const result = func(testX);
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error("関数の返り値が実数ではありません。");
    }

    return func;  // 安全確認済みの関数を返す

  } catch (err) {
    console.error("関数の検証・実行に失敗:", err.message);
    return null;
  }
}
