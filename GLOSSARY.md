# Lori

Ubiquitous language of Lori, a gamified accelerated-learning extension. Technical terms stay in English, never calqued.

## Language

### Player Progression

| Term       | Definition                                                             | Aliases to avoid              |
| ---------- | ---------------------------------------------------------------------- | ----------------------------- |
| **Player** | The human learner using Lori                                           | User, account, gamer          |
| **XP**     | Experience points earned from study sessions                           | Exp, points, score            |
| **Level**  | Player rank derived from total accumulated XP                          | Tier, stage, grade            |
| **Streak** | Running count of active days that freezes on pause and resumes, never resets as punishment | Chain, daily streak, run |

### Learning Structure

| Term          | Definition                                                              | Aliases to avoid              |
| ------------- | ----------------------------------------------------------------------- | ----------------------------- |
| **Domain**    | A subject or skill being learned (e.g. Japanese, React, calculus)       | Subject, topic, territory     |
| **Skill Tree**| Visual map of concepts and prerequisites inside a domain                | Tree, roadmap, tech tree      |
| **Node**      | A single concept, technique, or milestone in a skill tree. Starts locked, becomes cleared by an exit proof | Item, skill, lesson |
| **Locked**    | Initial state of a Node, not yet conquered                              | Dim, closed, apagado          |
| **Chapter**   | A finite arc of a skill tree closed by an exit proof, unlocking the next Chapter | Episode, act           |
| **Exit Proof**| The artifact or demonstration that closes a Chapter                     | Exam, quiz, prova             |
| **Clear**     | Completion of a Chapter by passing its exit proof                       | Stamp, carimbo                |
| **Unlock**    | What a clear grants: the next Chapter, one technique, one quest         | Reward, prize                 |

### Study Session

| Term         | Definition                                                               | Aliases to avoid              |
| ------------ | ------------------------------------------------------------------------ | ----------------------------- |
| **Session**  | A learning activity inside a Domain, closed by the player with a Verdict. Always a Lori session, never an agent session | Study, run, mission |
| **Verdict**  | Closing statement of a Session with Focus and Honesty, carrying XP, new Cards, and forged Weaknesses | Summary, report |
| **Technique**| A specific study method drawn from the 9 ultralearning principles        | Method, practice, ritual      |
| **Ritual**   | A technique in its consumable, non-permanent form before mastery         | Consumable, temporary         |
| **Passive**  | A technique that has reached mastery level and activates automatically   | Permanent, mastery, buff      |
| **Combo**    | Techniques from distinct principles used within one Session yielding bonus XP | Chain, sequence, synergy |
| **Modifier** | A bonus applied to XP calculation, never below neutral                  | Multiplier, debuff, malus     |
| **Focus**    | A self-reported concentration metric declared in the Verdict             | Attention, concentration      |
| **Honesty**  | A self-reported metric of how truthfully the player assessed knowledge   | Integrity, accuracy           |
| **Abandon**  | An unfinished Session kept as a neutral pause, resumable without punishment | Forfeit, quit, dropout     |

### Spaced Repetition

| Term          | Definition                                                              | Aliases to avoid              |
| ------------- | ----------------------------------------------------------------------- | ----------------------------- |
| **Card**      | A flashcard created from session content for spaced review              | Flashcard, item, note         |
| **Review**    | The act of answering a card and rating recall quality (0–5)             | Repetition, drill             |
| **Review Queue** | Due reviews shown as one visible pile with a dedicated cleanup session | Backlog                    |
| **Interval**  | Days until a card becomes due again                                     | Delay, spacing, gap           |
| **Ease Factor**| SM-2 parameter controlling how quickly intervals grow                  | EF, difficulty                |

### Sustain

| Term        | Definition                                                               | Aliases to avoid              |
| ----------- | ------------------------------------------------------------------------ | ----------------------------- |
| **Decay**   | Visible aging of cleared Nodes inviting upkeep, never punishment         | Rot, poeira                   |
| **Upkeep**  | Revisiting decayed Nodes for bonus                                       | Watering, regar               |

### Weaknesses

| Term        | Definition                                                               | Aliases to avoid              |
| ----------- | ------------------------------------------------------------------------ | ----------------------------- |
| **Weakness**| A recorded mistake or hesitation identified during study                 | Mistake, error, gap           |
| **Forge**   | The act of registering a weakness from session feedback                  | Create, record, capture       |
| **Resolve** | Converting a weakness into an achievement by targeted practice           | Fix, close, heal              |

### Quests & Narrative

