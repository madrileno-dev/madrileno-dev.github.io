---
title: "The Small Team Manifesto"
---

Most engineering advice is written by and for very large organizations. It solves their problems: coordinating hundreds of engineers, serving billions of requests, surviving reorgs. Small teams have different problems. We have a few people, a few customers and a short window to prove we're worth keeping. We've spent more than a decade building products in small teams, often end to end, from the first customer conversation to keeping the thing running in production. This is what we've learned to care about.

## 1. Speed is how small teams survive.

We build MVPs and innovation projects inside enterprises, where you're out if you can't prove your value quickly. There's no room for a project setup that takes months. There's also no room for "the table view is two weeks of work once the spec is ready, then QA, staging, sign-off and the next release window in four weeks." A new hire should have the system running before lunch on day one and ship something meaningful to production before going home. That only happens when the patterns are ready to use rather than waiting to be invented, and when shipping is a routine instead of an event.

## 2. Customers compare you to the best apps they use.

Your customer spends the day in Linear, Stripe and their banking app. They won't lower their expectations because you're five people. Live updates without refreshing, a mobile app that feels native, fast pages, dark mode, accessible forms, emails that look like they came from a real company: people expect this now. Few small teams can afford to build all of it from scratch for every product, so it's worth having real-time, email, image handling, a design system and a mobile app ready before the first feature. Otherwise they get postponed until month six, and month six never comes.

## 3. Make undoing cheap.

Teams slow down when every release is a bet they can't take back. Feature flags, small deploys and fast rollback turn a mistake from a lost weekend into a few lost minutes. When recovery is cheap, you can ship on a Friday afternoon without holding your breath. Data needs its own plan: soft deletion for ordinary mistakes, backups with a tested restore for the worse ones. Redeploying yesterday's code won't bring back a deleted table.

## 4. Every customer has a name.

A small team may have only a handful of customers, and one of them can be a large share of the revenue. "Our error rate is under 0.01%" means nothing if that 0.01% is your biggest customer's checkout. We want to hear about an error before the customer does. Then we want to answer, in minutes and from the data we already have: who was affected, by what, why, and are they still affected? The alternative is a ticket that closes three months later as "can't reproduce." That's why observability is part of every feature, not something added after launch. Only a few people share on-call. How do you look a colleague in the eye after they spent a night unable to debug something you built?

## 5. Catch mistakes at build time, not at run time.

`undefined is not a function` and `NameError: name 'name' is not defined` should never reach a customer. Types and static analysis catch structural mistakes. Business rules live in the domain model and, where practical, in database constraints. Contracts between backend and frontend are generated, so drift between them is a compile error instead of a support ticket. Fast, reliable tests cover behavior, integration tests cover the important boundaries, and the journeys customers pay for are covered end to end.

This matters even more when an agent writes half the code. An agent works in a loop: write, build, test, fix. A type error that shows up ten seconds later is feedback it can act on. A runtime error in production is feedback it never sees. The earlier and more precisely the tooling catches drift, the less a human has to catch in review. Aim for "if it compiles, it works." You'll never get all the way there, but each step closer removes a whole class of bugs for good. A pipeline that only proves the code runs isn't doing its job. It should prove the change is safe.

## 6. Engineers talk to the business.

We don't outsource understanding. Engineers talk to customers and stakeholders, ask the awkward questions, and use the business's language in meetings and in code. Sometimes what comes out of those conversations is a manual process, a smaller change, or leaving the thing alone. The system should look like the business it serves: shipments, claims, invoices and renewals, not controllers and services, or Kafka feeding MongoDB feeding Parquet files. Opening the codebase should tell you what the product does, not which technologies were in fashion when it was built.

## 7. Build for what you know. Keep the interest rate low.

Small teams are still discovering their product, so requirements will change. Premature abstractions, distributed architectures and generic platforms make tomorrow's change expensive, and they're often worse than the technical debt they were meant to prevent. Debt itself is a legitimate tool: it gets you in front of a customer faster. Like any loan, what matters is the interest rate. A missing admin screen, a manual step in the release, a hardcoded config value: these are isolated, known and cheap to pay off later. A shortcut in the data model, an untested billing path, a hack every new feature has to work around: these charge interest on every change. Take on the first kind freely. Refuse the second.

## 8. Own the whole thing.

"Frontend's done, waiting for backend." "Backend's done, waiting for DevOps." "Development's done, waiting for QA." Every handoff is a queue, and the feature waits in each one. Ideally one person takes a feature from the customer's problem through design, implementation and deployment, then checks whether it actually solved the problem. You still want a specialist on the hard parts. You don't want a wall between them and the rest of the work. This only works with a stack one person can hold end to end.

## 9. Predictable beats popular.

Boring technology means knowing how a thing fails before it fails on you: a database with decades of production behind it, one process, no broker. A small team has nobody whose full-time job is understanding the message broker. The same test picks the language, and for us it picks Scala. It isn't the popular choice. It tells you more before the code runs than anything else we've shipped with, and we'll take the learning curve for that. Everywhere else, pick the thing that surprised nobody last year.

## 10. Every moving part pays rent.

A couple of boxes and a single well-tuned Postgres can handle all the traffic most small products will ever see. Every extra managed service costs money. It also adds a failure mode, something else to monitor, and one more place to look when things break. It has to earn its keep in developer time, reliability, capability or cost. Kubernetes everywhere is not a virtue, and it doesn't guarantee five nines. Choose your platform deliberately on day one, not after you notice your node count growing faster than your codebase.

## 11. AI multiplies what you already have.

Give an agent a codebase with written-down conventions, feedback it can read, searchable logs and CI that says what went wrong and where, and a five-person team ships like a much larger one. Give it less and it writes code faster than the team can understand or run. Everything above (types, conventions, boring tech, business language, observability) is also what makes a codebase easy for agents to work with. What helps a new hire on day one helps an agent on every run.

## 12. Secure by default, because there's no security team.

Small teams don't have a security reviewer. Whatever security the product has comes from its defaults. Tokens expire and rotate. Secrets and sensitive headers stay out of logs and telemetry. The browser gets a strict content security policy. Production refuses to start with the dev login or sample secrets enabled. Authorization has tests that try to read another customer's data. Dependency updates are a routine chore, not a once-a-year scramble when something makes the news. The less of this depends on someone remembering it, the less of it gets skipped under a deadline. A data leak that a large company can absorb can end a small one.

## What this isn't

It isn't a claim that big companies are doing it wrong. They have different problems, and their solutions fit them. It isn't a ban on Kubernetes, Kafka or microservices; when they earn their keep, use them. We still break things. We just want to know within minutes what broke, for whom, and how to undo it.

madrileño is these twelve points written as code, and the standard we judge it against.

Written by the [team](/support/) behind madrileño.
