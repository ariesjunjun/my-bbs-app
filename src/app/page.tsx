"use client"; // Next.jsのApp Routerで、クライアントコンポーネントであることを明示

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Supabaseクライアントをインポート
import toast from "react-hot-toast";

// 投稿の型定義
type Post = {
  id: number;
  content: string;
  created_at: string;
  name?: string;
  parent_id?: number | null;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editName, setEditName] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: true });
    setPosts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      content: newPost,
      name: name.trim() || null,
      parent_id: replyToId,
    });
    if (error) {
      console.log("投稿エラー：", error);
      toast.error("投稿に失敗しました");
    } else {
      setNewPost("");
      setName("");
      setReplyToId(null);
      fetchPosts();
      toast.success("投稿しました！");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.log("削除エラー：", error);
      toast.error("削除に失敗しました");
    } else {
      fetchPosts();
      toast.success("削除しました");
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
    setEditName(post.name || "");
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ content: editContent, name: editName.trim() || null })
      .eq("id", editingId);
    if (error) {
      console.log("更新エラー：", error);
      toast.error("更新に失敗しました");
    } else {
      setEditingId(null);
      setEditContent("");
      setEditName("");
      fetchPosts();
      toast.success("更新しました");
    }
  };

  const renderPosts = (parentId: number | null = null, level: number = 0) => {
    return posts
      .filter((post) => post.parent_id === parentId)
      .map((post) => (
        <li
  key={post.id}
  className={`p-4 rounded shadow ml-${level * 4} ${
    post.parent_id ? "bg-pink-50" : "bg-white"
  }`}
>
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
                <button
                  onClick={handleUpdate}
                  className="bg-pink-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2"
                >
                  更新
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2"
                >
                  キャンセル
                </button>
              </div>
            </>
          ) : (
            <>
                <p className="text-xs text-gray-400 mb-1">ID: {post.id}</p>
                <p>{post.content}</p>
              <div className="flex justify-between">
                <div className="text-sm text-gray-500 block mt-2 flex gap-x-5">
                  <span>{post.name ? `投稿者： ${post.name}` : `投稿者：匿名`}</span>
                  <span>投稿日：{new Date(post.created_at).toLocaleString("ja-JP")}</span>
                </div>
                <div>

{post.parent_id === null && (
  <button
    onClick={() => setReplyToId(post.id)}
    className="bg-green-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2"
  >
    返信
  </button>
)}


                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-pink-500 text-white py-1 px-2 rounded hover:underline text-sm mr-2"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-gray-500 text-white py-1 px-2 rounded hover:underline text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              <ul className="mt-2 space-y-2">
                {renderPosts(post.id, level + 1)}
              </ul>
            </>
          )}
        </li>
      ));
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">みんなの雑談掲示板</h1>
      {replyToId && (
        <div className="mb-2 text-sm text-gray-600">
          <span>返信対象ID: {replyToId}</span>
          <button
            type="button"
            onClick={() => setReplyToId(null)}
            className="ml-2 text-blue-500 underline text-xs"
          >
            取り消し
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="投稿内容を入力..."
          className="w-full p-3 rounded resize-none bg-white border"
          rows={3}
        ></textarea>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（任意）"
          className="w-full p-2 rounded mb-2 bg-white border"
        />
        <button
          type="submit"
          disabled={loading || !newPost.trim()}
          className="mt-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          投稿
        </button>
      </form>
      <ul className="space-y-4">{renderPosts()}</ul>
    </div>
  );
}
