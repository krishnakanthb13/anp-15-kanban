import { jest } from '@jest/globals';
import { handleToggleSort } from '../lib/features/toggleSort.js';
import { refreshKanbanPage } from '../lib/api/noteManager.js';

describe("toggleSort - handleToggleSort", () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      prompt: jest.fn(),
      setSetting: jest.fn().mockResolvedValue()
    };
    jest.clearAllMocks();
  });

  it("updates setting and refreshes", async () => {
    appMock.settings["Toggle Sort"] = "startDate";
    appMock.prompt.mockResolvedValue("taskScore");

    await handleToggleSort(appMock);

    expect(appMock.setSetting).toHaveBeenCalledWith("Toggle Sort", "taskScore");
  });

  it("returns early if cancelled", async () => {
    appMock.prompt.mockResolvedValue(null);

    await handleToggleSort(appMock);

    expect(appMock.setSetting).not.toHaveBeenCalled();
  });
});
