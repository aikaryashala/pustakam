# Chapter 11 — Semaphores in C

Semaphores are a good way to learn about synchronization, but they are not as
widely used, in practice, as mutexes and condition variables.

Nevertheless, there are some synchronization problems that can be solved
simply with semaphores, yielding solutions that are more demonstrably correct.

This chapter presents a C API for working with semaphores and my code for
making it easier to work with. And it presents a final challenge: can you write
an implementation of a semaphore using mutexes and condition variables?

The code for this chapter is in directory `semaphore` in the repository for
this book (see Section 0.1).

## 11.1 POSIX Semaphores

A **semaphore** is a data structure used to help threads work together without
interfering with each other.

The POSIX standard specifies an interface for semaphores; it is not part of
Pthreads, but most UNIXes that implement Pthreads also provide semaphores.

POSIX semaphores have type `sem_t`. As usual, I put a wrapper around `sem_t` to
make it easier to use. The interface is defined in `sem.h`:

```c
typedef sem_t Semaphore;

Semaphore *make_semaphore(int value);
void semaphore_wait(Semaphore *sem);
void semaphore_signal(Semaphore *sem);
```

`Semaphore` is a synonym for `sem_t`, but I find it more readable, and the
capital letter reminds me to treat it like an object and pass it by pointer.

The implementation of these functions is in `sem.c`:

```c
Semaphore *make_semaphore(int value)
{
    Semaphore *sem = check_malloc(sizeof(Semaphore));
    int n = sem_init(sem, 0, value);
    if (n != 0) perror_exit("sem_init failed");
    return sem;
}
```

`make_semaphore` takes the initial value of the semaphore as a parameter. It
allocates space for a Semaphore, initializes it, and returns a pointer to
Semaphore.

`sem_init` returns 0 if it succeeds and -1 if anything goes wrong. One nice
thing about using wrapper functions is that you can encapsulate the
error-checking code, which makes the code that uses these functions more
readable.

Here is the implementation of `semaphore_wait`:

```c
void semaphore_wait(Semaphore *sem)
{
    int n = sem_wait(sem);
    if (n != 0) perror_exit("sem_wait failed");
}
```

And here is `semaphore_signal`:

```c
void semaphore_signal(Semaphore *sem)
{
    int n = sem_post(sem);
    if (n != 0) perror_exit("sem_post failed");
}
```

I prefer to call this operation "signal" rather than "post", although both
terms are common.

Here's an example that shows how to use a semaphore as a mutex:

```c
Semaphore *mutex = make_semaphore(1);

semaphore_wait(mutex);
    // protected code goes here
semaphore_signal(mutex);
```

When you use a semaphore as a mutex, you usually initialize it to 1 to indicate
that the mutex is unlocked; that is, one thread can pass the semaphore without
blocking.

Here I am using the variable name `mutex` to indicate that the semaphore is
being used as a mutex. But remember that the behavior of a semaphore is not the
same as a Pthread mutex.

## 11.2 Producers and consumers with semaphores

Using these semaphore wrapper functions, we can write a solution to the
Producer-Consumer problem from Section 10.2. The code in this section is in
`queue_sem.c`.

Here's the new definition of `Queue`, replacing the mutex and condition
variables with semaphores:

```c
typedef struct {
    int *array;
    int length;
    int next_in;
    int next_out;
    Semaphore *mutex;       //-- new
    Semaphore *items;       //-- new
    Semaphore *spaces;      //-- new
} Queue;
```

And here's the new version of `make_queue`:

```c
Queue *make_queue(int length)
{
    Queue *queue = (Queue *) malloc(sizeof(Queue));
    queue->length = length;
    queue->array = (int *) malloc(length * sizeof(int));
    queue->next_in = 0;
    queue->next_out = 0;
    queue->mutex = make_semaphore(1);
    queue->items = make_semaphore(0);
    queue->spaces = make_semaphore(length-1);
    return queue;
}
```

`mutex` is used to guarantee exclusive access to the queue; the initial value
is 1, so the mutex is initially unlocked.

`items` is the number of items in the queue, which is also the number of
consumer threads that can execute `queue_pop` without blocking. Initially there
are no items in the queue.

`spaces` is the number of empty spaces in the queue, which is the number of
producer threads that can execute `queue_push` without blocking. Initially the
number of spaces is the capacity of the queue, which is `length-1`, as
explained in Section 10.1.

Here is the new version of `queue_push`, which is run by producer threads:

