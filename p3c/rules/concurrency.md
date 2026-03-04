---
paths:
  - "**/*.java"
---

# P3C: Concurrency Rules

## Mandatory

- Singletons and their methods must be thread-safe
- Name threads and thread pools meaningfully for error tracing
- Always create threads through thread pools; never explicitly `new Thread()`
- Use `ThreadPoolExecutor` directly, not `Executors` factory methods:
  - `FixedThreadPool`/`SingleThreadPool`: unbounded queue (`Integer.MAX_VALUE`) risks OOM
  - `CachedThreadPool`/`ScheduledThreadPool`: unbounded thread creation risks OOM
- `SimpleDateFormat` is NOT thread-safe — don't define as `static` without synchronization; use `ThreadLocal<DateFormat>` or `DateTimeFormatter` (JDK8+)
- Minimize lock scope: prefer lock-free structures > block lock > method lock > class lock; never call RPC inside a synchronized block
- Lock multiple resources in consistent order across all threads to prevent deadlock
- Use optimistic locking (version column) for concurrent record updates; if conflict rate < 20% use optimistic lock, else pessimistic; retry at least 3 times
- Use `ScheduledExecutorService` instead of `Timer` (Timer kills all tasks if one throws uncaught exception)
- Recycle custom `ThreadLocal` variables, especially in thread pools where threads are reused

## Recommended

- Always call `countDown()` in a finally block when using `CountDownLatch`; child thread exceptions are not visible to the main thread
- Use `ThreadLocalRandom` instead of shared `Random` instances (avoids seed contention)
- Use `volatile` for the target field in double-checked locking pattern
- Use `AtomicInteger`/`LongAdder` (JDK8) for thread-safe counters, not `synchronized` increment
