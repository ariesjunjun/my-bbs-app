export default function NewThreadPage() {
    return (
      <div>
        <h1 className="text-lg font-semibold mb-2">新規スレッド作成</h1>
        {/* フォームコンポーネント：タイトル、本文、画像添付、匿名or名前選択など */}
      </div>
    );
  }

  // スレッド詳細ページ（スレッド本文＋返信）
  app/threads/[threadId]/page.tsx

  import { useParams } from 'next/navigation';

  export default function ThreadDetailPage() {
    const params = useParams();
    const { threadId } = params;

    return (
      <div>
        <h1 className="text-lg font-semibold mb-2">スレッド詳細</h1>
        {/* スレッド内容と返信の表示、返信フォーム */}
      </div>
    );
  }
