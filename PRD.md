# 📄 Product Requirements Document (PRD)

## 📋 Project Name: **Mini-Mailchimp**

---

## 🧠 Objective
To build a basic Mailchimp-like web app where users can:
- Manage email templates
- Manage audience/contacts
- Create and send basic email campaigns (direct send only, no scheduling)
- Preview emails before sending

**Built with React.js on the frontend and Contentstack for content management.**

---

## 🌟 Goals
- Allow users to CRUD **audience**, **email templates**, and **campaigns**
- Provide UI to compose a campaign and send emails immediately
- Ensure basic validation, previewing, and user feedback for core flows

> ⏳ **Stretch Goals (if time permits)**:
> - Schedule campaigns for future delivery
> - Simulate analytics like open/click tracking

---

## 🧱 Core Features

### 1. 👥 Audience Management
- List all contacts (name, email, tags)
- Add/edit/delete a contact
- Optional: Tag-based filtering

### 2. 🧩 Email Template Management
- Create/update/delete templates
- Use a rich text or HTML editor
- Live preview of template content

### 3. 📨 Basic Campaign Sending
- Create a campaign:
  - Enter subject
  - Choose email template
  - Select multiple audience contacts
- Preview final email
- Send immediately via a basic email API (EmailJS, mock backend, or simulate sending)
- Save campaign data to Contentstack

---

## 📂 Contentstack Models

### `Audience`
| Field         | Type           |
|---------------|----------------|
| Name          | Text           |
| Email         | Text           |
| Tags          | Multi-select/Text array |
| Subscribed    | Boolean        |

### `EmailTemplate`
| Field         | Type            |
|---------------|-----------------|
| Name          | Text            |
| Content       | Rich Text/HTML  |
| Thumbnail     | File (optional) |

### `Campaign`
| Field         | Type                   |
|---------------|------------------------|
| Title         | Text                   |
| Subject       | Text                   |
| Template      | Reference (EmailTemplate) |
| Audience      | Reference (Multiple - Audience) |
| Sent At       | Date-Time (set on send) |

> Fields like "status" and "scheduledAt" are optional and can be added only if time permits campaign scheduling.

---

## 🧰 Tech Stack

| Layer        | Tool                     |
|--------------|--------------------------|
| Frontend     | React.js                 |
| CMS          | Contentstack             |
| Email (Basic)| Automation               |
| Hosting      | Contentstack Launch      |

---

## 🧭 User Flows

### 🧐 Audience
1. View list of contacts
2. Click “Add Contact” → fill name/email/tags
3. Save → updates Contentstack
4. Edit/Delete existing entries

### 💾 Templates
1. View list of templates
2. Click “New Template” → enter name and HTML
3. Preview content
4. Save to Contentstack

### 📨 Campaign
1. Click “New Campaign”
2. Fill subject line
3. Choose template and audience
4. Preview final email
5. Click “Send”
6. Emails are sent via EmailJS or simulated
7. Campaign is stored in Contentstack with timestamp

---

## 🗓 Timeline (2–3 Weeks)

| Week | Tasks |
|------|-------|
| Week 1 | Contentstack models, audience & template CRUD |
| Week 2 | Campaign builder + email send logic |
| Week 3 | Polish UI, test flows, add stretch features if time allows |

---

## ✅ Success Criteria

- [ ] Functional and responsive React UI
- [ ] Ability to manage templates and audience
- [ ] Emails can be composed and sent from the app
- [ ] Campaigns are logged in Contentstack
- [ ] App is deployed and stable

