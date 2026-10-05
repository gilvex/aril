# Pomegranate: product brief

## Goal

Make deploying and operating services comfortable, understandable, and repeatable. Offer an open-source, self-hostable core and a managed SaaS option, with infrastructure-as-code and visible desired state.

The first accepted deliverable is this planning studio. The user requested a persistent web workspace for drawing and connecting architecture, user flows, and project structure before developing the deployment product's design.

## Product references

- Pterodactyl Panel: the user's operational experience motivates the requirements below. These are user-reported pain points, not a verified audit of the current upstream product.
- Yandex Arcanum / Yandex Cloud Deploy: a reference named by the user; the exact system and desired workflows need clarification before assuming its architecture.
- n8n: inspiration for a connected visual canvas.
- Juxtopposed: inspiration for thoughtful redesign, clear hierarchy, playful restraint, and useful interaction. No affiliation or endorsement is implied.

## Requirements captured

| ID  | Requirement                      | Intended outcome                                                                                           |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| R01 | Batch operations                 | Create many instances and grant access across many resources, with per-item outcomes.                      |
| R02 | Session control                  | View sessions and sign-in activity; revoke access without manually editing Redis or a database.            |
| R03 | Fleet organization               | Projects, environments, tags, search, filters, and useful ordering.                                        |
| R04 | Registry and mount configuration | Configure image registry references and mounts through an authorized UI.                                   |
| R05 | Actionable diagnostics           | Role-appropriate error details, correlation, and filtering of noisy node/SFTP logs.                        |
| R06 | Database providers               | Model more than MySQL, including PostgreSQL; keep the adapter contract explicit.                           |
| R07 | Granular permissions             | Scoped actions on resources and projects instead of all-or-nothing administration.                         |
| R08 | Large directories                | Paginate or virtualize large directories without silent truncation.                                        |
| R09 | Effective access                 | Inspect which resources a user can access and why.                                                         |
| R10 | Documented API                   | A versioned, documented contract shared by the UI and automation.                                          |
| R11 | Startup configuration            | Authorized edits to startup commands with validation and an explicit apply/restart workflow.               |
| R12 | Durable operational history      | Retain installation, runtime, and crash events even when no browser is connected.                          |
| R13 | Reusable game layers             | Prepare game content once, define a reusable server blueprint, and instantiate with individual parameters. |
| R14 | Self-hosted and SaaS             | Preserve a coherent core across both delivery models.                                                      |
| R15 | Infrastructure as code           | Track desired state, preview changes, and reconcile outcomes.                                              |

The app contains editable acceptance criteria for each requirement. Initial statuses are Captured; proposed diagram nodes are Exploring. These are not approved technical decisions.

## Reusable game deployment model

Runtime image → versioned game content → server blueprint → instances.

A blueprint describes the launch command, environment-variable schema, resource defaults, mount requirements, and health checks. Each instance supplies validated values such as game port, world name, and secret references. Host-port allocation must account for placement: two instances on one host cannot bind the same host port.

Game binaries and prepared dependencies should be immutable, versioned artifacts; worlds, save files, and writable configuration belong in separate per-instance volumes. Updating a shared artifact must not overwrite saved worlds. Exact OCI layering versus artifact caching is a future technical decision: sharing an image layer does not automatically make arbitrary mutable game data safe to share.

## Suggested next milestones

1. Review the seeded boards and acceptance criteria; decide tenancy, roles, supported first workload, and core vocabulary.
2. Design the first real workflow: choose blueprint → configure instances → review batch → deploy → inspect retained outcomes.
3. Specify the API and desired-state model, including permissions, secret references, logs, retries, cancellation, and partial failures.
4. Implement a narrow deployment slice with a node agent and one runtime/provider, then expand using the validated contract.

Open decisions include license, SaaS isolation, initial orchestration target, exact Yandex reference, and supported database providers. The user explicitly selected invite-only collaborative planning; the studio now includes shared editing, presence, profiles, and activity.
