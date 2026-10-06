# Chapter 9 — Threads

When I mentioned threads in Section 2.3, I said that a thread is a kind of
process. Now I will provide a more careful explanation.

When you create a process, the operating system creates a new address space,
which includes the text segment, static segment, and heap; it also creates
a new "**thread of execution**", which includes the program counter and other
hardware state, and the call stack.

The processes we have seen so far are "**single-threaded**", which means that
only one thread of execution runs in each address space. In this chapter, you
will learn about "**multi-threaded**" processes that have multiple threads
running in the same address space.

Within a single process, all threads share the same text segment, so they run
the same code. But different threads often run different parts of the code.

And they share the same static segment, so if one thread changes a global
variable, other threads see the change. They also share the heap, so threads
can share dynamically-allocated chunks.

But each thread has its own stack, so threads can call functions without
interfering with each other. Usually threads don't access each other's local
variables (and sometimes they can't).

The example code for this chapter is in the repository for this book, in a
directory named `counter`. For information on downloading this code, see
Section 0.1.

## 9.1 Creating threads

The most popular threading standard used with C is **POSIX Threads**, or
**Pthreads** for short. The POSIX standard defines a thread model and an
interface for creating and controlling threads. Most versions of UNIX provide
an implementation of Pthreads.

Using Pthreads is like using most C libraries:

- You include headers files at the beginning of your program.
- You write code that calls functions defined by Pthreads.
- When you compile the program, you link it with the Pthread library.

For my examples, I include the following headers:

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
```

The first two are standard; the third is for Pthreads and the fourth is for
semaphores. To compile with the Pthread library in `gcc`, you can use the `-l`
option on the command line:

```
gcc -g -O2 -o array array.c -lpthread
```

This compiles a source file named `array.c` with debugging info and
optimization, links with the Pthread library, and generates an executable
named `array`.

## 9.2 Creating threads

The Pthread function that creates threads is called `pthread_create`. The
following function shows how to use it:

```c
pthread_t make_thread(void *(*entry)(void *), Shared *shared)
{
    int n;
    pthread_t thread;

    n = pthread_create(&thread, NULL, entry, (void *)shared);
    if (n != 0) {
        perror("pthread_create failed");
        exit(-1);
    }
    return thread;
}
```

`make_thread` is a wrapper I wrote to make `pthread_create` easier to use, and
to provide error-checking.

The return type from `pthread_create` is `pthread_t`, which you can think of
as an id or "handle" for the new thread.

If `pthread_create` succeeds, it returns 0 and `make_thread` returns the
handle of the new thread. If an error occurs, `pthread_create` returns an
error code and `make_thread` prints an error message and exits.

The parameters of `make_thread` take some explaining. Starting with the
second, `Shared` is a structure I defined to contain values shared between
threads. The following `typedef` statement creates the new type:

```c
typedef struct {
    int counter;
} Shared;
```

In this case, the only shared variable is `counter`. `make_shared` allocates
space for a `Shared` structure and initializes the contents:

```c
Shared *make_shared()
{
    Shared *shared = check_malloc(sizeof (Shared));
    shared->counter = 0;
    return shared;
}
```

Now that we have a shared data structure, let's get back to `make_thread`.
The first parameter is a pointer to a function that takes a void pointer and
returns a void pointer. If the syntax for declaring this type makes your eyes
bleed, you are not alone. Anyway, the purpose of this parameter is to specify
the function where the execution of the new thread will begin. By convention,
this function is named `entry`:

```c
void *entry(void *arg)
{
    Shared *shared = (Shared *) arg;
    child_code(shared);
    pthread_exit(NULL);
}
```

The parameter of `entry` has to be declared as a void pointer, but in this
program we know that it is really a pointer to a `Shared` structure, so we can
typecast it accordingly and then pass it along to `child_code`, which does the
real work.

As a simple example, `child_code` prints the value of the shared counter and
increments it.

```c
void child_code(Shared *shared)
{
    printf("counter = %d\n", shared->counter);
    shared->counter++;
}
```

When `child_code` returns, `entry` invokes `pthread_exit` which can be used to
pass a value to the thread that joins with this thread. In this case, the
child has nothing to say, so we pass `NULL`.

Finally, here is the code that creates the child threads:

```c
int i;
pthread_t child[NUM_CHILDREN];

Shared *shared = make_shared(1000000);

for (i=0; i<NUM_CHILDREN; i++) {
    child[i] = make_thread(entry, shared);
}
```

`NUM_CHILDREN` is a compile-time constant that determines the number of child
threads. `child` is an array of thread handles.

## 9.3 Joining threads

When one thread wants to wait for another thread to complete, it invokes
`pthread_join`. Here is my wrapper for `pthread_join`:

```c
void join_thread(pthread_t thread)
{
    int ret = pthread_join(thread, NULL);
    if (ret == -1) {
        perror("pthread_join failed");
        exit(-1);
    }
}
```

The parameter is the handle of the thread you want to wait for. All the
wrapper does is call `pthread_join` and check the result.

Any thread can join any other thread, but in the most common pattern the
parent thread creates and joins all child threads. Continuing the example from
the previous section, here's the code that waits on the children:

```c
for (i=0; i<NUM_CHILDREN; i++) {
    join_thread(child[i]);
}
```

This loops waits for the children one at a time in the order they were
created. There is no guarantee that the child threads complete in that order,
but this loop works correctly even if they don't. If one of the children is
late, the loop might have to wait, and other children might complete in the
meantime. But regardless, the loop exits only when all children are done.

If you have downloaded the repository for this book (see Section 0.1), you'll
find this example in `counter/counter.c`. You can compile and run it like
this:

```
$ make counter
gcc -Wall counter.c -o counter -lpthread
$ ./counter
```

When I ran it with 5 children, I got the following output:

```
counter = 0
counter = 0
counter = 1
counter = 0
counter = 3
```

When you run it, you will probably get different results. And if you run it
again, you might get different results each time. What's going on?

## 9.4 Synchronization errors

The problem with the previous program is that the children access the shared
variable, `counter`, without synchronization, so several threads can read the
same value of `counter` before any threads increment it.

Here is a sequence of events that could explain the output in the previous
section:

```
Child A reads 0
Child B reads 0
Child C reads 0
Child A prints 0
Child B prints 0
Child A sets counter=1
Child D reads 1
Child D prints 1
Child C prints 0
Child A sets counter=1
Child B sets counter=2
Child C sets counter=3
Child E reads 3
Child E prints 3
Child D sets counter=4
Child E sets counter=5
```

Each time you run the program, threads might be interrupted at different
points, or the scheduler might choose different threads to run, so the
sequence of events, and the results, will be different.

Suppose we want to impose some order. For example, we might want each
thread to read a different value of `counter` and increment it, so that the
value of `counter` reflects the number of threads that have executed
`child_code`.

To enforce that requirement, we can use a "**mutex**", which is an object that
guarantees "**mutual exclusion**" for a block of code; that is, only one
thread can execute the block at a time.

I have written a small module called `mutex.c` that provides mutex objects.
I'll show you how to use it first; then I'll explain how it works.

Here's a version of `child_code` that uses a mutex to synchronize threads:

```c
void child_code(Shared *shared)
{
    mutex_lock(shared->mutex);
    printf("counter = %d\n", shared->counter);
    shared->counter++;
    mutex_unlock(shared->mutex);
}
```

Before any thread can access `counter`, it has to "lock" the mutex, which
has the effect of barring all other threads. Suppose Thread A has locked the
mutex and is in the middle of `child_code`. If Thread B arrives and executes
`mutex_lock`, it blocks.

When Thread A is done, it executes `mutex_unlock`, which allows Thread B to
proceed. In effect, the threads line up to execute `child_code` one at a time,
so they can't interfere with each other. When I run this code with 5 children,
I get:

```
counter = 0
counter = 1
counter = 2
counter = 3
counter = 4
```

And that satisfies the requirements. In order for this solution to work, I have
to add the Mutex to the `Shared` struct:

```c
typedef struct {
    int counter;
    Mutex *mutex;
} Shared;
```

And initialize it in `make_shared`

```c
Shared *make_shared(int end)
{
    Shared *shared = check_malloc(sizeof(Shared));
    shared->counter = 0;
    shared->mutex = make_mutex();   //-- this line is new
    return shared;
}
```

The code in this section is in `counter_mutex.c`. The definition of `Mutex` is
in `mutex.c`, which I explain in the next section.

## 9.5 Mutex

My definition of `Mutex` is a wrapper for a type called `pthread_mutex_t`,
which is defined in the POSIX threads API.

To create a POSIX mutex, you have to allocate space for a `pthread_mutex_t`
type and then call `pthread_mutex_init`.

One of the problems with this API is that `pthread_mutex_t` behaves like a
structure, so if you pass it as an argument, it makes a copy, which makes the
mutex behave incorrectly. To avoid that, you have to pass `pthread_mutex_t`
by address.

My code makes it easier to get that right. It defines a type, `Mutex`, which
is just a more readable name for `pthread_mutex_t`:

```c
#include <pthread.h>

typedef pthread_mutex_t Mutex;
```

Then it defines `make_mutex`, which allocates space and initializes the mutex:

```c
Mutex *make_mutex()
{
    Mutex *mutex = check_malloc(sizeof(Mutex));
    int n = pthread_mutex_init(mutex, NULL);
    if (n != 0) perror_exit("make_lock failed");
    return mutex;
}
```

The return value is a pointer, which you can pass around as an argument
without causing unwanted copying.

The functions to lock and unlock the mutex are simple wrappers for POSIX
functions:

```c
void mutex_lock(Mutex *mutex)
{
    int n = pthread_mutex_lock(mutex);
    if (n != 0) perror_exit("lock failed");
}

void mutex_unlock(Mutex *mutex)
{
    int n = pthread_mutex_unlock(mutex);
    if (n != 0) perror_exit("unlock failed");
}
```

This code is in `mutex.c` and the header file `mutex.h`.

---

Chapter-9 from https://github.com/AllenDowney/ThinkOS
