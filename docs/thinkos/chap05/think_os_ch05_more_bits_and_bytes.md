# Chapter 5 — More bits and bytes

## 5.1 Representing integers

You probably know that computers represent numbers in base 2, also known as
binary. For positive numbers, the binary representation is straightforward;
for example, the representation for 5<sub>10</sub> is `b101`.

For negative numbers, the most obvious representation uses a sign bit to
indicate whether a number is positive or negative. But there is another
representation, called "two's complement" that is much more common because it
is easier to work with in hardware.

To find the two's complement of a negative number, -x, find the binary
representation of x, flip all the bits, and add 1. For example, to represent
-5<sub>10</sub>, start with the representation of 5<sub>10</sub>, which is
`b00000101` if we write the 8-bit version. Flipping all the bits and adding 1
yields `b11111011`.

In two's complement, the leftmost bit acts like a sign bit; it is 0 for
positive numbers and 1 for negative numbers.

To convert from an 8-bit number to 16-bits, we have to add more 0's for a
positive number and add 1's for a negative number. In effect, we have to copy
the sign bit into the new bits. This process is called "sign extension".

In C all integer types are signed (able to represent positive and negative
numbers) unless you declare them unsigned. The difference, and the reason this
declaration is important, is that operations on unsigned integers don't use
sign extension.

## 5.2 Bitwise operators

People learning C are sometimes confused about the bitwise operators `&` and
`|`. These operators treat integers as bit vectors and compute logical
operations on corresponding bits.

For example, `&` computes the AND operation, which yields 1 if both operands
are 1, and 0 otherwise. Here is an example of `&` applied to two 4-bit
numbers:

```
  1100
& 1010
  ----
  1000
```

In C, this means that the expression `12 & 10` has the value 8.

Similarly, `|` computes the OR operation, which yields 1 if either operand is
1, and 0 otherwise.

```
  1100
| 1010
  ----
  1110
```

So the expression `12 | 10` has the value 14.

Finally, `^` computes the XOR operation, which yields 1 if either operand is
1, but not both.

```
  1100
^ 1010
  ----
  0110
```

So the expression `12 ^ 10` has the value 6.

Most commonly, `&` is used to clear a set of bits from a bit vector, `|` is
used to set bits, and `^` is used to flip, or "toggle" bits. Here are the
details:

**Clearing bits**: For any value x, `x&0` is 0, and `x&1` is x. So if you AND
a vector with 3, it selects only the two rightmost bits, and sets the rest to
0.

```
  xxxx
& 0011
  ----
  00xx
```

In this context, the value 3 is called a "mask" because it selects some bits
and masks the rest.

**Setting bits**: Similarly, for any x, `x|0` is x, and `x|1` is 1. So if you
OR a vector with 3, it sets the rightmost bits, and leaves the rest alone:

```
  xxxx
| 0011
  ----
  xx11
```

**Toggling bits**: Finally, if you XOR a vector with 3, it flips the rightmost
bits and leaves the rest alone. As an exercise, see if you can compute the
two's complement of 12 using `^`. Hint: what's the two's complement
representation of -1?

C also provides shift operators, `<<` and `>>`, which shift bits left and
right. Each left shift doubles a number, so `5 << 1` is 10, and `5 << 2` is
20. Each right shift divides by two (rounding down), so `5 >> 1` is 2 and
`2 >> 1` is 1.

## 5.3 Representing floating-point numbers

Floating-point numbers are represented using the binary version of scientific
notation. In decimal notation, large numbers are written as the product of a
coefficient and 10 raised to an exponent. For example, the speed of light in
m/s is approximately 2.998 · 10<sup>8</sup>.

Most computers use the IEEE standard for floating-point arithmetic. The C type
`float` usually corresponds to the 32-bit IEEE standard; `double` usually
corresponds to the 64-bit standard.

In the 32-bit standard, the leftmost bit is the sign bit, s. The next 8 bits
are the exponent, q, and the last 23 bits are the coefficient, c. The value of
a floating-point number is

(-1)<sup>s</sup> c · 2<sup>q</sup>

Well, that's almost correct, but there's one more wrinkle. Floating-point
numbers are usually normalized so that there is one digit before the point.
For example, in base 10, we prefer 2.998 · 10<sup>8</sup> rather than
2998 · 10<sup>5</sup> or any other equivalent expression. In base 2, a
normalized number always has the digit 1 before the binary point. Since the
digit in this location is always 1, we can save space by leaving it out of the
representation.

For example, the integer representation of 13<sub>10</sub> is `b1101`. In
floating point, that's 1.101 · 2<sup>3</sup>, so the exponent is 3 and the
part of the coefficient that would be stored is 101 (followed by 20 zeros).

Well, that's almost correct, but there's one more wrinkle. The exponent is
stored with a "bias". In the 32-bit standard, the bias is 127, so the exponent
3 would be stored as 130.

To pack and unpack floating-point numbers in C, we can use a union and bitwise
operations. Here's an example:

