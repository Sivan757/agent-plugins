---
paths:
  - "**/*.java"
---

# P3C: Collection Handling

## Mandatory

- Override `hashCode()` whenever overriding `equals()`; objects used as Map keys or in Sets must override both
- Never cast `ArrayList.subList()` result to `ArrayList` — it's an internal view class
- Don't modify original list size after calling `subList()` — causes `ConcurrentModificationException`
- Use `toArray(T[] array)` with correctly-sized array (`new String[list.size()]`); never use parameterless `toArray()`
- `Arrays.asList()` result is immutable — `add()`/`remove()`/`clear()` throw `UnsupportedOperationException`; modifications to original array are reflected in the list
- Respect PECS (Producer Extends Consumer Super):
  - `<? extends T>` collections are read-only (no `add`)
  - `<? super T>` collections are write-only (no `get` with specific type)
- Never `remove`/`add` elements in a `foreach` loop — use `Iterator.remove()` instead; synchronize `Iterator` in concurrent scenarios
- `Comparator` must satisfy: reflexivity (x,y opposite of y,x), transitivity (x>y, y>z implies x>z), symmetry (x==y implies same comparison with z)

## Recommended

- Specify initial capacity for collections: `new ArrayList<>(expectedSize)`, `new HashMap<>(expectedSize / 0.75 + 1)`
- Use `entrySet()` to iterate Maps, not `keySet()` (avoids double lookup); use `Map.forEach()` in JDK8+
- Know null-key/null-value rules: `HashMap` allows both null; `ConcurrentHashMap` and `Hashtable` allow neither; `TreeMap` disallows null key
- Use `Set` for deduplication instead of `List.contains()` loops
