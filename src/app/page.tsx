"use client"; // Next.jsのApp Routerで、クライアントコンポーネントであることを明示

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Supabaseクライアントをインポート
import toast from "react-hot-toast";

// 投稿の型定義
type Post = {
  id: number; // 投稿ID
  content: string; // 投稿内容
  created_at: string; // 作成日時
  name?: string; // 投稿者の名前（任意）
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 投稿一覧のステート（初期値は空配列）
  const [newPost, setNewPost] = useState(""); // 新規投稿の入力値
  const [loading, setLoading] = useState(false); // ローディング状態
  const [name, setName] = useState(""); // 名前入力フィールドの状態
  const [editingId, setEditingId] = useState<string | null>(""); // 編集中の投稿ID
  const [editContent, setEditContent] = useState(""); // 編集用の投稿内容
  const [editName, setEditName] = useState(""); // 編集用の名前

  // コンポーネントがマウントされたときに投稿を取得
  useEffect(() => {
    fetchPosts();
  }, []);

  // 投稿一覧をSupabaseから取得
  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  // 投稿フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.trim()) return; // 空白のみの投稿を防止

    setLoading(true); // ローディング状態を開始

    // Supabaseに新規投稿を挿入
    const { error } = await supabase.from("posts").insert({
      content: newPost,
      name: name.trim() || null,
    });

    if (error) {
      console.log('投稿エラー：', error)
      toast.error('投稿に失敗しました')
    } else {
setNewPost('')
setName('')
fetchPosts()
toast.success('投稿しました！')
    }

    setLoading(false); // ローディング終了
  };

  // 投稿削除処理
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.log('削除エラー：', error)
      toast.error('削除に失敗しました')
    } else {fetchPosts() // 削除成功時は投稿一覧を更新
      toast.success('削除しました')
  }}

  // 編集モードに切り替える処理
  const handleEdit = (post: Post) => {
    setEditingId(post.id); // 編集対象の投稿IDを設定
    setEditContent(post.content); // 投稿内容をステートにセット
    setEditName(post.name || ""); // 名前をステートにセット（匿名時は空文字）
  };

  // 投稿の更新処理
  const handleUpdate = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ content: editContent, name: editName.trim() || null }) // 新しい内容と名前を送信
      .eq("id", editingId); // 対象の投稿を指定

    if (error) {
      console.log('更新エラー：',error)
      toast.error('更新に失敗しました')

    } else {
      setEditingId(null); // 編集モードを解除
      setEditContent('')
      setEditName('')
      fetchPosts(); // 投稿一覧を更新
      toast.success('更新しました')
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-6">掲示板アプリ</h1>

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="投稿内容を入力..."
          className="w-full p-3 border rounded resize-none"
          rows={3}
        ></textarea>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（任意）"
          className="w-full p-2 border rounded mb-2"
        />

        <button
          type="submit"
          disabled={loading || !newPost.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          投稿
        </button>
      </form>

      {/* 投稿一覧 */}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="p-4 border rounded shadow">
            {editingId === post.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="border w-full"
                />

                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border w-full"
                  placeholder="投稿者名を入力"
                />
                <div>
                  <button onClick={handleUpdate}
                  className="bg-blue-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2">更新</button>

                  <button onClick={() => setEditingId(null)}
                    className="bg-blue-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2">キャンセル</button>
                </div>
              </>
            ) : (
              <>
                {/* 投稿の本文 */}
                <p>{post.content}</p>

                <div className="flex justify-between">
                  {/* 投稿者名と日時 */}
                  <div className="text-sm text-gray-500 block mt-2 flex gap-x-5">
                    <span>
                      {post.name ? `投稿者： ${post.name}` : `投稿者：匿名`}
                    </span>
                    <span>
                      投稿日：
                      {new Date(post.created_at).toLocaleString("ja-JP")}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => handleEdit(post)}
                      className="bg-blue-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2"
                    >
                      編集
                    </button>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500 text-white py-1 px-2 rounded hover:underline text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
