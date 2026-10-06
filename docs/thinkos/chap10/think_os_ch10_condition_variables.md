# Chapter 10 — Condition variables

Many simple synchronization problems can be solved using mutexes as shown in
the previous chapter. In this chapter I introduce a bigger challenge, the
well-known "Producer-Consumer problem", and a new tool to solve it, the
**condition variable**.

## 10.1 The work queue

In some multi-threaded programs, threads are organized to perform different
tasks. Often they communicate with each other using a queue, where some
threads, called "producers", put data into the queue and other threads, called
"consumers", take data out.

For example, in applications with a graphical user interface, there might be
one thread that runs the GUI, responding to user events, and another thread
that processes user requests. In that case, the GUI thread might put requests
into a queue and the "back end" thread might take requests out and process
them.

To support this organization, we need a queue implementation that is "thread
safe", which means that both threads (or more than two) can access the queue
at the same time. And we need to handle the special cases when the queue is
empty and, if the size of the queue is bounded, when the queue is full.

I'll start with a simple queue that is not thread safe, then we'll see what
goes wrong and fix it. The code for this example is in the repository for this
book, in a folder called `queue`. The file `queue.c` contains a basic
implementation of a circular buffer, which you can read about at
https://en.wikipedia.org/wiki/Circular_buffer.

Here's the structure definition:

```c
typedef struct {
    int *array;
    int length;
    int next_in;
    int next_out;
} Queue;
```

`array` is the array that contains the elements of the queue. For this example
the elements are ints, but more generally they would be structures that
contain user events, items of work, etc.

`length` is the length of the array. `next_in` is an index into the array that
indices where the next element should be added; similarly, `next_out` is the
index of the next element that should be removed.

`make_queue` allocates space for this structure and initializes the fields:

```c
Queue *make_queue(int length)
{
    Queue *queue = (Queue *) malloc(sizeof(Queue));
    queue->length = length + 1;
    queue->array = (int *) malloc(length * sizeof(int));
    queue->next_in = 0;
    queue->next_out = 0;
    return queue;
}
```

The initial value for `next_out` needs some explaining. Since the queue is
initially empty, there is no next element to remove, so `next_out` is invalid.
Setting `next_out == next_in` is a special case that indicates that the queue
is empty, so we can write:

```c
int queue_empty(Queue *queue)
{
    return (queue->next_in == queue->next_out);
}
```

Now we can add elements to the queue using `queue_push`:

```c
void queue_push(Queue *queue, int item) {
    if (queue_full(queue)) {
        perror_exit("queue is full");
    }

    queue->array[queue->next_in] = item;
    queue->next_in = queue_incr(queue, queue->next_in);
}
```

If the queue is full, `queue_push` prints an error message and exits. I will
explain `queue_full` soon.

If the queue is not full, `queue_push` inserts the new element and then
increments `next_in` using `queue_incr`:

```c
int queue_incr(Queue *queue, int i)
{
    return (i+1) % queue->length;
}
```

When the index, `i`, gets to the end of the array, it wraps around to 0. And
that's where we run into a tricky part. If we keep adding elements to the
queue, eventually `next_in` wraps around and catches up with `next_out`. But
if `next_in == next_out`, we would incorrectly conclude that the queue was
empty.

To avoid that, we define another special case to indicate that the queue is
full:

```c
int queue_full(Queue *queue)
{
    return (queue_incr(queue, queue->next_in) == queue->next_out);
}
```

If incrementing `next_in` lands on `next_out`, that means we can't add another
element without making the queue seem empty. So we stop one element before the
"end" (keeping in mind that the end of the queue can be anywhere, not
necessarily the end of the array).

Now we can write `queue_pop`, which removes and returns the next element from
the queue:

```c
int queue_pop(Queue *queue) {
    if (queue_empty(queue)) {
        perror_exit("queue is empty");
    }

    int item = queue->array[queue->next_out];
    queue->next_out = queue_incr(queue, queue->next_out);
    return item;
}
```

If you try to pop from an empty queue, `queue_pop` prints an error message and
exits.

## 10.2 Producers and consumers

Now let's make some threads to access this queue. Here's the producer code:

```c
void *producer_entry(void *arg) {
    Shared *shared = (Shared *) arg;

    for (int i=0; i<QUEUE_LENGTH-1; i++) {
        printf("adding item %d\n", i);
        queue_push(shared->queue, i);
    }
    pthread_exit(NULL);
}
```

Here's the consumer code:

```c
void *consumer_entry(void *arg) {
    int item;
    Shared *shared = (Shared *) arg;

    for (int i=0; i<QUEUE_LENGTH-1; i++) {
        item = queue_pop(shared->queue);
        printf("consuming item %d\n", item);
    }
    pthread_exit(NULL);
}
```

