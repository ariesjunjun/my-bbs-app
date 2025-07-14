'use client' // Next.jsのApp Routerで、クライアントコンポーネントであることを明示

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Supabaseクライアントをインポート

// 投稿の型定義
type Post = {
  id: number          // 投稿ID
  content: string      // 投稿内容
  created_at: string  // 作成日時
}

export default function Home() {
  // 投稿一覧のステート（初期値は空配列）
  const [posts, setPosts] = useState<Post[]>([])

  // 新規投稿の入力値
  const [newPost, setNewPost] = useState('')

  // ローディング状態（投稿中などに使う）
  const [loading, setLoading] = useState(false)

  // コンポーネントが最初にマウントされたときに投稿を取得する
  useEffect(() => {
fetchPosts()
  }, [])

  // 投稿一覧をSupabaseから取得
  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')                        // posts テーブルから
      .select('*')                          // 全カラム取得
      .order('created_at', {ascending: false}) // 作成日時で降順に並べる（新しい順）

    setPosts(data || []) // データがあればセット。nullなら空配列
  }

  // 投稿フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ（フォームのデフォルト動作を止める）

    if (!newPost.trim()) return // 空白だけの投稿は無視

    setLoading(true) // 投稿中フラグON

    // Supabaseに新規投稿を追加
    const { error } = await supabase
      .from('posts')
      .insert({ content: newPost })

    if (!error) {
      setNewPost('')   // 入力フォームをリセット
      fetchPosts()     // 投稿一覧を更新
    }

    setLoading(false) // 投稿完了
  }

  return (
    // 中央寄せ・余白・幅制限付きのコンテナ
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-6">掲示板アプリ</h1>

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newPost} // テキストエリアの値（投稿内容）
          onChange={(e) => setNewPost(e.target.value)} // 入力時にステート更新
          placeholder="投稿内容を入力..." // プレースホルダ
          className="w-full p-3 border rounded resize-none" // 見た目の調整
          rows={3} // 3行表示
        >
        </textarea>

        <button
          type="submit"
          disabled={loading || !newPost.trim()} // 投稿中または空入力時はボタン無効
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          投稿
        </button>
      </form>

      {/* 投稿一覧 */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="p-4 border rounded shadow">
            {/* 投稿の本文 */}
            <p>{post.content}</p>
            {/* 投稿日時を日本語で表示 */}
            <span className="text-sm text-gray-500 block mt-2">
              投稿日：{new Date(post.created_at).toLocaleString('ja-JP')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
