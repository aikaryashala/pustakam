# Changing code from one language to another

Sometimes you have a program in one language and you need it in another. Maybe your lab uses C but your project uses Python. AI can **convert** (translate) code between languages in seconds. This is Lab experiment 11.

## Why convert code?

- A college lab is in C. A hackathon needs Python.
- An old program is in Java. The new app needs JavaScript for a website.
- You know Python well. You want to learn C by comparing the same program.

## How to ask

Give the full program. Say the source language and the target language. Say what must stay the same.

```prompt
Convert this C program to Python. Keep the same logic, the same input format and the same output format. Add a comment where Python does something differently from C.

#include <stdio.h>
int main() {
    int n, fact = 1;
    printf("Enter n: ");
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) fact *= i;
    printf("Factorial = %d\n", fact);
    return 0;
}
```

The AI gives:

```
n = int(input("Enter n: "))
fact = 1
for i in range(1, n + 1):   # range stops before n + 1, so this goes 1 to n
    fact *= i
print("Factorial =", fact)
```

## Things that change between languages

| Idea | C | Python | Java |
|---|---|---|---|
| Variable | `int x = 5;` | `x = 5` | `int x = 5;` |
| Print | `printf("%d", x);` | `print(x)` | `System.out.println(x);` |
| Read input | `scanf("%d", &x);` | `x = int(input())` | `Scanner` class |
| Block | `{ ... }` | indentation | `{ ... }` |
| Integer size | fixed, can overflow | unlimited | fixed, can overflow |
| Array | `int a[5];` | `a = [0]*5` | `int[] a = new int[5];` |

Notice the last row about integers. In C, `fact` for n = 13 **overflows** (becomes a wrong number) because an `int` is only 32 bits. In Python, it does not. So the "same" program can give **different** answers. This is why you must verify.

## How to verify the converted program

1. Run the **original** program with 3 inputs. Write down the outputs.
2. Run the **converted** program with the same 3 inputs.
3. Compare. They must match.
4. Try an edge case (0, a negative number, a very big number). If the outputs differ, ask the AI why.

```prompt
The C version prints -215430144 for n = 13 but the Python version prints 6227020800. Why? Which one is correct?
```

## Good conversion prompts

- *"Convert this Python to C. Use only standard C libraries."*
- *"Convert this to Java and put it in a class called `Main` so it runs directly."*
- *"Translate this C code to Python, but write it the way an experienced Python programmer would (Pythonic style)."*
- *"Show the C and Python versions side by side in a table, line by line."*

## Try it

- Take any program from your C lab. Ask AI to convert it to Python and to Java. Run all three in [OnlineGDB](https://www.onlinegdb.com) with the same inputs.
- Take a Python program with a list. Convert it to C. See how arrays are different.
- Ask: *"Convert this program to JavaScript and make it run in a web page with a button."* Paste the result into [codepen.io](https://codepen.io) to see it work.

## New words

- **Convert / translate (code)** — to rewrite a program in a different programming language.
- **Source language** — the language the code is in now.
- **Target language** — the language you want.
- **Logic** — the steps of a program, which should stay the same after conversion.
- **Indentation** — the spaces at the start of a line; Python uses it to mark blocks.
- **Overflow** — when a number becomes too big for its storage and turns wrong.
- **Pythonic** — written in the natural style of Python.
- **Standard library** — the built-in functions that come with a language.
