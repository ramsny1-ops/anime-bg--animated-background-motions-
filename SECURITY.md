# Security Policy

anime-bg is a browser-based creative-coding project with no backend, account
system, database, analytics service, or required network API. Even so, security
reports are welcome because demos may be embedded inside larger applications.

## Supported versions

| Version | Security support |
| --- | --- |
| Latest `main` branch | Supported |
| Latest tagged release | Supported |
| Older releases | Best effort |

## Reporting a vulnerability

Please do not publish an exploitable security issue in a public GitHub issue before
the maintainer has had a reasonable opportunity to review it.

Use the private contact method on the repository maintainer's GitHub profile and
include:

- the affected file or effect;
- a clear description of the behavior;
- reproduction steps;
- browser and operating-system information when relevant;
- impact and realistic attack conditions;
- a suggested fix if you have one.

## Security boundaries

The project intentionally avoids:

- `eval` and `new Function`;
- runtime HTML injection for user-supplied values;
- third-party JavaScript dependencies;
- remote fonts and tracking scripts;
- required cookies;
- authentication tokens;
- API keys;
- network requests in the particle demos.

Configuration import reads local JSON selected by the user. Imported values are
validated against existing UI control ranges before being applied.

The screenshot feature uses the current canvas only. Configuration export creates a
local JSON download in the browser.

## Embedding guidance

When you embed an effect in a production website:

1. serve the files over HTTPS;
2. keep your application's Content Security Policy strict;
3. avoid mixing untrusted HTML into the demo controls;
4. validate any configuration received from your own backend;
5. pin your own release or commit instead of loading mutable remote code;
6. review changes before upgrading a customized copy.

## Dependency risk

The demos have zero runtime dependencies. Development verification also uses only
built-in JavaScript APIs. This deliberately keeps the dependency attack surface
small.

## Disclosure process

After a report is confirmed, the preferred process is to prepare a fix, verify all
10 effects, document the change in `CHANGELOG.md`, then publish the fix before
sharing detailed exploit information publicly.
