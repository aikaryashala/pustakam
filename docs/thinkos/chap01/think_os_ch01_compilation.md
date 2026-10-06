# Chapter 1 — Compilation

## 1.1 Compiled and interpreted languages

People often describe programming languages as either compiled or
interpreted. "Compiled" means that programs are translated into machine
language and then executed by hardware; "interpreted" means that programs
are read and executed by a software interpreter. Usually C is considered a
compiled language and Python is considered an interpreted language. But the
distinction is not always clear-cut.

First, many languages can be either compiled or interpreted. For example,
there are C interpreters and Python compilers. Second, there are languages
like Java that use a hybrid approach, compiling programs into an intermediate
language and then running the translated program in an interpreter. Java uses
an intermediate language called Java bytecode, which is similar to machine
language, but it is executed by a software interpreter, the Java virtual
machine (JVM).

So being compiled or interpreted is not an intrinsic characteristic of a
language; nevertheless, there are some general differences between compiled
and interpreted languages.

## 1.2 Static types

Many interpreted languages support dynamic types, but compiled languages are
usually limited to static types. In a statically-typed language, you can tell
by looking at the program what type each variable refers to. In a
dynamically-typed language, you don't always know the type of a variable
until the program is running. In general, **static** refers to things that
happen at compile time (while a program is being compiled), and **dynamic**
refers to things that happen at run time (while a program is running).

For example, in Python you can write a function like this:

```python
def add(x, y):
    return x + y
```

Looking at this code, you can't tell what type `x` and `y` will refer to at
run time. This function might be called several times, each time with values
with different types. Any values that support the addition operator will
work; any other types will cause an exception or **runtime error**.

In C you would write the same function like this:

```c
int add(int x, int y) {
    return x + y;
}
```

The first line of the function includes **type declarations** for the
parameters and the return value: `x` and `y` are declared to be integers,
which means that we can check at compile time whether the addition operator
is legal for this type (it is). The return value is also declared to be an
integer.

Because of these declarations, when this function is called elsewhere in the
program, the compiler can check whether the arguments provided have the right
type, and whether the return value is used correctly.

These checks happen before the program starts executing, so errors can be
found earlier. More importantly, errors can be found in parts of the program
that have never run. Furthermore, these checks don't have to happen at run
time, which is one of the reasons compiled languages generally run faster
than interpreted languages.

Declaring types at compile time also saves space. In dynamic languages,
variable names are stored in memory while the program runs, and they are
often accessible by the program. For example, in Python the built-in function
`locals` returns a dictionary that contains variable names and their values.
Here's an example in a Python interpreter:

```
>>> x = 5
>>> print locals()
{'x': 5, '__builtins__': <module '__builtin__' (built-in)>,
'__name__': '__main__', '__doc__': None, '__package__': None}
```

This shows that the name of the variable is stored in memory while the
program is running (along with some other values that are part of the
default runtime environment).

In compiled languages, variable names exist at compile-time but not at run
time. The compiler chooses a location for each variable and records these
locations as part of the compiled program.<sup>1</sup> The location of a
variable is called its **address**. At run time, the value of each variable
is stored at its address, but the names of the variables are not stored at
all (unless they are added by the compiler for purposes of debugging).

## 1.3 The compilation process

As a programmer, you should have a mental model of what happens during
compilation. If you understand the process, it will help you interpret error
messages, debug your code, and avoid common pitfalls.

The steps of compilation are:

1. **Preprocessing:** C is one of several languages that include
   **preprocessing directives** that take effect before the program is
   compiled. For example, the `#include` directive causes the source code
   from another file to be inserted at the location of the directive.

2. **Parsing:** During parsing, the compiler reads the source code and builds
   an internal representation of the program, called an **abstract syntax
   tree**. Errors detected during this step are generally syntax errors.

3. **Static checking:** The compiler checks whether variables and values have
   the right type, whether functions are called with the right number and
   type of arguments, etc. Errors detected during this step are sometimes
   called **static semantic** errors.

4. **Code generation:** The compiler reads the internal representation of the
   program and generates machine code or byte code.

5. **Linking:** If the program uses values and functions defined in a
   library, the compiler has to find the appropriate library and include the
   required code.

6. **Optimization:** At several points in the process, the compiler can
   transform the program to generate code that runs faster or uses less
   space. Most optimizations are simple changes that eliminate obvious waste,
   but some compilers perform sophisticated analyses and transformations.

Normally when you run `gcc`, it runs all of these steps and generates an
executable file. For example, here is a minimal C program:

