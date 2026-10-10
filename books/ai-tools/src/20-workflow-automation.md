# AI workflow automation

A **workflow** is a series of steps to finish a task. **Automation** means the steps happen by themselves, without a person clicking each one. **AI workflow automation** means one or more of those steps are done by AI, and the output of one step becomes the input of the next.

This covers Lab experiments 18 and 19.

## A simple example

Task: *Every week, make a short newsletter for the class.*

Manual workflow:

1. Collect the week's notices. (You)
2. Write a summary. (You)
3. Make a nice image. (You)
4. Post it on the WhatsApp group. (You)

Automated workflow:

1. Notices arrive in a Google Form. (Automatic)
2. AI summarises them into a newsletter. (AI)
3. AI makes an image. (AI)
4. The newsletter is emailed to the class. (Automatic)

You set it up once. Then it runs every week.

## Chain of tools (the lab way)

The simplest automation is a **chain**: the output of tool 1 goes into tool 2, and so on. In the lab you can do this by hand, to understand it.

**Experiment 19: Document → Summary → Presentation**

1. **Create a document.** Ask Gemini to write a 2-page report on "Electric buses for Visakhapatnam". Paste it into Google Docs.
2. **Summarise.** Give the document to NotebookLM or ChatGPT. Ask for a 10-point summary.
3. **Present.** Paste the summary into Gamma using "Paste in text". Get a 10-slide deck.
4. **Extra steps.** Ask ElevenLabs for narration. Ask Canva for animation. Ask AI for a social media post about the deck.

Each tool's output is the next tool's input. That is a workflow. Write down each step and the time it took.

## Automation tools (no code)

These tools connect apps together. "When X happens, do Y, then Z."

| Tool | Link | Notes |
|---|---|---|
| Zapier | [zapier.com](https://zapier.com) | Easiest. Free plan with limits. Has AI steps built in. |
| Make | [make.com](https://www.make.com) | Visual, drag-and-drop. Free plan. |
| n8n | [n8n.io](https://n8n.io) | Open source. Can run on your own laptop. Strong AI features. |
| Google Apps Script | [script.google.com](https://script.google.com) | Free. Automates Gmail, Sheets, Docs with small code. Gemini can write the code. |
| IFTTT | [ifttt.com](https://ifttt.com) | Simple "if this, then that" rules. |

**Experiment 18 example with Zapier or Make:**

- **Trigger:** A new row is added to a Google Sheet (a student's question).
- **AI step:** Send the question to ChatGPT or Gemini with a prompt: "Answer this in simple English in under 50 words."
- **Action:** Write the answer in the next column of the sheet. Or send it by email.

Many such tools have a free plan with 100 runs a month. That is enough for the lab.

## Automation with a little code

With an API key (Chapter 19) and Python, you can write your own automation. Example: a Python script that reads all `.txt` files in a folder, asks Gemini to summarise each one, and saves a `summary.txt`. Ask an AI to write this script for you.

Google Apps Script is also powerful. Ask Gemini: *"Write a Google Apps Script that, for every row in my sheet, sends column A to Gemini and writes the answer in column B."*

## AI agents

The newest kind of automation is the **AI agent**. An agent is an AI that can plan steps and use tools on its own. You say the goal. It decides the steps. Examples: Gemini's and ChatGPT's agent modes, Claude Code, OpenAI Operator, Manus. Agents are new and still make mistakes, so a human must check the result.

## Things to remember

- Start by doing the workflow **by hand** once. Then automate it.
- Keep a human check at the end for anything important.
- Automation that sends emails or messages can make mistakes at scale. Test with yourself first.
- Do not automate anything that needs personal data without permission.

## Try it

- Do the Document → Summary → Presentation chain above with 3 different tools. Write down each step.
- Sign up at [zapier.com](https://zapier.com) or [make.com](https://www.make.com). Make a 3-step zap: Google Form → AI summary → Gmail. Test it with yourself as the receiver.
- Open [script.google.com](https://script.google.com) and ask Gemini to write a script that emails you a joke every morning.
- Watch: [n8n in 100 seconds](https://www.youtube.com/results?search_query=n8n+ai+workflow+beginner) — search for a short beginner video.

## New words

- **Workflow** — a series of steps to complete a task.
- **Automation** — making steps happen without a person doing each one.
- **Chain** — a line of tools where each one's output feeds the next.
- **Trigger** — the event that starts an automation ("a new form response").
- **Action** — a step the automation does ("send an email").
- **Zap / scenario** — one automation in Zapier / Make.
- **Open source** — software whose code is free to see, use and change.
- **Agent** — an AI that plans its own steps and uses tools to reach a goal.
- **At scale** — in large numbers; a mistake repeated many times.
