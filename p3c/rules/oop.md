---
paths:
  - "**/*.java"
---

# P3C: OOP Rules

## Mandatory

- Access static members via class name, not through an instance reference
- Always annotate overridden methods with `@Override`
- Varargs must be same type and placed last in parameter list; avoid `Object` varargs
- Mark deprecated APIs with `@Deprecated` and document the replacement
- Never use deprecated classes or methods — find and use their replacements
- Call `equals()` on the constant or known non-null side: `"test".equals(object)` not `object.equals("test")`; prefer `Objects.equals()` (JDK7+)
- Compare wrapper types (`Integer`, `Long`, etc.) with `equals()`, never `==` (only -128..127 are cached)
- POJO class fields must be wrapper types; RPC method params/returns must be wrapper types; local variables should be primitives
- No default values in POJO class field definitions
- Don't change `serialVersionUID` when adding fields to a serializable class
- No business logic in constructors — use an `init()` method
- POJO classes must implement `toString()`; call `super.toString()` if extending another POJO

## Recommended

- Use `StringBuilder.append()` in loops for string concatenation, not `str + str` (each `+` allocates a new `StringBuilder`)
- Use `final` for: classes not meant to be inherited, fields not meant to be reassigned, methods not meant to be overridden, local variables not meant to change
- Be cautious with `Object.clone()` — it's shallow copy by default; implement deep copy explicitly
- Minimize access scope: prefer `private` > `protected` > `public`; utility classes must not have `public` or default constructors
- Check `String.split()` result before indexing — trailing empty strings are dropped
- Order class members: public/protected methods > private methods > getter/setter
- No business logic in getter/setter methods
