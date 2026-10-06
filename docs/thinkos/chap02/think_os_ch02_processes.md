# Chapter 2 — Processes

## 2.1 Abstraction and virtualization

Before we talk about processes, I want to define a few words:

- **Abstraction:** An abstraction is a simplified representation of something
  complicated. For example, if you drive a car, you understand that when you
  turn the wheel left, the car goes left, and vice versa. Of course, the
  steering wheel is connected to a sequence of mechanical and (often)
  hydraulic systems that turn the wheels, and the wheels interact with the
  road in ways that can be complex, but as a driver, you normally don't have
  to think about any of those details. You can get along very well with a
  simple mental model of steering. Your mental model is an abstraction.

  Similarly, when you use a web browser, you understand that when you click
  on a link, the browser displays the page the link refers to. The software
  and network communication that make that possible are complex, but as a
  user, you don't have to know the details.

  A large part of software engineering is designing abstractions like these
  that allow users and other programmers to use powerful and complicated
  systems without having to know about the details of their implementation.

- **Virtualization:** An important kind of abstraction is virtualization,
  which is the process of creating a desirable illusion.

  For example, many public libraries participate in inter-library
  collaborations that allow them to borrow books from each other. When I
  request a book, sometimes the book is on the shelf at my local library, but
  other times it has to be transferred from another collection. Either way, I
  get a notification when it is available for pickup. I don't need to know
  where it came from, and I don't need to know which books my library has. As
  a whole, the system creates the illusion that my library has every book in
  the world.

  The collection physically located at my local library might be small, but
  the collection available to me virtually includes every book in the
  inter-library collaboration.

  As another example, most computers are only connected to one network, but
  that network is connected to others, and so on. What we call the Internet
  is a collection of networks and a set of protocols that forward packets
  from one network to the next. From the point of view of a user or
  programmer, the system behaves as if every computer on the Internet is
  connected to every other computer. The number of physical connections is
  small, but the number of virtual connections is very large.

  The word "virtual" is often used in the context of a **virtual machine**,
  which is software that creates the illusion of a dedicated computer running
  a particular operating system, when in reality the virtual machine might be
  running, along with many other virtual machines, on a computer running a
  different operating system.

  In the context of virtualization, we sometimes call what is really
  happening "physical", and what is virtually happening either "logical" or
  "abstract."

## 2.2 Isolation

One of the most important principles of engineering is **isolation**: when
you are designing a system with multiple components, it is usually a good idea
to isolate them from each other so that a change in one component doesn't have
undesired effects on other components.

One of the most important goals of an operating system is to isolate each
running program from the others so that programmers don't have to think about
every possible interaction. The software object that provides this isolation
is a **process**.

A process is a software object that represents a running program. I mean
"software object" in the sense of object-oriented programming; in general, an
object contains data and provides methods that operate on the data. A process
is an object that contains the following data:

- The text of the program, usually a sequence of machine language
  instructions.

- Data associated with the program, including static data (allocated at
  compile time) and dynamic data (allocated at run time).

- The state of any pending input/output operations. For example, if the
  process is waiting for data to be read from disk or for a packet to arrive
  on a network, the status of these operations is part of the process.

- The hardware state of the program, which includes data stored in registers,
  status information, and the **program counter**, which indicates which
  instruction is currently executing.

Usually one process runs one program, but it is also possible for a process to
load and run a new program.

It is also possible, and common, to run the same program in more than one
process. In that case, the processes share the same program text but
generally have different data and hardware states.

Most operating systems provide a fundamental set of capabilities to isolate
processes from each other:

- **Multitasking:** Most operating systems have the ability to interrupt a
  running process at almost any time, save its hardware state, and then
  resume the process later. In general, programmers don't have to think about
  these interruptions. The program behaves as if it is running continuously
  on a dedicated processor, except that the time between instructions is
  unpredictable.

- **Virtual memory:** Most operating systems create the illusion that each
  process has its own chunk of memory, isolated from all other processes.
  Again, programmers generally don't have to think about how virtual memory
  works; they can proceed as if every program has a dedicated chunk of
  memory.

