'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Task, Project, TaskDependency } from '@/db/schema';
import Link from 'next/link';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  EdgeChange,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import TaskNode from '@/components/graph/TaskNode';

interface Member {
  id: string;
  name: string;
  email: string;
}

const nodeTypes = {
  taskNode: TaskNode,
};

// Dagreを使ってノードを自動配置
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 75,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function DependencyGraphPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchProject();
      fetchTasks();
      fetchMembers();
    }
  }, [session, params.id]);

  useEffect(() => {
    if (tasks.length > 0) {
      updateGraph();
    }
  }, [tasks, dependencies, members]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${params.id}/tasks`);
      if (response.ok) {
        const data = await response.json();
        const taskList = data.tasks || data;
        setTasks(taskList);

        // 各タスクの依存関係を取得
        const allDependencies: TaskDependency[] = [];
        for (const task of taskList) {
          const depResponse = await fetch(`/api/tasks/${task.id}/dependencies`);
          if (depResponse.ok) {
            const deps = await depResponse.json();
            allDependencies.push(...deps);
          }
        }
        setDependencies(allDependencies);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const updateGraph = () => {
    const newNodes: Node[] = tasks.map((task) => {
      const assignee = members.find((m) => m.id === task.assigneeId);
      return {
        id: task.id,
        type: 'taskNode',
        position: { x: 0, y: 0 },
        data: {
          id: task.id,
          title: task.title,
          status: task.status as 'todo' | 'in_progress' | 'review' | 'done',
          priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
          assigneeName: assignee?.name,
        },
      };
    });

    const newEdges: Edge[] = dependencies.map((dep) => ({
      id: dep.id,
      source: dep.dependsOnTaskId,
      target: dep.taskId,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366F1',
      },
      style: {
        stroke: '#6366F1',
        strokeWidth: 2,
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      try {
        const response = await fetch('/api/task-dependencies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: connection.target,
            dependsOnTaskId: connection.source,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '依存関係の追加に失敗しました');
          return;
        }

        // 依存関係を再取得
        await fetchTasks();
      } catch (error) {
        console.error('Error creating dependency:', error);
        alert('依存関係の追加に失敗しました');
      }
    },
    []
  );

  const handleEdgesChange = useCallback(
    async (changes: EdgeChange[]) => {
      // 削除イベントを検出
      const removeChanges = changes.filter((change) => change.type === 'remove');

      if (removeChanges.length > 0) {
        // 確認ダイアログを表示
        if (!confirm('選択した依存関係を削除してもよろしいですか？')) {
          // キャンセルされた場合は削除以外の変更のみ適用
          const nonRemoveChanges = changes.filter((change) => change.type !== 'remove');
          setEdges((eds) => applyEdgeChanges(nonRemoveChanges, eds));
          return;
        }

        // OKの場合は削除を実行
        try {
          await Promise.all(
            removeChanges.map(async (change) => {
              if (change.type === 'remove') {
                const response = await fetch(`/api/task-dependencies/${change.id}`, {
                  method: 'DELETE',
                });
                if (!response.ok) {
                  throw new Error(`Failed to delete dependency ${change.id}`);
                }
              }
            })
          );

          // 依存関係を再取得
          await fetchTasks();
        } catch (error) {
          console.error('Error deleting dependency:', error);
          alert('依存関係の削除に失敗しました');
          // エラーの場合は画面を更新して元に戻す
          await fetchTasks();
        }
      } else {
        // 削除以外の変更はそのまま適用
        setEdges((eds) => applyEdgeChanges(changes, eds));
      }
    },
    [setEdges]
  );

  if (isPending || isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/projects"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  プロジェクト
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <Link
                  href="/settings"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  設定
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href={`/projects/${params.id}`}
                  className="text-gray-500 hover:text-gray-700 mr-4"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project?.name} - 依存関係グラフ
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    タスク間の依存関係を可視化。ノードをドラッグして接続すると依存関係を追加できます
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/projects/${params.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  リストビュー
                </Link>
                <Link
                  href={`/projects/${params.id}/board`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  カンバンボード
                </Link>
              </div>
            </div>
          </div>

          {/* グラフ */}
          <div className="bg-white rounded-lg shadow" style={{ height: 'calc(100vh - 250px)' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgesFocusable={true}
              edgesUpdatable={false}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          {/* 凡例 */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">操作方法</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• ノードをドラッグ: グラフを整理</li>
              <li>• ノードの端からドラッグ: 依存関係を追加（上から下へ）</li>
              <li>• 矢印をクリックして選択 → Backspace/Delete キー: 依存関係を削除</li>
              <li>• マウスホイール: ズーム</li>
              <li>• 右クリック + ドラッグ: グラフ全体を移動</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
