---
description: Manage system data (initialize, reset)
agent: tutor
subtask: false
---

Data management command for the Ultralearning System.

## Operations

### /data init
Initialize the CSV data structure. Creates all necessary files if they don't exist.

Use this when:
- Setting up the system for the first time
- After pulling the repository to a new machine
- If data files are missing or corrupted

### /data reset
⚠️ WARNING: This deletes ALL data including sessions, streaks, flashcards, and progress!

Use this when:
- Starting fresh with a clean slate
- Testing the system (development only)

**Always confirm with the user before resetting data.**

## Available Operations

Ask the user which operation they want to perform:
- "init" - Initialize data structure
- "reset" - Reset all data (requires confirmation)

Execute the appropriate operation using the 'data' tool.
