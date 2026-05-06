import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useNotes } from '../hooks/useNotes';
import { useTargets } from '../hooks/useTargets';
import { usePlans } from '../hooks/usePlans';

export function AddNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNote, updateNote, deleteNote, getNote } = useNotes();
  const { targets } = useTargets();
  const { plans } = usePlans();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const note = getNote(id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTargetId(note.targetId || '');
        setPlanId(note.planId || '');
      }
    }
  }, [id, isEdit, getNote]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('请输入笔记标题');
      return;
    }

    if (!content.trim()) {
      toast.error('请输入笔记内容');
      return;
    }

    const noteData = {
      title,
      content,
      targetId: targetId || undefined,
      planId: planId || undefined,
    };

    if (isEdit && id) {
      updateNote(id, noteData);
      toast.success('保存成功');
    } else {
      addNote(noteData);
      toast.success('笔记创建成功');
    }
    navigate('/notes');
  };

  const handleDelete = () => {
    if (id) {
      deleteNote(id);
      toast.success('笔记已删除');
      navigate('/notes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title={isEdit ? '编辑笔记' : '新增笔记'}
        showBack
        rightElement={
          isEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              删除
            </Button>
          )
        }
      />

      <div className="max-w-screen-xl mx-auto p-4">
        <div className="bg-white rounded-lg p-4 space-y-6">
          <div>
            <Label htmlFor="title">笔记标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="content">笔记内容 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法..."
              className="mt-2 min-h-64"
            />
          </div>

          <div>
            <Label htmlFor="target">关联目标</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择目标（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无</SelectItem>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan">关联计划</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择计划（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#e9b893] to-[#d4c5b9] hover:opacity-90 text-white"
          >
            保存
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复，确定要删除这条笔记吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-gradient-to-r from-[#d4726f] to-[#e9b893] hover:opacity-90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}