- **Device abstraction:** Processes running on the same computer share the
  disk drive, the network interface, the graphics card, and other hardware.
  If processes interacted with this hardware directly, without coordination,
  chaos would ensue. For example, network data intended for one process might
  be read by another. Or multiple processes might try to store data in the
  same location on a hard drive. It is up to the operating system to maintain
  order by providing appropriate abstractions.

As a programmer, you don't need to know much about how these capabilities are
implemented. But if you are curious, you will find a lot of interesting things
going on under the metaphorical hood. And if you know what's going on, it can
make you a better programmer.

## 2.3 UNIX processes

While I write this book, the process I am most aware of is my text editor,
`emacs`. Every once in a while I switch to a terminal window, which is a
window running a UNIX **shell** that provides a command-line interface.

When I move the mouse, the window manager wakes up, sees that the mouse is
over the terminal window, and wakes up the terminal. The terminal wakes up the
shell. If I type `make` in the shell, it creates a new process to run Make,
which creates another process to run LaTeX and then another process to display
the results.

If I need to look something up, I might switch to another desktop, which wakes
up the window manager again. If I click on the icon for a web browser, the
window manager creates a process to run the web browser. Some browsers, like
Chrome, create a new process for each window and each tab.

And those are just the processes I am aware of. At the same time there are
many other processes running in the background. Many of them are performing
operations related to the operating system.

The UNIX command `ps` prints information about running processes. If you run
it in a terminal, you might see something like this:

```
  PID TTY          TIME CMD
 2687 pts/1    00:00:00 bash
 2801 pts/1    00:01:24 emacs
24762 pts/1    00:00:00 ps
```

The first column is the unique numerical process ID. The second column is the
terminal that created the process; "TTY" stands for teletypewriter, which was
the original mechanical terminal.

The third column is the total processor time used by the process, in hours,
minutes, and seconds. The last column is the name of the running program. In
this example, `bash` is the name of the shell that interprets the commands I
type in the terminal, `emacs` is my text editor, and `ps` is the program
generating this output.

By default, `ps` lists only the processes associated with the current
terminal. If you use the `-e` flag, you get every process (including
processes belonging to other users, which is a security flaw, in my opinion).

On my system there are currently 233 processes. Here are some of them:

```
  PID TTY          TIME CMD
    1 ?        00:00:17 init
    2 ?        00:00:00 kthreadd
    3 ?        00:00:02 ksoftirqd/0
    4 ?        00:00:00 kworker/0:0
    8 ?        00:00:00 migration/0
    9 ?        00:00:00 rcu_bh
   10 ?        00:00:16 rcu_sched
   47 ?        00:00:00 cpuset
   48 ?        00:00:00 khelper
   49 ?        00:00:00 kdevtmpfs
   50 ?        00:00:00 netns
   51 ?        00:00:00 bdi-default
   52 ?        00:00:00 kintegrityd
   53 ?        00:00:00 kblockd
   54 ?        00:00:00 ata_sff
   55 ?        00:00:00 khubd
   56 ?        00:00:00 md
   57 ?        00:00:00 devfreq_wq
```

`init` is the first process created when the operating system starts. It
creates many of the other processes, and then sits idle until the processes it
created are done.

`kthreadd` is a process the operating system uses to create new threads.
We'll talk more about threads later, but for now you can think of a thread as
kind of a process. The `k` at the beginning stands for **kernel**, which is
the part of the operating system responsible for core capabilities like
creating threads. The extra `d` at the end stands for **daemon**, which is
another name for processes like this that run in the background and provide
operating system services. In this context, "daemon" is used in the sense of a
helpful spirit, with no connotation of evil.

Based on the name, you can infer that `ksoftirqd` is also a kernel daemon;
specifically, it handles software interrupt requests, or "soft IRQ".

`kworker` is a worker process created by the kernel to do some kind of
processing for the kernel.

There are often multiple processes running these kernel services. On my system
at the moment, there are 8 `ksoftirqd` processes and 35 `kworker` processes.

I won't go into more details about the other processes, but if you are
interested you can search for more information about them. You should run `ps`
on your system and compare your results to mine.

---

Chapter-2 from https://github.com/AllenDowney/ThinkOS
