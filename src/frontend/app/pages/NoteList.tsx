import { Link } from 'react-router';
import { Plus, FileText, Clock } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { useNotes } from '../hooks/useNotes';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function NoteList() {
  const { notes } = useNotes();
  const { targets } = useTargets();
  const { plans } = usePlans();

  const getTargetName = (targetId?: string) => {
    if (!targetId) return null;
    const target = targets.find(t => t.id === targetId);
    return target?.title;
  };

  const getPlanName = (planId?: string) => {
    if (!planId) return null;
    const plan = plans.find(p => p.id === planId);
    return plan?.title;
  };

  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-20">
      {/* 顶部栏 */}
      <div className="bg-white/95 backdrop-blur-lg" style={{boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-[#4a4a4a]">笔记</h1>
            <Link to="/notes/new">
              <button className="w-8 h-8 bg-gradient-to-br from-[#e9b893] to-[#d4c5b9] rounded-full flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-5">
        {sortedNotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="暂无笔记"
            description="创建你的第一条笔记，记录想法和灵感"
          />
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note) => {
              const targetName = getTargetName(note.targetId);
              const planName = getPlanName(note.planId);

              return (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <div
                    className="bg-white rounded-[20px] p-5 transition-all hover:scale-[1.01]"
                    style={{boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'}}
                  >
                    <h3 className="font-medium text-[#4a4a4a] mb-2">{note.title}</h3>

                    <p className="text-sm text-[#8b8680] mb-3 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-[#8b8680]">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(note.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhCN })}</span>
                      </div>

                      {targetName && (
                        <Badge variant="outline" className="text-xs text-[#88a096] border-[#88a096] rounded-full">
                          {targetName}
                        </Badge>
                      )}

                      {planName && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          {planName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}