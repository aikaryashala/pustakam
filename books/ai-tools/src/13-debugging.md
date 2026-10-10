# Debugging with a second AI tool

A **bug** is a mistake in a program. **Debugging** is finding and fixing it. In the lab, you will make a program with one AI tool, put bugs in it, and ask a **different** AI tool to fix it. Why a different tool? Because a second opinion catches more mistakes, just like two doctors.

## Three kinds of bugs

| Kind | What happens | Example |
|---|---|---|
| Syntax error | The code does not compile or run at all | Missing semicolon `;` in C, wrong indentation in Python |
| Runtime error | The program crashes while running | Dividing by zero, reading outside an array |
| Logic error | The program runs but gives a wrong answer | Using `<` instead of `<=` in a loop |

Logic errors are the hardest. The computer does not complain. Only testing finds them.

## How to ask AI to debug

Give the AI **three things**: the code, the error message (or the wrong output), and what you expected.

```prompt
This C program should print the sum of numbers from 1 to N. For N = 5, it prints 10, but I expect 15. Find the bug, explain it in one line, and give the corrected code.

#include <stdio.h>
int main() {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i < n; i++) {
        sum = sum + i;
    }
    printf("%d\n", sum);
    return 0;
}
```

The AI will say: the loop should be `i <= n`. That is a logic error.

For a compile error, paste the **exact** error text:

```prompt
I get this error when I compile: "error: expected ';' before 'return'". Here is the code: ...
```

## The lab process (Experiment 10)

1. **Generate.** Ask tool A (say ChatGPT) for a program. For example, a Python program to find the second largest number in a list.
2. **Run it.** Make sure it works.
3. **Break it.** Put in 2 or 3 bugs on purpose. One syntax error, one logic error. Write down what you changed.
4. **Debug.** Give the broken code to tool B (say Gemini). Do not tell it where the bugs are. Ask it to find and fix them.
5. **Compare.** Did tool B find all your bugs? Did it find something extra? Did it change anything it should not have?
6. **Run again.** Check that the fixed program works.

## Good debugging prompts

- *"Find all the bugs in this code. List each one with the line number."*
- *"Why does this give a wrong answer for input 0?"*
- *"Add print statements to help me see what the variables are doing."*
- *"Explain this error message in simple words."*
- *"Is there any input that will crash this program?"*

## Be careful

- AI sometimes "fixes" code by rewriting everything. Ask it to **change as little as possible**.
- AI may introduce a new bug while fixing the old one. Always test again.
- If the AI says the code is correct but your output is wrong, check your **input** and your **expected answer**. Sometimes the bug is in your head, not the code.

## Try it

- Do the six-step lab process with a program of your choice. Use two different tools, for example ChatGPT and Gemini, or Gemini and Claude.
- Paste a C program with a missing `;` into [OnlineGDB](https://www.onlinegdb.com). Read the compiler error. Then give the same error to an AI. Compare what each one says.
- Ask an AI: *"Give me a Python program with 3 hidden bugs for practice. Do not tell me where they are."* Then find them yourself. Then ask a second AI to check.

## New words

- **Bug** — a mistake in a program.
- **Debug** — to find and fix bugs.
- **Syntax** — the grammar rules of a programming language.
- **Runtime** — the time when a program is actually running.
- **Logic** — the reasoning or steps of a program.
- **Crash** — when a program stops suddenly because of an error.
- **Error message** — the text a compiler or program prints when something is wrong.
- **Second opinion** — asking another person (or tool) to check the same thing.
