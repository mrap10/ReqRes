# ReqRes

Somthing like leetcode but modern and more than just DSA practice platform

## High level architecture

Browser (untrusted)

↓

API (trusted)

↓

Runner (isolated & disposable)

---

### Runner: does the heavy lifting of executing user submissions in a secure environment

It pulls the submission code from the database, runs it against predefined test cases, and reports the results back to the API.

---

Will update this README as the project evolves.
