# Security & Anti-Reverse-Engineering Policy

## Architecture & Code Protection
**Lyriic** is protected against unauthorized decompilation, reverse engineering, string extraction, and prompt recovery:

1. **RC4/Base64 Encrypted String Arrays**:
   All internal endpoints, logic handlers, string literals, and prompts are encrypted in randomized string pools and deciphered only dynamically at runtime.

2. **Control Flow Flattening & Dead Code Protection**:
   Functions are flattened into non-linear switch-case state machines, neutralizing AST-based decompilers and automated analysis tools (such as gitreverse).

3. **Identifier Mangling**:
   All internal variables, private methods, and control blocks are mangled with hexadecimal generators.

4. **Sealed ASAR Container**:
   Production distribution packages files within a compiled ASAR container without loose plaintext assets on the local file system.

## Reporting a Vulnerability
If you discover any security issue, please contact **jeetron1x** via GitHub:
- [https://github.com/jeetron1x](https://github.com/jeetron1x)