```c
#include <stdio.h>
int main()
{
    printf("Hello World\n");
}
```

If you save this code in a file called `hello.c`, you can compile and run it
like this:

```
$ gcc hello.c
$ ./a.out
```

By default, `gcc` stores the executable code in a file called `a.out` (which
originally stood for "assembler output"). The second line runs the
executable. The prefix `./` tells the shell to look for it in the current
directory.

It is usually a good idea to use the `-o` flag to provide a better name for
the executable:

```
$ gcc hello.c -o hello
$ ./hello
```

## 1.4 Object code

The `-c` flag tells `gcc` to compile the program and generate machine code,
but not to link it or generate an executable:

```
$ gcc hello.c -c
```

The result is a file named `hello.o`, where the `o` stands for **object
code**, which is the compiled program. Object code is not executable, but it
can be linked into an executable.

The UNIX command `nm` reads an object file and generates information about
the names it defines and uses. For example:

```
$ nm hello.o
0000000000000000 T main
                 U puts
```

This output indicates that `hello.o` defines the name `main` and uses a
function named `puts`, which stands for "put string". In this example, `gcc`
performs an optimization by replacing `printf`, which is a large and
complicated function, with `puts`, which is relatively simple.

You can control how much optimization `gcc` does with the `-O` flag. By
default, it does very little optimization, which can make debugging easier.
The option `-O1` turns on the most common and safe optimizations. Higher
numbers turn on additional optimizations that require longer compilation
time.

In theory, optimization should not change the behavior of the program, other
than to speed it up. But if your program has a subtle bug, you might find
that optimization makes the bug appear or disappear. It is usually a good
idea to turn off optimization while you are developing new code. Once the
program is working and passing appropriate tests, you can turn on
optimization and confirm that the tests still pass.

## 1.5 Assembly code

Similar to the `-c` flag, the `-S` flag tells `gcc` to compile the program
and generate assembly code, which is basically a human-readable form of
machine code.

```
$ gcc hello.c -S
```

The result is a file named `hello.s`, which might look something like this:

```
        .file   "hello.c"
        .section        .rodata
.LC0:
        .string "Hello World"
        .text
        .globl  main
        .type   main, @function
main:
.LFB0:
        .cfi_startproc
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_register 6
        movl    $.LC0, %edi
        call    puts
        movl    $0, %eax
        popq    %rbp
        .cfi_def_cfa 7, 8
        ret
        .cfi_endproc
.LFE0:
        .size   main, .-main
        .ident  "GCC: (Ubuntu/Linaro 4.7.3-1ubuntu1) 4.7.3"
        .section        .note.GNU-stack,"",@progbits
```

`gcc` is usually configured to generate code for the machine you are running
on, so for me it generates x86 assembly language, which runs on a wide
variety of processors from Intel, AMD, and others. If you are running on a
different architecture, you might see different code.

## 1.6 Preprocessing

Taking another step backward through the compilation process, you can use
the `-E` flag to run the preprocessor only:

```
$ gcc hello.c -E
```

The result is the output from the preprocessor. In this example, it contains
the included code from `stdio.h`, and all the files included from `stdio.h`,
and all the files included from those files, and so on. On my machine, the
total is more than 800 lines of code. Since almost every C program includes
`stdio.h`, those 800 lines of code get compiled a lot. If, like many C
programs, you also include `stdlib.h`, the result is more than 1800 lines of
code.

## 1.7 Understanding errors

Now that we know the steps in the compilation process, it is easier to
understand error messages. For example, if there is an error in a `#include`
directive, you'll get a message from the preprocessor:

```
hello.c:1:20: fatal error: stdioo.h: No such file or directory
compilation terminated.
```

If there's a syntax error, you get a message from the compiler:

```
hello.c: In function 'main':
hello.c:6:1: error: expected ';' before '}' token
```

If you use a function that's not defined in any of the standard libraries,
you get a message from the linker:

```
/tmp/cc7iAUbN.o: In function `main':
hello.c:(.text+0xf): undefined reference to `printff'
collect2: error: ld returned 1 exit status
```

`ld` is the name of the UNIX linker, so named because "loading" is another
step in the compilation process that is closely related to linking.

Once the program starts, C does very little runtime checking, so there are
only a few runtime errors you are likely to see. If you divide by zero, or
perform another illegal floating-point operation, you will get a "Floating
point exception." And if you try to read or write an incorrect location in
memory, you will get a "Segmentation fault."

---

<sup>1</sup> This is a simplification; we will go into more detail later.

---

Chapter-1 from https://github.com/AllenDowney/ThinkOS
