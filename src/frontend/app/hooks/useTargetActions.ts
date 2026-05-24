import { useTargets } from './useTargets';
import { useTodos } from './useTodos';
import { usePlans } from './usePlans';

export function useTargetActions() {
  const { deleteTarget } = useTargets();
  const { deleteTodosByTargetId, getTodosByTarget } = useTodos();
  const { deletePlansByTargetId, getPlansByTarget } = usePlans();

  const removeTargetCascade = async (targetId: string) => {
    await deleteTodosByTargetId(targetId);
    await deletePlansByTargetId(targetId);
    await deleteTarget(targetId);
  };

  return {
    removeTargetCascade,
    getTodosByTarget,
    getPlansByTarget,
  };
}
