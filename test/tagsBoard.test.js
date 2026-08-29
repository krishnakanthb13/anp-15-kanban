import { jest } from '@jest/globals';
import { buildTagsBoard, TAG_PREFIX } from '../lib/api/tagsBoard.js';

describe('tagsBoard', () => {
  function makeApp(notesByTag = {}, tagColors = []) {
    return {
      filterNotes: jest.fn().mockImplementation(async ({ tag }) => notesByTag[tag] || []),
      getTags: jest.fn().mockResolvedValue(tagColors),
    };
  }

  it('builds columns from tag list and cards from matching notes', async () => {
    const notesByTag = {
      todo: [
        { uuid: 'n1', name: 'Note 1', tags: ['todo', 'work'], created: 1700000000, updated: 1700005000 },
        { uuid: 'n2', name: 'Note 2', tags: ['todo'], created: 1700001000, updated: 1700006000 },
      ],
      doing: [
        { uuid: 'n3', name: 'Note 3', tags: ['doing'], created: 1700002000, updated: 1700007000 },
      ],
      done: [],
    };
    const tagColors = [
      { text: 'todo', color: '#ff5555' },
      { text: 'doing', color: '#55ff55' },
    ];
    const app = makeApp(notesByTag, tagColors);

    const board = await buildTagsBoard(app, ['todo', 'doing', 'done']);

    expect(board.kind).toBe('tags');
    expect(board.tags).toEqual(['todo', 'doing', 'done']);
    expect(board.columns).toHaveLength(3);

    expect(board.columns[0]).toMatchObject({
      id: TAG_PREFIX + 'todo',
      name: '#todo',
      tag: 'todo',
      color: '#ff5555',
      isTagColumn: true,
    });
    expect(board.columns[0].cards).toHaveLength(2);
    expect(board.columns[0].cards[0]).toMatchObject({
      id: 'n1',
      title: 'Note 1',
      noteUUID: 'n1',
      tags: ['todo', 'work'],
      isNoteCard: true,
      columnTag: 'todo',
    });
    expect(board.columns[0].cards[0].created).toContain('at');
    expect(board.columns[0].cards[0].updated).toContain('at');

    expect(board.columns[1]).toMatchObject({
      id: TAG_PREFIX + 'doing',
      name: '#doing',
      tag: 'doing',
      color: '#55ff55',
      isTagColumn: true,
    });
    expect(board.columns[1].cards).toHaveLength(1);

    expect(board.columns[2]).toMatchObject({
      id: TAG_PREFIX + 'done',
      name: '#done',
      tag: 'done',
      color: null,
      cards: [],
      isTagColumn: true,
    });
  });

  it('normalizes hashes and trims tag names', async () => {
    const app = makeApp({
      urgent: [{ uuid: 'n9', name: 'Urgent Task Note', tags: ['urgent'] }],
    });
    const board = await buildTagsBoard(app, [' #urgent ', '#important ']);

    expect(board.tags).toEqual(['urgent', 'important']);
    expect(board.columns[0].id).toBe(TAG_PREFIX + 'urgent');
    expect(board.columns[0].name).toBe('#urgent');
    expect(app.filterNotes).toHaveBeenCalledWith({ tag: 'urgent' });
    expect(app.filterNotes).toHaveBeenCalledWith({ tag: 'important' });
  });

  it('handles empty or non-array tags input gracefully', async () => {
    const app = makeApp();
    const board = await buildTagsBoard(app, null);
    expect(board).toMatchObject({ kind: 'tags', tags: [], columns: [], hasHeadings: false });
  });

  it('handles filterNotes API errors gracefully', async () => {
    const app = {
      filterNotes: jest.fn().mockRejectedValue(new Error('Network error')),
      getTags: jest.fn().mockResolvedValue([]),
    };
    const board = await buildTagsBoard(app, ['bug']);
    expect(board.columns).toHaveLength(1);
    expect(board.columns[0].cards).toEqual([]);
  });
});
