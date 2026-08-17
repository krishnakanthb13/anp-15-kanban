import { jest } from '@jest/globals';
import { handleUpdateTag } from '../lib/features/updateTag.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';

describe("updateTag - handleUpdateTag", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      prompt: jest.fn(),
      setSetting: jest.fn().mockResolvedValue()
    };
    jest.clearAllMocks();
  });

  it("updates tag setting and refreshes", async () => {
    appMock.settings["Kanban Filter Tag"] = "-old";
    appMock.prompt.mockResolvedValue("-new");

    await handleUpdateTag(appMock);

    expect(appMock.setSetting).toHaveBeenCalledWith("Kanban Filter Tag", "-new");
  });

  it("returns early if cancelled", async () => {
    appMock.prompt.mockResolvedValue(null);

    await handleUpdateTag(appMock);

    expect(appMock.setSetting).not.toHaveBeenCalled();
  });
});
