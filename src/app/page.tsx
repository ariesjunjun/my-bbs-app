'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabaseClient";

export default function Home() {
  const [threads, setThreads] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchThreads() {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setThreads(data);
      }
    }

    fetchThreads();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">スレッド一覧</h1>
      <ul className="space-y-4">
        {threads.map((thread: any) => (
          <li key={thread.id} className="border p-4 rounded-md shadow-sm">
            <h2 className="text-lg font-semibold">{thread.title}</h2>
            <p className="text-sm text-slate-600">{thread.created_at}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
