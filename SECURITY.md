# Security policy

TESSERA is a research prototype, not a hardened service. Do not use it as the sole assurance mechanism for safety-critical or security-critical systems.

## Reporting a vulnerability

Please report security issues privately to the repository maintainer through GitHub's private vulnerability reporting feature, when enabled. Include a minimal reproducer and the affected commit. Do not publish secrets or sensitive production models in a public issue.

## Scope

Relevant issues include parser/model validation failures that cause incorrect results, certificate-verifier acceptance of semantically invalid certificates, or unintended code execution. Performance problems and unsupported features are not security vulnerabilities unless they enable denial of service in a deployed context.
