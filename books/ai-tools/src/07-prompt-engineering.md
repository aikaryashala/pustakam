# Writing good prompts

## What is a prompt?

A **prompt** is what you type to an AI tool. It is your question or instruction.

**Prompt engineering** is the skill of writing prompts that give you good answers. It is the most important skill in this course. A good prompt gives a good answer. A lazy prompt gives a lazy answer.

## A bad prompt and a good prompt

Bad prompt:

```prompt
write about pollution
```

Good prompt:

```prompt
You are a science teacher. Write a 150-word paragraph about air pollution in Visakhapatnam for 10th class students. Use simple English. Mention the steel plant and the port. End with 2 things students can do.
```

The second prompt tells the AI **who** it is, **what** to write, **how long**, **for whom**, **in what style** and **what to include**. That is why it works.

## The five parts of a good prompt

Remember these five questions.

| Part | Question it answers | Example |
|---|---|---|
| **Role** | Who should the AI be? | "You are a C programming tutor." |
| **Task** | What should it do? | "Explain pointers." |
| **Format** | How should the answer look? | "Use 5 bullet points and one code example." |
| **Context** | What background does it need? | "I am a first year student. I know variables and loops." |
| **Example** | What does a good answer look like? | "Like this: `int *p = &x;` means p stores the address of x." |

You do not need all five every time. But the more you give, the better the answer.

## Simple tips

1. **Be specific.** "Write a notice" is weak. "Write a 100-word notice about a blood donation camp on 15 March at the college auditorium" is strong.
2. **Say the length.** "In 3 sentences." "Under 200 words." "A one-page report."
3. **Say the audience.** "For a 10-year-old." "For my HOD." "For a farmer."
4. **Say the format.** "As a table." "As a numbered list." "As JSON."
5. **Give an example.** Show the AI the style you want.
6. **Ask for steps.** "Think step by step" helps with maths and logic.
7. **Ask again.** If the answer is not good, say what is wrong. "Make it shorter." "Use simpler words." "Add an example about Araku."
8. **Break big tasks into small ones.** First ask for an outline. Then ask for each section.

## Things that do not help

- Being polite does not change much. "Please" is fine, but it does not make the answer better.
- Typing in ALL CAPS does not help.
- Very long prompts with everything mixed up confuse the AI. Keep it clear.

## Try it

- Take a bad prompt: *"tell me about Vizag"*. Rewrite it using Role, Task, Format, Context. Compare the two answers.
- Ask: *"Explain recursion"*. Then: *"Explain recursion to a first year student using the example of climbing the steps at Simhachalam temple. Use under 100 words."* Which is easier to understand?
- Learn more: [Google's prompting guide](https://ai.google.dev/gemini-api/docs/prompting-strategies) and [OpenAI's prompt guide](https://platform.openai.com/docs/guides/prompt-engineering).

## New words

- **Prompt** — the text you give to an AI tool.
- **Prompt engineering** — the skill of writing prompts that give good results.
- **Role** — the character or job the AI should act as.
- **Task** — the job you want done.
- **Format** — the shape of the answer: list, table, paragraph, code.
- **Context** — background information that helps the AI understand.
- **Audience** — the people who will read the answer.
- **Specific** — clear and exact, not vague.
- **Outline** — a short list of the main points, made before writing in full.
