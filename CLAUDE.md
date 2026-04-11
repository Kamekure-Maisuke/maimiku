# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 簡潔かつ分かりやすい回答をすること。長い文章で答えない。

## アーキテクチャ
Deno/TypeScript で書かれたターミナルCLIツール。

## 視点
世界的なエンジニア視点で、工学的かつ視覚的にも誰でも理解できるようなデータ設計やコーディングを行うこと。

## コーディング方針

### ライブラリ
- カラー出力は `@std/fmt/colors` の名前付き関数を使う（`rgb8` などの独自定数は作らない）
- テーブル・カラム整形は `@cliffy/table` を使う

### ファイル構成
責務を適切に分ける。過剰な分割はしない。
- `db.ts` — データ層。KV操作のみ。UIに依存しない
- `ui.ts` — 表示層。出力・描画のみ。ビジネスロジックに依存しない
- `*.ts`（エントリーポイント） — ルーティングと orchestration のみ

### スタイル
- エラー処理は `fail()` に集約し、`console.error + Deno.exit` を直接書かない
- 重複するロジックは共通ヘルパーに抜き出す（例: add/subtract → `applyScore`）
- 依存方向は一方向に保つ（循環依存禁止）
