# Generating code with AI

AI tools can write programs. You describe the problem in English. The AI writes the code in C, Python, Java or any other language. But you must **run it and check it**. This chapter shows how.

## Step 1: Describe the problem clearly

A code prompt should say:

- The **language** (C, Python, Java).
- The **input** and the **output**.
- Any **rules** (no libraries, use a loop, handle negative numbers).
- What to **include** (comments, example run).

```prompt
Write a C program that reads a number N from the user and prints whether it is a prime number. Use a simple loop. Add short comments. Handle N less than 2. Show one example input and output.
```

## Step 2: Read the code

Do not skip this. Read every line. Ask yourself: do I understand what each line does? If not, ask:

```prompt
Explain line by line what this program does. I am a first year student.
```

## Step 3: Run the code

You need a compiler or interpreter. Use any of these:

| Tool | Languages | Link |
|---|---|---|
| OnlineGDB | C, C++, Python, Java and more | [onlinegdb.com](https://www.onlinegdb.com) |
| Programiz | C, Python, Java | [programiz.com/online-compiler](https://www.programiz.com/c-programming/online-compiler/) |
| Replit | Almost all | [replit.com](https://replit.com) |
| Google Colab | Python | [colab.research.google.com](https://colab.research.google.com) |
| CodeXRay | C, with every compile stage shown | [codexray-frontend.onrender.com](https://codexray-frontend.onrender.com) |
| Your laptop | C with GCC, Python 3 | Install and use a terminal |

Paste the code. Click Run. Give the input. See the output.

## Step 4: Verify

Verify means check that the program is correct. Test it with:

- A normal input (7 → prime).
- An edge input (2 → prime, 1 → not prime, 0 → not prime).
- A big input (1000003).
- A wrong input (a letter instead of a number). What happens?

If something is wrong, go to the next chapter on debugging.

## AI tools for coding

- **ChatGPT, Gemini, Claude** — chat, paste code, ask for changes.
- **GitHub Copilot** — writes code inside your editor as you type. Free for students at [education.github.com](https://education.github.com/pack).
- **Gemini in Google Colab** — writes Python inside a notebook.
- **Cursor, Windsurf, Claude Code, Gemini CLI** — AI-powered editors and terminals used by professionals.
- **VS Code** — the most common editor. Copilot and Gemini plug into it.

## Good habits

1. Ask for small programs first. Then build up.
2. Ask the AI to add comments. Comments help you learn.
3. Ask: *"What are the possible bugs in this code?"* The AI often finds its own mistakes.
4. Type the code yourself at least once. Your fingers learn too.
5. Never submit code you cannot explain. In a viva, the teacher will ask.

## Try it

This is **Lab experiment 9**.

- Ask one AI tool for a program in C, Python or Java. Example problems: reverse a string, find the largest of N numbers, print a multiplication table, check a palindrome, calculate simple interest.
- Run it in [OnlineGDB](https://www.onlinegdb.com). Test with normal, edge and wrong inputs.
- Ask the AI to write the same program in a **second** language. Run that too.
- For C programs, paste the code into [CodeXRay](https://codexray-frontend.onrender.com) and see what the compiler makes from it.

## New words

- **Generate (code)** — to write code automatically.
- **Compiler** — a program that turns C or Java code into a form the computer can run.
- **Interpreter** — a program that runs Python code line by line.
- **Input / Output** — what goes into a program / what comes out.
- **Edge case** — an unusual input at the limit, like 0, 1, an empty string or a very big number.
- **Verify** — to check that something is correct.
- **Comment** — a note inside code for humans; the computer ignores it.
- **Editor** — the program where you type code, like VS Code.
- **Viva** — an oral exam where a teacher asks you questions.