Here's the parent code that starts the threads and waits for them

```c
    pthread_t child[NUM_CHILDREN];

    Shared *shared = make_shared();

    child[0] = make_thread(producer_entry, shared);
    child[1] = make_thread(consumer_entry, shared);

    for (int i=0; i<NUM_CHILDREN; i++) {
        join_thread(child[i]);
    }
```

And finally here's the shared structure that contains the queue:

```c
typedef struct {
    Queue *queue;
} Shared;

Shared *make_shared()
{
    Shared *shared = check_malloc(sizeof(Shared));
    shared->queue = make_queue(QUEUE_LENGTH);
    return shared;
}
```

The code we have so far is a good starting place, but it has several problems:

* Access to the queue is not thread safe. Different threads could access
  `array`, `next_in`, and `next_out` at the same time and leave the queue in a
  broken, "inconsistent" state.

* If the consumer is scheduled first, it finds the queue empty, print an error
  message, and exits. We would rather have the consumer block until the queue
  is not empty. Similarly, we would like the producer to block if the queue is
  full.

In the next section, we solve the first problem with a Mutex. In the following
section, we solve the second problem with condition variables.

## 10.3 Mutual exclusion

We can make the queue thread safe with a mutex. This version of the code is in
`queue_mutex.c`.

First we add a Mutex pointer to the queue structure:

```c
typedef struct {
    int *array;
    int length;
    int next_in;
    int next_out;
    Mutex *mutex;          //-- this line is new
} Queue;
```

And initialize the Mutex in `make_queue`:

```c
Queue *make_queue(int length) {
    Queue *queue = (Queue *) malloc(sizeof(Queue));
    queue->length = length;
    queue->array = (int *) malloc(length * sizeof(int));
    queue->next_in = 0;
    queue->next_out = 0;
    queue->mutex = make_mutex();   //-- new
    return queue;
}
```

Next we add synchronization code to `queue_push`:

```c
void queue_push(Queue *queue, int item) {
    mutex_lock(queue->mutex);   //-- new
    if (queue_full(queue)) {
        mutex_unlock(queue->mutex);   //-- new
        perror_exit("queue is full");
    }

    queue->array[queue->next_in] = item;
    queue->next_in = queue_incr(queue, queue->next_in);
    mutex_unlock(queue->mutex);   //-- new
}
```

Before checking whether the queue is full, we have to lock the Mutex. If the
queue is full, we have to unlock the Mutex before exiting; otherwise the
thread would leave it locked and no other threads could proceed.

The synchronization code for `queue_pop` is similar:

```c
int queue_pop(Queue *queue) {
    mutex_lock(queue->mutex);
    if (queue_empty(queue)) {
        mutex_unlock(queue->mutex);
        perror_exit("queue is empty");
    }

    int item = queue->array[queue->next_out];
    queue->next_out = queue_incr(queue, queue->next_out);
    mutex_unlock(queue->mutex);
    return item;
}
```

Note that the other Queue functions, `queue_full`, `queue_empty`, and
`queue_incr` do not try to lock the mutex. Any thread that calls these
functions is required to lock the mutex first; this requirement is part of the
documented interface for these functions.

With this additional code, the queue is thread safe; if you run it, you should
not see any synchronization errors. But it is likely that the consumer will
exit at some point because the queue is empty, or the producer will exit
because the queue is full, or both.

The next step is to add condition variables.

## 10.4 Condition variables

A **condition variable** is a data structure associated with a condition; it
allows threads to block until the condition becomes true. For example,
`thread_pop` might want check whether the queue is empty and, if so, wait for a
condition like "queue not empty".

Similarly, `thread_push` might want to check whether the queue is full and, if
so, block until it is not full.

I'll handle the first condition here, and you will have a chance to handle the
second condition as an exercise.

First we add a condition variable to the Queue structure:

```c
typedef struct {
    int *array;
    int length;
    int next_in;
    int next_out;
    Mutex *mutex;
    Cond *nonempty;   //-- new
} Queue;
```

And initialize it in `make_queue`:

```c
Queue *make_queue(int length)
{
    Queue *queue = (Queue *) malloc(sizeof(Queue));
    queue->length = length;
    queue->array = (int *) malloc(length * sizeof(int));
    queue->next_in = 0;
    queue->next_out = 0;
    queue->mutex = make_mutex();
    queue->nonempty = make_cond();   //-- new
    return queue;
}
```

Now in `queue_pop`, if we find the queue empty, we don't exit; instead we use
the condition variable to block:

```c
int queue_pop(Queue *queue) {
    mutex_lock(queue->mutex);
    while (queue_empty(queue)) {
        cond_wait(queue->nonempty, queue->mutex);   //-- new
    }

    int item = queue->array[queue->next_out];
    queue->next_out = queue_incr(queue, queue->next_out);
    mutex_unlock(queue->mutex);
    cond_signal(queue->nonfull);   //-- new
    return item;
}
```

