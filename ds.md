A plugin that mimics a kanban board.

The initial version of this plugin should convert a note into a kanban view, where each column corresponds to a heading in the note, and each card correspond to a task in the heading. Further versions could do the same, but columns = tags, cards = notes.

## Core functionality

1. **Cards:**
   * a. Dragging and dropping a card between columns also moves it between headings
   * b. Dragging a task into the last column marks it as crossed out inside the note
   * c. Plugin allows creation of new cards using a `+` button in each column
   * d. Allow a per-column upper limit of tasks
   * e. Allow editing a card when clicking into it; this will display pure markdown
   * f. We should recognize and display Rich Footnotes in the task's description (only when viewing); these should be functional when clicked:
      * i. So web URLs should work when clicked
      * ii. Note links should be opened in the peek viewer chat - Probably support for this coming soon
      * iii. RFs containing any combinations of images, text and URLs should be opened as an embed in the sidebar
   * g. The first image found in the task body should be embedded in the card at the bottom

2. **Columns:**
   * a. Create new columns
   * b. Delete a column (and move existing tasks to the top of the note, under no heading in particular)
   * c. Edit the name of a column (which edits the text of the heading)
   * d. Columns can be reordered (which reorders headings)

3. **Refresh button**

4. **Extra functionality:**
   * a. Option to "tag" or "label" a card with a note (which adds a link to that note in the underlying task)
      * i. Labeling a card will color code it using the color-giving tag of the note chat - TBD how to treat the case where there are more labels
   * b. [Attribute dates to cards](https://publish.obsidian.md/kanban/How+do+I/Add+a+date+to+a+card) (which results in start dates in tasks)
   * c. [Create note from card](https://publish.obsidian.md/kanban/How+do+I/Create+notes+from+cards)
   * d. [Search functionality](https://publish.obsidian.md/kanban/How+do+I/Search+a+Kanban+board)

5. **Settings:**
   * a. [Customizable date format](https://publish.obsidian.md/kanban/Settings/Date+display+format)

---

Additional Requirements:

- Support Tabs - should be persistant, and data refreshed when switching between tabs
- Cycling Theme Support - [reference file](../common-issues-and-fixes/cycling-themes.md) - choose the best should be equal in both light and dark themes
- Each Tab should either be a board based on single Note with headers as columns, or a board based on a tag with notes as cards and sub-tags (or lack thereof) as columns
1. Selecting a single note, and its headers act as columns, and its tasks under the headers as cards
2. Selecting a single tag, and its notes act as columns, and its headers should be collapsable blocks in the same column, and the tasks under the headers as cards
3. currently some sub tags concept, see if you can improve it or just remove that concept
- when creating a new tab with a note - it should create it under tag "-reports/-kanban"
- When dragging a card the columns and headings between tabs should also update the note
- If the Column is reordered, then the headings in the note should be reordered in the same way in the note along with all the content under it or between it, do you get it. Also possible Addition, Removal (upon approval) of columns, tasks. This applies to both types of boards.
- For boards based on tags, if a note is created outside of the plugin and assigned a tag that is associated with that board, it should appear as a card in the board when opened.
- Clear visual marker should be for tag and note based tab. Name of the note or tag should be the tab name, if too lengthy then should be cut.
- Ability to add multiple tags also should be possible.
- Make the UI and UX modern and clean and simple and fast.
- Also add a refresh button to pull single tab, and all tabs data.
- Show a proper progress bar when it is syncing.
- See if you can bring in more useful features to proceed with.
- check what all features that can be salvaged from the old plugin - [text](kanban-old.js)

---

1. Update the [text](../common-issues-and-fixes/cycling-themes.md) - of the themes used in Kanban.
2. It should not show the notes or headers as columns if they are empty.
3. Everytime I click on a Tab, the whole screen flikers - something like it flashes.
4. explain the use cases of the 4 options when clicking the 3 dot button
Edit task details (full dialog)
Add label (note link)
Set start date / deadline
Create note from card
5. Dashboard Sorting vs Note Persisted Sorting - there should be an another options to reset to the order how it is present in the source note. correct?

---

1. It should not show the notes or headers as columns if they are empty.
i remember we implemented this - can you make this happen like a button on the top - show empty notes or header or hide, it will be useful when a note or tagged notes all do not have any tasks in them
and
2. add an another button on top to collapse all info or expand all info for all the task in the current window - it will be helpful
and
3. add a at button for every task - this again should be enabled only by pressing a button on top to add date using a date selector - possible, and again hitting the top button should disable the button on hover

---

I am going to start testing all the features how they work and everything.
[anp-15-kanban](./)
- before I do that, the UI and UX and everything looks and works good
- add, remove, move, create, rename, weather its a note, header or task in any tag, note, notes tab and all the buttons, I want you to check with amplenotes documentation online or [amplenote_references](../amplenote_references/)
- if it does what is says and what it is suppose to do
- once you check, give me a check list that you think that covers all the things I need to manually test in live env, I will be curious and explore all possiblilites and will get back with feedback for changes or fine tweaking
- and around 1000 active users are using [kanban-board.js](./kanban-board.js) and it seems be working fine for them, it is a very basic one, see if you can pick up any tips and tricks when making the above mentioned check.
= My main focus now is to check and validate all features that interact with the amplenote backend, to check if all are well integrated.

---
