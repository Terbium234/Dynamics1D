// client/src/utils/functionUtils.js
import { compile } from 'mathjs';

/**
 * math.js を使用して文字列形式の数式を安全にコンパイルし、
 * x を引数として評価できる関数を返します。
 * @param {string} expressionString - ユーザーが入力した数式文字列 (例: "x * 2", "sin(x) + x^2")
 * @returns {Function|null} コンパイル成功時は (xValue) => result の形の関数、失敗時はnull
 */
export function safeFunctionParser(expressionString) {
  try {
    if (!expressionString || typeof expressionString !== 'string' || expressionString.trim() === '') {
      console.error("無効な数式文字列です。");
      return null;
    }
    const compiledExpression = compile(expressionString);

    // x を引数に取り、コンパイルされた式を評価する関数を返す
    return (xValue) => {
      // スコープオブジェクトに変数を渡す
      return compiledExpression.evaluate({ x: xValue });
    };
  } catch (error) {
    console.error("関数パースエラー:", error);
    return null;
  }
}