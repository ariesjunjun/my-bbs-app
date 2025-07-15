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
