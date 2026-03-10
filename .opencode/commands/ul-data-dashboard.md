---
description: View comprehensive dashboard with all learning metrics (/ul-data-dashboard)
agent: tutor
subtask: false
---

Generate a comprehensive dashboard showing all learning metrics using the 'dashboard' tool with operation 'show'.

Display:
- **Summary**: Streak, best streak, total sessions, weekly study time
- **Effectiveness**: Most effective technique, least used technique
- **Patterns**: Best period to study, ideal session duration
- **Weaknesses**: Topics with error_rate > 0.3 and suggested techniques

If user wants to compare periods, use operation 'compare' with appropriate period (week or month).

Present the information in a visually appealing format with emojis and clear sections.

Include recommendations based on the data:
- If weaknesses found, suggest tackling them first
- If best period identified, suggest scheduling difficult sessions then
- If ideal duration found, suggest optimizing session length

**Usage:**
- `/ul-data-dashboard` - Show current week dashboard
- `/ul-data-dashboard month` - Show monthly dashboard (if supported)
