import { jest } from '@jest/globals';
import { handleRefreshPage } from '../lib/features/refreshPage.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';

describe("refreshPage", () => {
  it("calls refreshKanbanPage", async () => {
    const appMock = {
      settings: { "Current_Note_UUID [Do not Edit!]": "dest-uuid" },
      replaceNoteContent: jest.fn().mockResolvedValue(),
      navigate: jest.fn().mockResolvedValue(),
      context: { pluginUUID: "plugin-uuid" }
    };
    await handleRefreshPage(appMock);
    expect(appMock.replaceNoteContent).toHaveBeenCalled();
  });
});