```c
void queue_push(Queue *queue, int item) {
    semaphore_wait(queue->spaces);
    semaphore_wait(queue->mutex);

    queue->array[queue->next_in] = item;
    queue->next_in = queue_incr(queue, queue->next_in);

    semaphore_signal(queue->mutex);
    semaphore_signal(queue->items);
}
```

Notice that `queue_push` doesn't have to call `queue_full` any more; instead,
the semaphore keeps track of how many spaces are available and blocks
producers if the queue is full.

Here is the new version of `queue_pop`:

```c
int queue_pop(Queue *queue) {
    semaphore_wait(queue->items);
    semaphore_wait(queue->mutex);

    int item = queue->array[queue->next_out];
    queue->next_out = queue_incr(queue, queue->next_out);

    semaphore_signal(queue->mutex);
    semaphore_signal(queue->spaces);

    return item;
}
```

This solution is explained, using pseudo-code, in Chapter 4 of *The Little Book
of Semaphores*.

Using the code in the repository for this book, you should be able to compile
and run this solution like this:

```
$ make queue_sem
$ ./queue_sem
```

## 11.3 Make your own semaphores

Any problem that can be solved with semaphores can also be solved with
condition variables and mutexes. We can prove that's true by using condition
variables and mutexes to implement a semaphore.

Before you go on, you might want to try this as an exercise: write functions
that implement the semaphore API in `sem.h` using using condition variables and
mutexes. In the repository for this book, you'll find my solution in
`mysem_soln.c` and `mysem_soln.h`.

If you have trouble getting started, you can use the following structure
definition, from my solution, as a hint:

```c
typedef struct {
    int value, wakeups;
    Mutex *mutex;
    Cond *cond;
} Semaphore;
```

`value` is the value of the semaphore. `wakeups` counts the number of pending
signals; that is, the number of threads that have been woken but have not yet
resumed execution. The reason for `wakeups` is to make sure that our
semaphores have Property 3, described in *The Little Book of Semaphores*.

`mutex` provides exclusive access to `value` and `wakeups`; `cond` is the
condition variable threads wait on if they wait on the semaphore.

Here is the initialization code for this structure:

```c
Semaphore *make_semaphore(int value)
{
    Semaphore *semaphore = check_malloc(sizeof(Semaphore));
    semaphore->value = value;
    semaphore->wakeups = 0;
    semaphore->mutex = make_mutex();
    semaphore->cond = make_cond();
    return semaphore;
}
```

### 11.3.1 Semaphore implementation

Here is my implementation of semaphores using POSIX mutexes and condition
variables:

```c
void semaphore_wait(Semaphore *semaphore)
{
    mutex_lock(semaphore->mutex);
    semaphore->value--;

    if (semaphore->value < 0) {
        do {
            cond_wait(semaphore->cond, semaphore->mutex);
        } while (semaphore->wakeups < 1);
        semaphore->wakeups--;
    }
    mutex_unlock(semaphore->mutex);
}
```

When a thread waits on the semaphore, it has to lock the mutex before it
decrements `value`. If the value of the semaphore becomes negative, the thread
blocks until a "wakeup" is available. While it is blocked, the mutex is
unlocked, so another thread can signal.

Here is the code for `semaphore_signal`:

```c
void semaphore_signal(Semaphore *semaphore)
{
    mutex_lock(semaphore->mutex);
    semaphore->value++;

    if (semaphore->value <= 0) {
        semaphore->wakeups++;
        cond_signal(semaphore->cond);
    }
    mutex_unlock(semaphore->mutex);
}
```

Again, a thread has to lock the mutex before it increments `value`. If the
semaphore was negative, that means threads are waiting, so the signalling
thread increments `wakeups` and signals the condition variable.

At this point one of the waiting threads might wake up, but the mutex is still
locked until the signalling thread unlocks it.

At that point, one of the waiting threads returns from `cond_wait` and checks
whether a wakeup is still available. If not, it loops and waits on the
condition variable again. If so, it decrements `wakeups`, unlocks the mutex,
and exits.

One thing about this solution that might not be obvious is the use of a
`do...while` loop. Can you figure out why it is not a more conventional `while`
loop? What would go wrong?

The problem is that with a `while` loop this implementation would not have
Property 3. It would be possible for a thread to signal and then run around and
catch its own signal.

With the `do...while` loop, it is guaranteed <sup>1</sup> that when a thread
signals, one of the waiting threads will get the signal, even if the signalling
thread runs around and gets the mutex before one of the waiting threads
resumes.

---

<sup>1</sup> Well, almost. It turns out that a well-timed spurious wakeup (see
http://en.wikipedia.org/wiki/Spurious_wakeup) can violate this guarantee.

---

Chapter-11 from https://github.com/AllenDowney/ThinkOS
