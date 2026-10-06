# Chapter 8 — Multitasking

In many current systems, the CPU contains multiple cores, which means it can
run several processes at the same time. In addition, each core is capable of
"multitasking", which means it can switch from one process to another quickly,
creating the illusion that many processes are running at the same time.

The part of the operating system that implements multitasking is the
"**kernel**". In a nut or seed, the kernel is the innermost part, surrounded by
a shell. In an operating system, the kernel is the lowest level of software,
surrounded by several other layers, including an interface called a "shell."
Computer scientists love extended metaphors.

At its most basic, the kernel's job is to handle interrupts. An "**interrupt**"
is an event that stops the normal instruction cycle and causes the flow of
execution to jump to a special section of code called an "**interrupt
handler**".

A **hardware interrupt** is caused when a device sends a signal to the CPU.
For example, a network interface might cause an interrupt when a packet of
data arrives, or a disk drive might cause an interrupt when a data transfer
is complete. Most systems also have timers that cause interrupts at regular
intervals, or after an elapsed time.

A **software interrupt** is caused by a running program. For example, if an
instruction cannot complete for some reason, it might trigger an interrupt so
the condition can be handled by the operating system. Some floating-point
errors, like division by zero, are handled using interrupts.

When a program needs to access a hardware device, it makes a **system call**,
which is similar to a function call, except that instead of jumping to the
beginning of the function, it executes a special instruction that triggers an
interrupt, causing the flow of execution to jump to the kernel. The kernel
reads the parameters of the system call, performs the requested operation,
and then resumes the interrupted process.

## 8.1 Hardware state

Handling interrupts requires cooperation between hardware and software.
When an interrupt occurs, there might be several instructions running on
the CPU, data stored in registers, and other hardware state.

Usually the hardware is responsible for bringing the CPU to a consistent state;
for example, every instruction should either complete or behave as if it never
started. No instruction should be left half complete. Also, the hardware is
responsible for saving the program counter (PC), so the kernel knows where
to resume.

Then, usually, it is the responsibility of the interrupt handler to save the
rest of the hardware state before it does anything that might modify it, and
then restore the saved state before the interrupted process resumes.

Here is an outline of this sequence of events:

1. When the interrupt occurs, the hardware saves the program counter in
   a special register and jumps to the appropriate interrupt handler.
2. The interrupt handler stores the program counter and the status register
   in memory, along with the contents of any data registers it plans to use.
3. The interrupt handler runs whatever code is needed to handle the
   interrupt.
4. Then it restores the contents of the saved registers. Finally, it restores
   the program counter of the interrupted process, which has the effect of
   jumping back to the interrupted instruction.

If this mechanism works correctly, there is generally no way for the
interrupted process to know there was an interrupt, unless it detects the
change in time between instructions.

## 8.2 Context switching

Interrupt handlers can be fast because they don't have to save the entire
hardware state; they only have to save registers they are planning to use.

But when an interrupt occurs, the kernel does not always resume the
interrupted process. It has the option of switching to another process. This
mechanism is called a "**context switch**".

In general, the kernel doesn't know which registers a process will use, so it
has to save all of them. Also, when it switches to a new process, it might
have to clear data stored in the memory management unit (see Section 3.6). And
after the context switch, it might take some time for the new process to load
data into the cache. For these reasons, context switches are relatively slow,
on the order of thousands of cycles, or a few microseconds.

In a multi-tasking system, each process is allowed to run for a short period
of time called a "**time slice**" or "**quantum**". During a context switch,
the kernel sets a hardware timer that causes an interrupt at the end of the
time slice. When the interrupt occurs, the kernel can switch to another
process or allow the interrupted process to resume. The part of the operating
system that makes this decision is the "**scheduler**".

## 8.3 The process life cycle

When a process is created, the operating system allocates a data structure
that contains information about the process, called a "**process control
block**" or PCB. Among other things, the PCB keeps track of the process state,
which is one of:

- **Running**, if the process is currently running on a core.
- **Ready**, if the process could be running, but isn't, usually because there
  are more runnable processes than cores.
- **Blocked**, if the process cannot run because it is waiting for a future
  event like network communication or a disk read.
- **Done**, if the process has completed, but has exit status information that
  has not been read yet.

Here are the events that cause a process to transition from one state to
another:

- A process is created when the running program executes a system call
  like `fork`. At the end of the system call, the new process is usually
  ready. Then the scheduler might resume the original process (the "parent")
  or start the new process (the "child").
- When a process is started or resumed by the scheduler, its state changes
  from ready to running.
