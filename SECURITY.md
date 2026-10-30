# Security & Intellectual Property Policy

## Proprietary Code Protection
**Lyriic** is a proprietary Windows desktop application created and owned by **Jeetron1x**.

To protect against intellectual property theft, code extraction, and unauthorized reverse-engineering:
1. **Proprietary Licensing**:
   All source code, design assets, and binary packaging are protected by copyright law under an exclusive **All Rights Reserved** license.
2. **Anti-Scraping & Anti-Prompt-Recovery Directive**:
   Scraping this repository, extracting prompts, training AI models, or utilizing automated decompilers / prompt reverse-engineering tools (such as GitReverse) is strictly forbidden.
3. **Official Binary Authenticode Code-Signing**:
   Official Windows releases (`Lyriic-Setup-*.exe`) distributed via [GitHub Releases](https://github.com/jeetron1x/lyriic/releases) are digitally signed by **Jeetron1x**. Always verify that the installer publisher displays **`Jeetron1x`** in the Windows User Account Control (UAC) dialog before running.
4. **Binary Hardening**:
   Production distributions feature multi-layer internal string array encryption, control flow flattening, and sealed ASAR packaging.

## Reporting a Security Vulnerability
If you discover a security vulnerability or security bug in Lyriic, please report it responsibly:
- **Author**: Jeetron1x
- **GitHub**: [https://github.com/jeetron1x](https://github.com/jeetron1x)
- **Security Inquiries**: Open an issue or message via [GitHub](https://github.com/jeetron1x/lyriic)

Please do not open public issue tickets disclosing sensitive exploits before giving the author reasonable time to issue an update.