`cond_wait` is complicated, so let's take it slow. The first argument is the
condition variable; in this case, the condition we are waiting for is "queue
not empty". The second argument is the mutex that protects the queue.

When the thread that locked the mutex calls `cond_wait`, it unlocks the mutex
and then blocks. This is important. If `cond_wait` did not unlock the mutex
before blocking, no other thread would be able to access the queue, no more
items could be added, and the queue would always be empty.

So while the consumer is blocked on `nonempty`, the producer can run. Let's see
what happens when the producer runs `queue_push`:

```c
void queue_push(Queue *queue, int item) {
    mutex_lock(queue->mutex);
    if (queue_full(queue)) {
        mutex_unlock(queue->mutex);
        perror_exit("queue is full");
    }
    queue->array[queue->next_in] = item;
    queue->next_in = queue_incr(queue, queue->next_in);
    mutex_unlock(queue->mutex);
    cond_signal(queue->nonempty);   //-- new
}
```

Just as before, `queue_push` locks the Mutex and checks whether the queue is
full. Assuming it is not, `queue_push` adds a new element to the queue and then
unlocks the Mutex.

But before returning, it does one more thing: it "signals" the condition
variable `nonempty`.

Signalling a condition variable usually indicates that the condition is true.
If there are no threads waiting on the condition variable, the signal has no
effect. If there are threads waiting on the condition variable, one of them
gets unblocked and resumes execution of `cond_wait`. But before the awakened
thread can return from `cond_wait`, it has to wait for and lock the Mutex,
again.

Now go back to `queue_pop` and see what happens when the thread returns from
`cond_wait`. It loops back to the top of the while loop and checks the
condition again. I'll explain why in just a second, but for now let's assume
that the condition is true; that is, the queue is not empty.

When the consumer thread exits the while loop, we know two things: (1) the
condition is true, so there is at least one item in the queue, and (2) the
Mutex is locked, so it is safe to access the queue.

After removing an item, `queue_pop` unlocks the mutex and returns.

In the next section I'll show you how my Cond code works, but first I want to
answer two frequently-asked questions:

* Why is `cond_wait` inside a while loop rather than an if statement; that is,
  why do we have to check the condition again after returning from
  `cond_wait`?

  The primary reason you have to re-check the condition is the possibility of
  an intercepted signal. Suppose Thread A is waiting on `nonempty`. Thread B
  adds an item to the queue and signals `nonempty`. Thread A wakes up an tries
  to lock the mutex, but before it gets the chance, Evil Thread C swoops in,
  locks the mutex, pops the item from the queue, and unlocks the mutex. Now the
  queue is empty again, but Thread A is not blocked any more. Thread A could
  lock the mutex and returns from `cond_wait`. If Thread A does not check the
  condition again, it would try to pop an element from an empty queue, and
  probably cause an error.

* The other question that comes up when people learn about condition variables
  is "How does the condition variable know what condition it is associated
  with?"

  This question is understandable because there is no explicit connection
  between a `Cond` structure and the condition it relates to. The connection is
  implicit in the way it is used.

  Here's one way to think of it: the condition associated with a Cond is the
  thing that is false when you call `cond_wait` and true when you call
  `cond_signal`.

Because threads have to check the condition when they return from `cond_wait`,
it is not strictly necessary to call `cond_signal` only when the condition is
true. If you have reason to think the condition might be true, you could call
`cond_signal` as a suggestion that now is a good time to check.

## 10.5 Condition variable implementation

The Cond structure I used in the previous section is a wrapper for a type
called `pthread_cond_t`, which is defined in the POSIX threads API. It is very
similar to Mutex, which is a wrapper for `pthread_mutex_t`. Both wrappers are
defined in `utils.c` and `utils.h`.

Here's the typedef:

```c
typedef pthread_cond_t Cond;
```

`make_cond` allocates space, initializes the condition variable, and returns a
pointer:

```c
Cond *make_cond() {
    Cond *cond = check_malloc(sizeof(Cond));
    int n = pthread_cond_init(cond, NULL);
    if (n != 0) perror_exit("make_cond failed");
    return cond;
}
```

And here are the wrappers for `cond_wait` and `cond_signal`.

```c
void cond_wait(Cond *cond, Mutex *mutex) {
    int n = pthread_cond_wait(cond, mutex);
    if (n != 0) perror_exit("cond_wait failed");
}

void cond_signal(Cond *cond) {
    int n = pthread_cond_signal(cond);
    if (n != 0) perror_exit("cond_signal failed");
}
```

At this point there should be nothing too surprising there.

---

Chapter-10 from https://github.com/AllenDowney/ThinkOS
