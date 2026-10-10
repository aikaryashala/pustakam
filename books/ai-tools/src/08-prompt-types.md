# Types of prompts

There are a few common ways to write a prompt. Each one has a name. In the lab you will use three: **zero-shot**, **role-based** and **structured**. Let us learn them, plus two more.

We will use the same problem for all of them: *explain why the sea at RK Beach is not safe for swimming.*

## 1. Zero-shot prompt

You just ask. No examples. No role. "Zero-shot" means zero examples.

```prompt
Why is the sea at RK Beach, Visakhapatnam not safe for swimming?
```

Good for simple questions. The answer is okay but general.

## 2. Role-based prompt

You tell the AI who to be. The AI then uses the knowledge and the tone of that role.

```prompt
You are a lifeguard with 20 years of experience at RK Beach. Explain to a group of new college students why swimming here is dangerous. Speak in a friendly way.
```

The answer becomes more focused and practical. Roles you can use: teacher, doctor, lawyer, senior engineer, HR manager, tour guide, angry customer, 5-year-old child.

## 3. Structured prompt

You give the prompt a clear structure. You say exactly what sections and format you want. Many people write it with headings or labels.

```prompt
Task: Explain why swimming at RK Beach is unsafe.
Audience: First year engineering students.
Format:
1. One-line summary
2. Three reasons, as bullet points
3. A table of safe beaches near Vizag with distance from the city
4. One safety tip
Length: Under 200 words.
Language: Simple English.
```

Structured prompts give the most predictable output. Use them for reports, documents and anything you will submit.

## 4. Few-shot prompt

You give one or more **examples** of what you want. "Few-shot" means a few examples. The AI copies the pattern.

```prompt
Convert each sentence to formal English.

Casual: hey sir, can't come tomorrow, got fever
Formal: Respected Sir, I will not be able to attend tomorrow as I have a fever.

Casual: bro send the notes na
Formal:
```

Very useful for a fixed style, like translating messages or formatting data.

## 5. Chain-of-thought prompt

You ask the AI to **think step by step** before answering. This helps with maths, logic and puzzles.

```prompt
A bus leaves Vizag at 6:00 am and reaches Araku, 115 km away, at 9:30 am. It stops for 30 minutes on the way. What is its average moving speed? Think step by step, then give the final answer.
```

Without "step by step", the AI may jump to a wrong number. With it, the AI shows its working and is more often right.

## Compare them

| Type | What you give | Best for |
|---|---|---|
| Zero-shot | Just the question | Quick, simple questions |
| Role-based | A role for the AI | Expert advice, a certain tone |
| Structured | Clear sections and format | Reports, documents, anything official |
| Few-shot | Examples | Fixed style or pattern |
| Chain-of-thought | "Think step by step" | Maths, logic, debugging |

You can **mix** them. A role plus a structure plus one example is a very strong prompt.

## Try it

This is **Lab experiment 5**. Pick one problem, for example: *"Should first year students buy a laptop or a tablet?"*

- Write a zero-shot prompt, a role-based prompt and a structured prompt for it.
- Run all three in the same tool. Paste the three answers side by side.
- Write 3 lines: which was best, and why.
- Try the few-shot prompt above and add 3 more casual sentences of your own.

## New words

- **Zero-shot** — a prompt with no examples.
- **Few-shot** — a prompt with a few examples.
- **Role-based** — a prompt that tells the AI who to act as.
- **Structured** — arranged in a clear order with sections or labels.
- **Chain-of-thought** — asking the AI to show its thinking step by step.
- **Tone** — the feeling of the writing: friendly, formal, strict, funny.
- **Predictable** — you can guess in advance what you will get.
- **Formal** — proper, official language, used with teachers and in letters.
