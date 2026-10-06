# Chapter 6 — Memory management

C provides 4 functions for dynamic memory allocation:

- `malloc`, which takes an integer size, in bytes, and returns a pointer to a
  newly-allocated chunk of memory with (at least) the given size. If it can't
  satisfy the request, it returns the special pointer value `NULL`.

- `calloc`, which is the same as `malloc` except that it also clears the newly
  allocated chunk; that is, it sets all bytes in the chunk to 0.

- `free`, which takes a pointer to a previously allocated chunk and
  deallocates it; that is, it makes the space available for future allocation.

- `realloc`, which takes a pointer to a previously allocated chunk and a new
  size. It allocates a chunk of memory with the new size, copies data from the
  old chunk to the new, frees the old chunk, and returns a pointer to the new
  chunk.

This API is notoriously error-prone and unforgiving. Memory management is one
of the most challenging parts of designing large software systems, which is
why most modern languages provide higher-level memory management features
like garbage collection.

## 6.1 Memory errors

The C memory management API is a bit like Jasper Beardly, a minor character on
the animated television program The Simpsons; in a few episodes, he appears as
a strict substitute teacher who imposes corporal punishment — a "paddlin'" —
for all infractions.

Here are some of things a program can do that deserve a paddling:

- If you access (read or write) any chunk that has not been allocated, that's
  a paddling.

- If you free an allocated chunk and then access it, that's a paddling.

- If you try to free a chunk that has not been allocated, that's a paddling.

- If you free the same chunk more than once, that's a paddling.

- If you call `realloc` with a chunk that was not allocated, or was allocated
  and then freed, that's a paddling.

It might not sound difficult to follow these rules, but in a large program a
chunk of memory might be allocated in one part of the program, used in several
other parts, and freed in yet another part. So changes in one part of the
program can require changes in many other parts.

Also, there might be many aliases, or references to the same allocated chunk,
in different parts of the program. The chunk should not be freed until all
references to the chunk are no longer in use. Getting this right often
requires careful analysis across all parts of the program, which is difficult
and contrary to fundamental principles of good software engineering.

Ideally, every function that allocates memory should include, as part of the
documented interface, information about how that memory is supposed to be
freed. Mature libraries often do this well, but in the real world, software
engineering practice often falls short of this ideal.

To make matters worse, memory errors can be difficult to find because the
symptoms are unpredictable. For example:

- If you read a value from an unallocated chunk, the system might detect the
  error, trigger a runtime error called a "segmentation fault", and stop the
  program. Or, the program might read unallocated memory without detecting the
  error; in that case, the value it gets is whatever happened to be stored at
  the accessed location, which is unpredictable, and might be different each
  time the program runs.

- If you write a value to an unallocated chunk, and don't get a segmentation
  fault, things are even worse. After you write a value to an invalid
  location, a long time might pass before it is read and causes problems. At
  that point it will be very difficult to find the source of the problem.

And things can be even worse than that! One of the most common problems with
C-style memory management is that the data structures used to implement
`malloc` and `free` (which we will see soon) are often stored along with the
allocated chunks. So if you accidentally write past the end of a
dynamically-allocated chunk, you are likely to mangle these data structures.
The system usually won't detect the problem until later, when you call
`malloc` or `free`, and those functions fail in some inscrutable way.

One conclusion you should draw from this is that safe memory management
requires design and discipline. If you write a library or module that
allocates memory, you should also provide an interface to free it, and memory
management should be part of the API design from the beginning.

If you use a library that allocates memory, you should be disciplined in your
use of the API. For example, if the library provides functions to allocate and
deallocate storage, you should use those functions and not, for example, call
`free` on a chunk you did not `malloc`. And you should avoid keeping multiple
references to the same chunk in different parts of your program.

Often there is a trade-off between safe memory management and performance. For
example, the most common source of memory errors is writing beyond the bounds
of an array. The obvious remedy for this problem is bounds checking; that is,
every access to the array should check whether the index is out of bounds.
High-level libraries that provide array-like structures usually perform bounds
checking. But C arrays and most low-level libraries do not.

## 6.2 Memory leaks

There is one more memory error that may or may not deserve a paddling. If you
allocate a chunk of memory and never free it, that's a "memory leak".

For some programs, memory leaks are ok. For example, if your program allocates
memory, performs computations on it, and then exits, it is probably not
necessary to free the allocated memory. When the program exits, all of its
memory is deallocated by the operating system. Freeing memory immediately
before exiting might feel more responsible, but it is mostly a waste of time.

But if a program runs for a long time and leaks memory, its total memory use
will increase indefinitely. At that point, a few things might happen:

- At some point, the system runs out of physical memory. On systems without
  virtual memory, the next call to `malloc` will fail, returning `NULL`.