- When a process is interrupted and the scheduler chooses not to let it
  resume, its state changes from running to ready.
- If a process executes a system call that cannot complete immediately,
  like a disk request, it becomes blocked and the scheduler usually chooses
  another process.
- When an operation like a disk request completes, it causes an interrupt.
  The interrupt handler figures out which process was waiting for the
  request and switches its state from blocked to ready. Then the scheduler
  may or may not choose to resume the unblocked process.
- When a process calls `exit`, the interrupt handler stores the exit code in
  the PCB and changes the process's state to done.

## 8.4 Scheduling

As we saw in Section 2.3 there might be hundreds of processes on a computer,
but usually most of them are blocked. Most of the time, there are only a few
processes that are ready or running. When an interrupt occurs, the scheduler
decides which process to start or resume.

On a workstation or laptop, the primary goal of the scheduler is to minimize
**response time**; that is, the computer should respond quickly to user
actions. Response time is also important on a server, but in addition the
scheduler might try to maximize **throughput**, which is the number of
requests that complete per unit of time.

Usually the scheduler doesn't have much information about what processes
are doing, so its decisions are based on a few heuristics:

- Processes might be limited by different resources. A process that does
  a lot of computation is probably **CPU-bound**, which means that its run
  time depends on how much CPU time it gets. A process that reads data
  from a network or disk might be **I/O-bound**, which means that it would
  run faster if data input and output went faster, but would not run faster
  with more CPU time. Finally, a process that interacts with the user is
  probably blocked, most of the time, waiting for user actions.

  The operating system can sometimes classify processes based on their
  past behavior, and schedule them accordingly. For example, when an
  interactive process is unblocked, it should probably run immediately,
  because a user is probably waiting for a reply. On the other hand, a
  CPU-bound process that has been running for a long time might be less
  time-sensitive.

- If a process is likely to run for a short time and then make a blocking
  request, it should probably run immediately, for two reasons: (1) if the
  request takes some time to complete, we should start it as soon as
  possible, and (2) it is better for a long-running process to wait for a
  short one, rather than the other way around.

  As an analogy, suppose you are making an apple pie. The crust takes
  5 minutes to prepare, but then it has to chill for half an hour. It takes
  20 minutes to prepare the filling. If you prepare the crust first, you can
  prepare the filling while the crust is chilling, and you can finish the pie
  in 35 minutes. If you prepare the filling first, the process takes
  55 minutes.

Most schedulers use some form of **priority-based scheduling**, where each
process has a priority that can be adjusted up or down over time. When the
scheduler runs, it chooses the runnable process with the highest priority.

Here are some of the factors that determine a process's priority:

- A process usually starts with a relatively high priority so it starts
  running quickly.
- If a process makes a request and blocks before its time slice is complete,
  it is more likely to be interactive or I/O-bound, so its priority should go
  up.
- If a process runs for an entire time slice, it is more likely to be
  long-running and CPU-bound, so its priority should go down.
- If a task blocks for a long time and then becomes ready, it should get a
  priority boost so it can respond to whatever it was waiting for.
- If process A is blocked waiting for process B, for example if they are
  connected by a pipe, the priority of process B should go up.
- The system call `nice` allows a process to decrease (but not increase) its
  own priority, allowing programmers to pass explicit information to the
  scheduler.

For most systems running normal workloads, scheduling algorithms don't have
a substantial effect on performance. Simple scheduling policies are usually
good enough.

## 8.5 Real-time scheduling

However, for programs that interact with the real world, scheduling can be
very important. For example, a program that reads data from sensors and
controls motors might have to complete recurring tasks at some minimum
frequency and react to external events with some maximum response time. These
requirements are often expressed in terms of "tasks" that must be completed
before "deadlines".

Scheduling tasks to meet deadlines is called "**real-time scheduling**". For
some applications, a general-purpose operating system like Linux can be
modified to handle real-time scheduling. These modifications might include:

- Providing richer APIs for controlling task priorities.
- Modifying the scheduler to guarantee that the process with highest
  priority runs within a fixed amount of time.
- Reorganizing interrupt handlers to guarantee a maximum completion time.
- Modifying locks and other synchronization mechanisms (coming up in the
  next chapter) to allow a high-priority task to preempt a lower-priority
  task.
- Choosing an implementation of dynamic memory allocation that guarantees a
  maximum completion time.

For more demanding applications, especially in domains where real-time
response is a matter of life and death, "**real-time operating systems**"
provide specialized capabilities, often with much simpler designs than general
purpose operating systems.

---

Chapter-8 from https://github.com/AllenDowney/ThinkOS