```c
union {
    float f;
    unsigned int u;
} p;

p.f = -13.0;
unsigned int sign = (p.u >> 31) & 1;
unsigned int exp = (p.u >> 23) & 0xff;

unsigned int coef_mask = (1 << 23) - 1;
unsigned int coef = p.u & coef_mask;

printf("%d\n", sign);
printf("%d\n", exp);
printf("0x%x\n", coef);
```

This code is in `float.c` in the repository for this book (see Section 0.1).

The union allows us to store a floating-point value using `p.f` and then read
it as an unsigned integer using `p.u`.

To get the sign bit, we shift the bits to the right 31 places and then use a
1-bit mask to select only the rightmost bit.

To get the exponent, we shift the bits 23 places, then select the rightmost 8
bits (the hexadecimal value `0xff` has eight 1's).

To get the coefficient, we need to extract the 23 rightmost bits and ignore
the rest. We do that by making a mask with 1s in the 23 rightmost places and
0s on the left. The easiest way to do that is by shifting 1 to the left by 23
places and then subtracting 1.

The output of this program is:

```
1
130
0x500000
```

As expected, the sign bit for a negative number is 1. The exponent is 130,
including the bias. And the coefficient, which I printed in hexadecimal, is
101 followed by 20 zeros.

As an exercise, try assembling or disassembling a `double`, which uses the
64-bit standard. See http://en.wikipedia.org/wiki/IEEE_floating_point.

## 5.4 Unions and memory errors

There are two common uses of C unions. One, which we saw in the previous
section, is to access the binary representation of data. Another is to store
heterogeneous data. For example, you could use a union to represent a number
that might be an integer, float, complex, or rational number.

However, unions are error-prone. It is up to you, as the programmer, to keep
track of what type of data is in the union; if you write a floating-point
value and then interpret it as an integer, the result is usually nonsense.

Actually, the same thing can happen if you read a location in memory
incorrectly. One way that can happen is if you read past the end of an array.

To see what happens, I'll start with a function that allocates an array on the
stack and fills it with the numbers from 0 to 99.

```c
void f1() {
    int i;
    int array[100];

    for (i=0; i<100; i++) {
        array[i] = i;
    }
}
```

Next I'll define a function that creates a smaller array and deliberately
accesses elements before the beginning and after the end:

```c
void f2() {
    int x = 17;
    int array[10];
    int y = 123;

    printf("%d\n", array[-2]);
    printf("%d\n", array[-1]);
    printf("%d\n", array[10]);
    printf("%d\n", array[11]);
}
```

If I call `f1` and then `f2`, I get these results:

```
17
123
98
99
```

The details here depend on the compiler, which arranges variables on the
stack. From these results, we can infer that the compiler put `x` and `y` next
to each other, "below" the array (at a lower address). And when we read past
the array, it looks like we are getting values that were left on the stack by
the previous function call.

In this example, all of the variables are integers, so it is relatively easy
to figure out what is going on. But in general when you read beyond the bounds
of an array, the values you read might have any type. For example, if I change
`f1` to make an array of floats, the results are:

```
17
123
1120141312
1120272384
```

The latter two values are what you get if you interpret a floating-point value
as an integer. If you encountered this output while debugging, you would have
a hard time figuring out what's going on.

## 5.5 Representing strings

Related issues sometimes come up with strings. First, remember that C strings
are null-terminated. When you allocate space for a string, don't forget the
extra byte at the end.

Also, the letters and numbers in C strings are encoded in ASCII. The ASCII
codes for the digits "0" through "9" are 48 through 57, not 0 through 9. The
ASCII code 0 is the NUL character that marks the end of a string. And the
ASCII codes 1 through 9 are special characters used in some communication
protocols. ASCII code 7 is a bell; on some terminals, printing it makes a
sound.

The ASCII code for the letter "A" is 65; the code for "a" is 97. Here are
those codes in binary:

```
65 = b0100 0001
97 = b0110 0001
```

A careful observer will notice that they differ by a single bit. And this
pattern holds for the rest of the letters; the sixth bit (counting from the
right) acts as a "case bit", 0 for upper-case letters and 1 for lower case
letters.

As an exercise, write a function that takes a string and converts from
lower-case to upper-case by flipping the sixth bit. As a challenge, you can
make a faster version by reading the string 32 or 64 bits at a time, rather
than one character at a time. This optimization is made easier if the length
of the string is a multiple of 4 or 8 bytes.

If you read past the end of a string, you are likely to see strange
characters. Conversely, if you write a string and then accidentally read it as
an int or float, the results will be hard to interpret.

For example, if you run:

```c
char array[] = "allen";
float *p = array;
printf("%f\n", *p);
```

You will find that the ASCII representation of the first 8 characters of my
name, interpreted as a double-precision floating point number, is
69779713878800585457664.

---

Chapter-5 from https://github.com/AllenDowney/ThinkOS
