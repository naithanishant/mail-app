# 📄 Product Requirements Document (PRD)

**Product Name:** StackMailer (codename)
**Version:** Full Product Scope
**Owner:** Nishant Naithani
**Purpose:** Build a campaign and email delivery platform leveraging Contentstack’s CMS, localization, and CDP capabilities.

---

## 🧐 Narrative (Pitch-style)

Marketing teams today are everywhere - scattered across time zones, speaking different languages, and moving at breakneck speed. But here's the problem: creating campaigns still feels like swimming upstream. You're juggling disconnected tools, flying blind without proper visibility, and wrestling with systems that just won't bend to your needs.

We're building something different - an email marketing platform that actually gets it. Think of it as taking Contentstack's rock-solid content management and wrapping it in a interface that just makes sense, with workflows that actually flow.

Here's how it works: Contentstack handles the heavy lifting for templates and localized content (because nobody wants to recreate the same email in 12 languages). Then we layer on everything else you need - campaign logic that thinks like you do, approval flows that don't make you want to pull your hair out, reliable email delivery, and down the road, smart integrations with Lytics CDP for the kind of personalization that makes customers feel seen.

The beauty? We're not trying to reinvent everything. We're taking the best parts of what already works and connecting them in ways that make sense for real people doing real work. Fast launches, content that scales across markets, and campaigns so targeted they feel personal - without the headache of building everything from scratch.
---

## ⚙️ Tech Stack Overview

| Layer                | Technology Used                             | Notes                                        |
| -------------------- | ------------------------------------------- | -------------------------------------------- |
| **Frontend**         | React.js (TypeScript)                       | User Interface                               |
| **Backend API**   (future)     | Node.js (Express or Nest.js)                | API layer, queue handling                    |
| **Database**         | PostgreSQL / MongoDB                        | Metadata (users, campaigns, recipients)      |
| **CMS**              | Contentstack                                | Content Types, Entries, Localization         |
| **CDP** (future)     | [Lytics CDP](https://www.lytics.com/)       | Personalization, audience targeting          |
| **Email Delivery**   | SendGrid              | Transactional & campaign sending             |
| **Scheduling/Queue** (future)  | Google Cloud Task                           | Campaign schedule and retry logic            |
| **Authentication**  (future)   | Auth0 / Firebase Auth                       | Role-based access (admin, reviewer, creator) |
| **Monitoring** (future)       | LogRocket / Sentry / Datadog                | Frontend/backend observability               |
| **Hosting**          | Contentstack Launch                         | Scalable deployment                          |

---

## 🧰 Architecture Overview

(Diagram Placeholder)

---

## 🧩 Core Concepts

### 1. Email Templates (Structures)

* Created by marketing leads.
* Stored as **Content Types** in Contentstack.
* Fields: subject, blocks (text, image, button), footer.
* UID saved in app DB.

### 2. Email Content (Localized Entries)

* Filled by content creators.
* Stored as **Entries** in Contentstack under the template type.
* Contentstack's localization used for regional versions.
* Entry UID + locale saved in DB.

### 3. Campaign Workflow

* Draft → Review → Approved → Scheduled → Sent.
* Reviewers and Approvers can comment/approve content.
* Platform tracks state transitions and timestamps.

### 4. Recipients and Lists

* Stored in backend DB.
* Uploaded manually or via CSV.
* Future: integrate Lytics segments or dynamic tags.

### 5. Email Scheduler

* Backend queues jobs based on scheduled time.
* Sends localized versions to appropriate users.

### 6. Localization Support

* Natively supported via Contentstack locales.
* Preview email per locale.
* Sending logic auto-selects based on recipient preference.

---

## 📦 Feature Breakdown

| Feature                        | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| **Template Builder UI**        | Interface to create email layouts → maps to CMS CT |
| **Content Editor**             | Fill localized entries using predefined templates  |
| **Review & Approval Workflow** | Role-based workflow with visual progress tracking  |
| **Campaign Scheduler**         | Pick start date/time and recipient list            |
| **Email Delivery Engine**      | Send localized versions at scale                   |
| **Recipient Management**       | Add/edit/delete + CSV import                       |
| **Campaign History & Logs**    | Track status per recipient per campaign            |
| **Preview Mode**               | Visualize final email per locale before sending    |

---

## 🚀 Future Features

| Feature                    | Tool / Tech               | Description                                      |
| -------------------------- | ------------------------- | ------------------------------------------------ |
| **CDP Integration**        | Lytics                    | Segment audiences based on behavior, CRM data    |
| **Personalization**        | Lytics + Handlebars       | Dynamic tags in content (`{{firstName}}`)        |
| **User Segmentation**      | Lytics or custom backend  | Tag-based groups (by geography, behavior)        |
| **A/B Testing**            | Platform logic            | Compare subject lines or CTA performance         |
| **Performance Dashboards** | Custom + Lytics Analytics | Open rate, bounce rate, engagement reports       |
| **Multi-org Support**      | Backend ACL logic         | Support teams/agencies with workspace separation |

---

## 📊 Simplified Data Model

```ts
// Email Template
{
  id: string;
  name: string;
  contentstack_uid: string;
  fields: string[];
  created_by: string;
}

// Email Entry
{
  id: string;
  template_id: string;
  entry_uid: string;
  locale: string;
  status: 'draft' | 'review' | 'approved';
  created_by: string;
}

// Campaign
{
  id: string;
  entry_id: string;
  scheduled_at: Date;
  status: 'scheduled' | 'sent' | 'failed';
  recipients: string[];
}

// Recipient
{
  id: string;
  email: string;
  name: string;
  locale: string;
  tags: string[];
}
```

---

## 🗓️ Development Roadmap

### Phase 1 (Weeks 1–3): MVP

* Template structure UI
* Content creation with localization
* Save templates and entries to Contentstack
* Basic recipient upload
* Manual sending of email
* Status tracking

### Phase 2 (Weeks 4–7): Automation & Workflow

* Review and approval flow
* Scheduling engine with queue
* Localization auto-send
* Campaign dashboard and history logs
* Error handling and retries

### Phase 3 (Weeks 8–12): Intelligence & Expansion

* Integrate with Lytics for CDP and segmentation
* Add personalization tags
* Analytics dashboard (opens, clicks)
* A/B Testing
* Multi-org support

---

## ✅ Success Metrics

| KPI                       | Goal                     |
| ------------------------- | ------------------------ |
| Campaign creation time    | < 10 mins                |
| Template reuse rate       | 70%+                     |
| Localization coverage     | 60% of campaigns         |
| Email delivery success    | > 99.5%                  |
| Engagement (Open Rate)    | ≥ 30%                    |
| CDP adoption (via Lytics) | 3 pilot users/orgs by Q3 |