| Term           | Definition                                                            | Aliases to avoid              |
| -------------- | --------------------------------------------------------------------- | ----------------------------- |
| **Quest**      | A generated challenge with defined rewards (daily or weekly)          | Mission, task, challenge      |
| **Achievement**| A permanent marker of a milestone or first-time event                 | Badge, trophy, medal          |
| **Story**      | The narrative layer unlocked by progression milestones                | Lore, narrative, plot         |

### Ghost System

| Term          | Definition                                                              | Aliases to avoid              |
| ------------- | ----------------------------------------------------------------------- | ----------------------------- |
| **Ghost Run** | Comparison of the current session against a past similar session        | Ghost, past run, shadow       |
| **Fingerprint**| A set of weaknesses, concepts, and techniques representing session content | Signature, profile, snapshot |
| **Matching**  | The process of finding a similar past session via Jaccard similarity    | Comparison, pairing           |

### Customization

| Term         | Definition                                                               | Aliases to avoid              |
| ------------ | ------------------------------------------------------------------------ | ----------------------------- |
| **Skin**     | A visual and textual theme that renames core concepts at presentation    | Theme, lens, armor            |
| **Persona**  | A standalone AI personality tied to one of the 9 ultralearning principles. The technique in use elects the active voice | Voice, character, role |
| **Tutor**    | Lori as invoked guide answering only with questions, renamed per skin   | Assistant, teacher            |
| **Consult**  | Manual switch to the Tutor voice mid-session, without pausing anything   | Ask, help                     |
| **Principle**| One of the 9 core ultralearning philosophies (e.g. Focus, Retrieval)     | Rule, law, pillar             |

### State & Persistence

| Term           | Definition                                                            | Aliases to avoid              |
| -------------- | --------------------------------------------------------------------- | ----------------------------- |
| **Action**     | A serializable intent to mutate game state                            | Command, mutation             |
| **Event**      | A persisted, append-only record of an executed action                 | Log entry, row                |
| **Hot State**  | Frequently accessed data kept in memory at boot                       | Hot data, cache               |
| **Cold State** | Rarely accessed data loaded lazily from SQLite                        | Cold data, archive            |
| **Snapshot**   | A periodic full-state capture used for fast boot and compaction       | Checkpoint, backup            |

## Relationships

- A **Player** studies one or more **Domains**
- A **Domain** contains exactly one **Skill Tree**
- A **Skill Tree** has many **Nodes** with prerequisite edges
- A **Chapter** is a finite arc of a **Skill Tree** closed by an **Exit Proof**
- A **Clear** grants an **Unlock**: the next **Chapter**, one **Technique**, one **Quest**
- A **Session** belongs to exactly one **Domain** and closes with a **Verdict**
- A **Technique** starts as a **Ritual** and becomes a **Passive** at mastery level
- A **Session** generates zero or more **Cards** for the **SRS**
- A **Session** produces one **Fingerprint** used for **Ghost Run Matching**
- A **Weakness** is **Forged** during a **Session** and can be **Resolved** later
- A **Consult** switches to the **Tutor** voice and counts as **Elaborative Interrogation**
- A **Skin** translates **Core Events** into **Presentation Events** but never changes state
- A **Skin** renames the **Tutor** at presentation without changing its rule
- A **Persona** is elected by the active **Technique** and guides AI responses without affecting rules

## Example dialogue

> **Dev:** "When a **Player** starts a **Session** in the Japanese **Domain**, do we create **Cards** immediately?"
> **Domain expert:** "No — **Cards** are only generated after the **Session** closes with a **Verdict**. A **Technique** like Active Recall used during the **Session** may increase the number of **Cards** created."
> **Dev:** "If the player **Abandons** the **Session** because Pi restarts, what happens to the **Streak**?"
> **Domain expert:** "It waits as a neutral pause. The player resumes, the **Streak** stays frozen and continues, nothing resets."
> **Dev:** "So a **Weakness** **Forged** during a **Session** becomes part of that **Session**'s **Fingerprint** for future **Ghost Run Matching**?"
> **Domain expert:** "Exactly. When the player later studies a similar topic, the **Ghost Processor** finds the closest past **Fingerprint** via Jaccard similarity and surfaces the old **Session** as a **Ghost Run**."

## Flagged ambiguities

- **"Session"** is always a Lori learning session. A Pi agent session is a process lifetime and never counts as one. Say **agent session** when you mean the process.
- **"Action"** vs **"Event"**: In the event-sourcing layer, an **Action** is the serializable intent dispatched to the store, while an **Event** is the append-only persisted record. In casual speech they blur; in code reviews keep them distinct.
- **"Mission"** / **"Territory"** / **"Armor"** are skin-local aliases for **Quest**, **Domain**, and **Skin** respectively. They must not leak into the core domain or database schema.
- **"User"** appears in tests and UI mockups but is not a domain concept — the human is always a **Player**.
