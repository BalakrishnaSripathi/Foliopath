import { useState } from "react";

export default function useListMovable(initialList = [], options = {}) {
  const { movingId: externalMovingId, setMovingId: externalSetMovingId } = options;
  const [list, setList] = useState(initialList);
  const [internalMovingId, setInternalMovingId] = useState(null);

  const movingId =
    externalMovingId !== undefined ? externalMovingId : internalMovingId;
  const setMovingId =
    externalSetMovingId !== undefined ? externalSetMovingId : setInternalMovingId;

  const getIndex = (items, id) => items.findIndex((item) => item.id === id);

  const canMoveUp = (id) => getIndex(list, id) > 0;

  const canMoveDown = (id) => {
    const idx = getIndex(list, id);
    return idx >= 0 && idx < list.length - 1;
  };

  const moveItem = (id, dir) => {
    const next = [...list];
    const idx = getIndex(next, id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= next.length) return null;
    [next[idx], next[target]] = [next[target], next[idx]];
    const reindexed = next.map((item, i) => ({
      ...item,
      displayOrder: i + 1,
    }));
    setList(reindexed);
    return reindexed;
  };

  const moveUp = (id) => moveItem(id, -1);
  const moveDown = (id) => moveItem(id, 1);

  return {
    list,
    setItems: setList,
    movingId,
    setMovingId,
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
  };
}
