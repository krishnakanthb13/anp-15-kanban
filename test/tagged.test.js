import { jest } from '@jest/globals';
import { handleTagged } from '../lib/features/tagged.js';
import { getOrCreateKanbanNote } from '../lib/api/noteManager.js';

describe("tagged - handleTagged", () => {
  it("replaces content and navigates", async () => {
    const appMock = {
      context: { pluginUUID: "plugin-uuid" },
      settings: { "Current_Note_UUID [Do not Edit!]": "dest-uuid" },
      replaceNoteContent: jest.fn().mockResolvedValue(),
      navigate: jest.fn().mockResolvedValue()
    };

    const result = await handleTagged(appMock);

    expect(appMock.replaceNoteContent).toHaveBeenCalledWith(
      { uuid: "dest-uuid" },
      expect.stringContaining("plugin-uuid")
    );
    expect(appMock.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/dest-uuid");
    expect(result).toBeNull();
  });
});
