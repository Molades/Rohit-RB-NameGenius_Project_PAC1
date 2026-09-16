---
name: prompt-enhancer
description: Forces a short, approved brief before writing any UI code. Use this whenever the task is designing a UI, building a component, screen, or flow, or turning a Figma frame or screenshot into code — even if the user just says "build this screen" or pastes a screenshot without asking for a brief. Make sure to trigger this whenever visual/UI work is requested, since skipping straight to code on underspecified design requests is the failure mode this skill prevents.
---

# Prompt Enhancer

Design requests are usually underspecified: "build a settings screen" or a pasted screenshot doesn't say which design system to follow, what states to cover, or how success will be judged. Writing code against an underspecified request means guessing, and guesses need to be redone once the real constraints surface. This skill trades a minute of upfront questions for that rework.

## Steps

1. Do not write code yet. Enter plan mode (read-only) if available.
2. Check that these four things are defined. If one is missing, ask the user for it — one question at a time, not all four at once:
   - **Bar**: one sentence naming the screen and its design language (e.g. "a settings screen in the style of our existing dashboard").
   - **Reference**: a Figma frame, screenshot, or URL that can actually be inspected — not just a verbal description.
   - **Limits**: three to six hard constraints. Cover sections, tokens/spacing/type, states (loading, empty, error, etc.), platform, and anything explicitly out of bounds.
   - **Check**: how "done" will be verified — e.g. screenshot the result and compare it side-by-side with the reference.
3. Write the brief back to the user in four short lines (Bar, Reference, Limits, Check) and get explicit approval before proceeding. This is the checkpoint that catches misunderstandings while they're still cheap to fix.
4. After approval, leave plan mode and build exactly one screen or component — the one described in the brief, nothing more.
5. After building, run the review yourself: does it match the reference, is it complete across the states and responsive sizes named in Limits, does it look intentional rather than approximate? Report any differences against the reference and fix them before calling the work done.

## Notes

- If a line in the brief wouldn't change what gets built, cut it — the brief should stay short enough to reread in a few seconds.
- Without skills support (e.g. a plain chat tool), use the same four-line brief as a manual checklist, written out before each build.