- On systems with virtual memory, the operating system can move another
  process's pages from memory to disk and then allocate more space to the
  leaking process. I explain this mechanism in Section 7.8.

- There might be a limit on the amount of space a single process can allocate;
  beyond that, `malloc` returns `NULL`.

- Eventually, a process might fill its virtual address space (or the usable
  part). After that, there are no more addresses to allocate, so `malloc`
  returns `NULL`.

If `malloc` returns `NULL`, but you persist and access the chunk you think you
allocated, you get a segmentation fault. For this reason, it is considered
good style to check the result from `malloc` before using it. One option is to
add a condition like this after every `malloc` call:

```c
void *p = malloc(size);
if (p == NULL) {
    perror("malloc failed");
    exit(-1);
}
```

`perror` is declared in `stdio.h`; it prints an error message and additional
information about the last error that occurred.

`exit`, which is declared in `stdlib.h`, causes the process to terminate. The
argument is a status code that indicates how the process terminated. By
convention, status code 0 indicates normal termination and -1 indicates an
error condition. Sometimes other codes are used to indicate different error
conditions.

Error-checking code can be a nuisance, and it makes programs harder to read.
You can mitigate these problems by wrapping library function calls and their
error-checking code in your own functions. For example, here is a `malloc`
wrapper that checks the return value.

```c
void *check_malloc(int size)
{
    void *p = malloc (size);
    if (p == NULL) {
        perror("malloc failed");
        exit(-1);
    }
    return p;
}
```

Because memory management is so difficult, most large programs, like web
browsers, leak memory. To see which programs on your system are using the most
memory, you can use the UNIX utilities `ps` and `top`.

## 6.3 Implementation

When a process starts, the system allocates space for the text segment and
statically allocated data, space for the stack, and space for the heap, which
contains dynamically allocated data.

Not all programs allocate data dynamically, so the initial size of the heap
might be small or zero. Initially the heap contains only one free chunk.

When `malloc` is called, it checks whether it can find a free chunk that's big
enough. If not, it has to request more memory from the system. The function
that does that is `sbrk`, which sets the "program break", which you can think
of as a pointer to the end of the heap.

When `sbrk` is called, the OS allocates new pages of physical memory, updates
the process's page table, and sets the program break.

In theory, a program could call `sbrk` directly (without using `malloc`) and
manage the heap itself. But `malloc` is easier to use and, for most memory-use
patterns, it runs fast and uses memory efficiently.

To implement the memory management API (that is, the functions `malloc`,
`free`, `calloc`, and `realloc`), most Linux systems use `ptmalloc`, which is
based on `dlmalloc`, written by Doug Lea. A short paper that describes key
elements of the implementation is available at
http://gee.cs.oswego.edu/dl/html/malloc.html.

For programmers, the most important elements to be aware of are:

- The run time of `malloc` does not usually depend on the size of the chunk,
  but might depend on how many free chunks there are. `free` is usually fast,
  regardless of the number of free chunks. Because `calloc` clears every byte
  in the chunk, the run time depends on chunk size (as well as the number of
  free chunks).

  `realloc` is sometimes fast, if the new size is smaller than the current
  size, or if space is available to expand the existing chunk. If not, it has
  to copy data from the old chunk to the new; in that case, the run time
  depends on the size of the old chunk.

- **Boundary tags:** When `malloc` allocates a chunk, it adds space at the
  beginning and end to store information about the chunk, including its size
  and the state (allocated or free). These bits of data are called "boundary
  tags". Using these tags, `malloc` can get from any chunk to the previous
  chunk and the next chunk in memory. In addition, free chunks are chained
  into a doubly-linked list; each free chunk contains pointers to the next and
  previous chunks in the "free list".

  The boundary tags and free list pointers make up `malloc`'s internal data
  structures. These data structures are interspersed with program data, so it
  is easy for a program error to damage them.

- **Space overhead:** Boundary tags and free list pointers take up space. The
  minimum chunk size on most systems is 16 bytes. So for very small chunks,
  `malloc` is not space efficient. If your program requires large numbers of
  small structures, it might be more efficient to allocate them in arrays.

- **Fragmentation:** If you allocate and free chunks with varied sizes, the
  heap will tend to become fragmented. That is, the free space might be broken
  into many small pieces. Fragmentation wastes space; it also slows the
  program down by making memory caches less effective.

- **Binning and caching:** The free list is sorted by size into bins, so when
  `malloc` searches for a chunk with a particular size, it knows what bin to
  search in. If you free a chunk and then immediately allocate a chunk with
  the same size, `malloc` will usually be fast.

---

Chapter-6 from https://github.com/AllenDowney/ThinkOS
