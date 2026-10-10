# Test case generation

A **test case** is one input with its expected output. We run the program with the input. If the real output matches the expected output, the test passes. If not, there is a bug.

Writing test cases is boring but very important. AI is very good at it. This is Lab experiment 12.

## Four kinds of test cases

Suppose the program is: *read a student's marks (0 to 100) and print the grade.*

| Kind | What it checks | Examples |
|---|---|---|
| **Normal** | Usual, everyday inputs | 72, 45, 88 |
| **Boundary** | Inputs at the edge of a range | 0, 100, 49, 50 (if 50 is pass mark) |
| **Invalid** | Inputs that should be rejected | -5, 101, "abc", empty |
| **Edge** | Strange but possible inputs | 100.5, very large number, extra spaces |

A good test set has all four kinds. Most bugs live at the **boundaries**.

## How to ask AI

Give the **problem** and the **code**. Ask for the four kinds in a table.

```prompt
Here is a problem and its solution. Generate test cases in a table with columns: Test number, Type (normal / boundary / invalid / edge), Input, Expected output, Why this test matters. Give at least 3 of each type.

Problem: Read marks (0 to 100) and print the grade: 90 and above = A, 75 to 89 = B, 50 to 74 = C, below 50 = Fail. Print "Invalid" for marks outside 0 to 100.

Code:
marks = int(input())
if marks > 100 or marks < 0:
    print("Invalid")
elif marks >= 90:
    print("A")
elif marks >= 75:
    print("B")
elif marks >= 50:
    print("C")
else:
    print("Fail")
```

The AI will give a table. Then **run each test** yourself. Some will fail. For example, the input `"abc"` will crash this program, because `int("abc")` gives an error. That is a bug the test found.

## Make a test table

| # | Type | Input | Expected | Actual | Pass? |
|---|---|---|---|---|---|
| 1 | Normal | 72 | C | C | Yes |
| 2 | Boundary | 90 | A | A | Yes |
| 3 | Boundary | 89 | B | B | Yes |
| 4 | Invalid | 101 | Invalid | Invalid | Yes |
| 5 | Invalid | abc | Invalid | crash | **No** |
| 6 | Edge | 49.9 | Fail | crash | **No** |

Fill the "Actual" column by running the program. This table is your lab record.

## Automatic tests

Professionals do not test by hand. They write **test code** that runs all the tests at once. AI can write this too.

```prompt
Write Python unit tests using pytest for the grade function above. Cover normal, boundary, invalid and edge cases.
```

For C, ask for a `main()` that calls the function with many inputs and prints PASS or FAIL for each.

## Good test prompts

- *"What inputs could break this program?"*
- *"Give 10 boundary test cases for this function."*
- *"Write a test that would catch the bug if someone changed `>=` to `>`."*
- *"My program fails test 5. Fix it without breaking the other tests."*

## Try it

- Use the grade problem above. Get test cases from AI. Run them in [OnlineGDB](https://www.onlinegdb.com) or [Programiz](https://www.programiz.com/python-programming/online-compiler/). Fill the table.
- Fix the program so that tests 5 and 6 pass. Ask the AI for help if needed.
- Take any program from Chapter 12 and generate test cases for it.
- Read a short guide: [Software testing basics – GeeksforGeeks](https://www.geeksforgeeks.org/software-testing-basics/).

## New words

- **Test case** — one input together with the expected output.
- **Expected output** — the answer the program should give.
- **Actual output** — the answer the program really gives.
- **Pass / fail** — the test result when actual matches / does not match expected.
- **Boundary** — the edge of an allowed range, like 0 and 100.
- **Invalid** — not allowed; wrong type or out of range.
- **Unit test** — a small automatic test for one function.
- **pytest** — a popular tool for running Python tests.
- **Lab record** — the written record of your lab work.
