# Chapter 4 — Files and file systems

When a process completes (or crashes), any data stored in main memory is
lost. But data stored on a hard disk drive (HDD) or solid state drive (SSD)
is "persistent;" that is, it survives after the process completes, even if the
computer shuts down.

Hard disk drives are complicated. Data is stored in blocks, which are laid out
in sectors, which make up tracks, which are arranged in concentric circles on
platters.

Solid state drives are simpler in one sense, because blocks are numbered
sequentially, but they raise a different complication: each block can be
written a limited number of times before it becomes unreliable.

As a programmer, you don't want to deal with these complications. What you
want is an appropriate abstraction of persistent storage hardware. The most
common abstraction is called a "file system."

Abstractly:

- A "file system" is a mapping from each file's name to its contents. If you
  think of the names as keys, and the contents as values, a file system is a
  kind of key-value database (see
  https://en.wikipedia.org/wiki/Key-value_database).
- A "file" is a sequence of bytes.

File names are usually strings, and they are usually "hierarchical"; that is,
the string specifies a path from a top-level directory (or folder), through a
series of subdirectories, to a specific file.

The primary difference between the abstraction and the underlying mechanism is
that files are byte-based and persistent storage is block-based. The operating
system translates byte-based file operations in the C library into block-based
operations on storage devices. Typical block sizes are 1-8 KiB.

For example, the following code opens a file and reads the first byte:

```c
FILE *fp = fopen("/home/downey/file.txt", "r");
char c = fgetc(fp);
fclose(fp);
```

When this code runs:

1. `fopen` uses the filename to find the top-level directory, called `/`, the
   subdirectory `home`, and the sub-subdirectory `downey`.

2. It finds the file named `file.txt` and "opens" it for reading, which means
   it creates a data structure that represents the file being read. Among
   other things, this data structure keeps track of how much of the file has
   been read, called the "file position".

   In DOS, this data structure is called a File Control Block, but I want to
   avoid that term because in UNIX it means something else. In UNIX, there
   seems to be no good name for it. It is an entry in the open file table, so
   I will call it an `OpenFileTableEntry`.

3. When we call `fgetc`, the operating system checks whether the next
   character of the file is already in memory. If so, it reads the next
   character, advances the file position, and returns the result.

4. If the next character is not in memory, the operating system issues an I/O
   request to get the next block. Disk drives are slow, so a process waiting
   for a block from disk is usually interrupted so another process can run
   until the data arrives.

5. When the I/O operation is complete, the new block of data is stored in
   memory, and the process resumes. It reads the first character and stores it
   as a local variable.

6. When the process closes the file, the operating system completes or cancels
   any pending operations, removes data stored in memory, and frees the
   `OpenFileTableEntry`.

The process for writing a file is similar, but there are some additional
steps. Here is an example that opens a file for writing and changes the first
character.

```c
FILE *fp = fopen("/home/downey/file.txt", "w");
fputc('b', fp);
fclose(fp);
```

When this code runs:

1. Again, `fopen` uses the filename to find the file. If it does not already
   exist, it creates a new file and adds an entry in the parent directory,
   `/home/downey`.

2. The operating system creates an `OpenFileTableEntry` that indicates that
   the file is open for writing, and sets the file position to 0.

3. `fputc` attempts to write (or re-write) the first byte of the file. If the
   file already exists, the operating system has to load the first block into
   memory. Otherwise it allocates a new block in memory and requests a new
   block on disk.

4. After the block in memory is modified, it might not be copied back to the
   disk right away. In general, data written to a file is "buffered", which
   means it is stored in memory and only written to disk when there is at
   least one block to write.

5. When the file is closed, any buffered data is written to disk and the
   `OpenFileTableEntry` is freed.

To summarize, the C library provides the abstraction of a file system that
maps from file names to streams of bytes. This abstraction is built on top of
storage devices that are actually organized in blocks.

## 4.1 Disk performance

I mentioned earlier that disk drives are slow. On current HDDs, the average
time to read a block from disk to memory might be 5-25 ms (see
https://en.wikipedia.org/wiki/Hard_disk_drive_performance_characteristics).
SSDs are faster, taking 25 µs to read a 4 KiB block and 250 µs to write one
(see http://en.wikipedia.org/wiki/Ssd#Controller).

To put these numbers in perspective, let's compare them to the clock cycle of
the CPU. A processor with clock rate 2 GHz completes one clock cycle every
0.5 ns. The time to get a byte from memory to the CPU is typically around 100
ns. If the processor completes one instruction per clock cycle, it would
complete 200 instructions while waiting for a byte from memory.

In one microsecond, it would complete 2000 instructions, so while waiting 25
µs for a byte from an SSD, it would complete 50,000.

In one millisecond, it would complete 2,000,000 instructions, so while waiting
20 ms for a byte from a HDD, it might complete 40 million. If there's nothing
for the CPU to do while it waits, it would be idle. That's why the operating
system generally switches to another process while it is waiting for data from
disk.

The gap in performance between main memory and persistent storage is one of
the major challenges of computer system design. Operating systems and hardware
provide several features intended to "fill in" this gap:

- **Block transfers**: The time it takes to load a single byte from disk is
  5-25 ms. By comparison, the additional time to load an 8 KiB block is
  negligible. So systems generally try to read large blocks each time they
  access the disk.

- **Prefetching**: Sometimes the operating system can predict that a process
  will read a block and start loading it before it is requested. For example,
  if you open a file and read the first block, there is a good chance you will
  go on to read the second block. The operating system might start loading
  additional blocks before they are requested.

- **Buffering**: As I mentioned, when you write a file, the operating system
  stores the data in memory and only writes it to disk later. If you modify
  the block several times while it is in memory, the system only has to write
  it to disk once.

- **Caching**: If a process has used a block recently, it is likely to use it
  again soon. If the operating system keeps a copy of the block in memory, it
  can handle future requests at memory speed.

Some of these features are also implemented in hardware. For example, some
disk drives provide a cache that stores recently-used blocks, and many disk
drives read more than one block at a time, even if only one is requested.

These mechanisms generally improve the performance of programs, but they don't
change the behavior. Usually programmers don't have to think about them, with
two exceptions: (1) if the performance of a program is unexpectedly bad, you
might have to know something about these mechanisms to diagnose the problem,
and (2) when data is buffered, it can be harder to debug a program. For
example, if a program prints a value and then crashes, the value might not
appear, because it might be in a buffer. Similarly, if a program writes data
to disk and then the computer loses power, the data might be lost if it is in
a cache and not yet on disk.

## 4.2 Disk metadata

The blocks that make up a file might be arranged contiguously on disk, and
file system performance is generally better if they are, but most operating
systems don't require contiguous allocation. They are free to place a block
anywhere on disk, and they use various data structures to keep track of them.

In many UNIX file systems, that data structure is called an "inode," which
stands for "index node". More generally, information about files, including
the location of their blocks, is called "metadata". (The content of the file
is data, so information about the file is data about data, hence "meta".)

Since inodes reside on disk along with the rest of the data, they are designed
to fit neatly into disk blocks. A UNIX inode contains information about a
file, including the user ID of the file owner; permission flags indicating who
is allowed to read, write, or execute it; and timestamps that indicate when it
was last modified and accessed. In addition, it contains block numbers for the
first 12 blocks that make up the file.

If the block size is 8 KiB, the first 12 blocks make up 96 KiB. On most
systems, that's big enough for a large majority of files, but it's definitely
not big enough for all of them. That's why the inode also contains a pointer
to an "indirection block", which contains nothing but pointers to other
blocks.

The number of pointers in an indirection block depends on the sizes of the
blocks and the block numbers, but it is often 1024. With 1024 block numbers
and 8 KiB blocks, an indirection block can address 8 MiB. That's big enough
for all but the largest files, but still not big enough for all.

That's why the inode also contains a pointer to a "double indirection block",
which contains pointers to indirection blocks. With 1024 indirection blocks,
we can address 8 GiB.

And if that's not big enough, there is (finally) a triple indirection block,
which contains pointers to double indirection blocks, yielding a maximum file
size of 8 TiB. When UNIX inodes were designed, that seemed big enough to serve
for a long time. But that was a long time ago.

As an alternative to indirection blocks, some files systems, like FAT, use a
File Allocation Table that contains one entry for each block, called a
"cluster" in this context. A root directory contains a pointer to the first
cluster in each file. The FAT entry for each cluster points to the next
cluster in the file, similar to a linked list. For more details, see
http://en.wikipedia.org/wiki/File_Allocation_Table.

## 4.3 Block allocation

File systems have to keep track of which blocks belong to each file; they also
have to keep track of which blocks are available for use. When a new file is
created, the file system finds an available block and allocates it. When a
file is deleted, the file system makes its blocks available for re-allocation.

The goals of the block allocation system are:

- **Speed**: Allocating and freeing blocks should be fast.
- **Minimal space overhead**: The data structures used by the allocator should
  be small, leaving as much space as possible for data.
- **Minimal fragmentation**: If some blocks are left unused, or some are only
  partially used, the unused space is called "fragmentation".
- **Maximum contiguity**: Data that is likely to be used at the same time
  should be physically contiguous, if possible, to improve performance.

It is hard to design a file system that achieves all of these goals,
especially since file system performance depends on "workload
characteristics" like file sizes, access patterns, etc. A file system that is
well tuned for one workload might not perform as well for another.

For this reason, most operating systems support several kinds of file systems,
and file system design is an active area of research and development. In the
last decade, Linux systems have migrated from ext2, which was a conventional
UNIX file system, to ext3, a "journaling" file system intended to improve
speed and contiguity, and more recently to ext4, which can handle larger files
and file systems. Within the next few years, there might be another migration
to the B-tree file system, Btrfs.

## 4.4 Everything is a file?

The file abstraction is really a "stream of bytes" abstraction, which turns
out to be useful for many things, not just file systems.

One example is the UNIX pipe, which is a simple form of inter-process
communication. Processes can be set up so that output from one process is
taken as input into another process. For the first process, the pipe behaves
like a file open for writing, so it can use C library functions like `fputs`
and `fprintf`. For the second process, the pipe behaves like a file open for
reading, so it uses `fgets` and `fscanf`.

Network communication also uses the stream of bytes abstraction. A UNIX socket
is a data structure that represents a communication channel between processes
on different computers (usually). Again, processes can read data from and
write data to a socket using "file" handling functions.

Reusing the file abstraction makes life easier for programmers, since they
only have to learn one API (application program interface). It also makes
programs more versatile, since a program intended to work with files can also
work with data coming from pipes and other sources.

---

Chapter-4 from https://github.com/AllenDowney/ThinkOS
