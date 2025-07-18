# Design System Guide

## 🎨 Web Development Standards

This guide establishes comprehensive standards for all web applications to ensure consistency, maintainability, and excellent user experience across the platform.

---

## 📋 Table of Contents

1. [Typography Standards](#typography-standards)
2. [Color System](#color-system)
3. [Spacing Standards](#spacing-standards)
4. [Component Standards](#component-standards)
5. [Development Guidelines](#development-guidelines)
6. [Accessibility Standards](#accessibility-standards)
7. [Usage Examples](#usage-examples)

---

## 🔤 Typography Standards

### Font Families
- **Primary**: `Inter` - Used for all body text, UI elements, and most headings
- **Display**: `Cormorant Garamond` - Used for hero headings and special emphasis
- **Monospace**: `SF Mono` - Used for code snippets and technical content

### Font Sizes (Type Scale)
```css
--text-xs: 0.75rem;     /* 12px - Caption, small labels */
--text-sm: 0.875rem;    /* 14px - Body small, secondary text */
--text-base: 1rem;      /* 16px - Body text, default */
--text-lg: 1.125rem;    /* 18px - Body large, emphasis */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Headings */
--text-3xl: 1.875rem;   /* 30px - Large headings */
--text-4xl: 2.25rem;    /* 36px - Section headings */
--text-5xl: 3rem;       /* 48px - Page headings */
--text-6xl: 3.75rem;    /* 60px - Hero headings */
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### Semantic Typography Classes
```css
.heading-1        /* Hero headings (60px, Display font) */
.heading-2        /* Page headings (48px, Display font) */
.heading-3        /* Section headings (36px, Display font) */
.heading-4        /* Subsection headings (30px, Primary font) */
.heading-5        /* Small headings (24px, Primary font) */
.heading-6        /* Smallest headings (20px, Primary font) */

.body-large       /* Emphasized body text (18px) */
.body-normal      /* Default body text (16px) */
.body-small       /* Secondary body text (14px) */
.body-xs          /* Small text (12px) */

.label            /* Form labels (14px, medium weight) */
.label-small      /* Small labels (12px, medium weight) */
.caption          /* Caption text (12px, secondary color) */
.code             /* Code snippets (14px, monospace) */
.link             /* Links with hover states */
```

---

## 🎨 Color System

### Brand Colors
```css
--color-brand-primary: #3822aa;        /* Main brand color */
--color-brand-primary-hover: #241d32;  /* Hover state */
--color-brand-primary-active: #1a1526; /* Active state */
--color-brand-secondary: #241d32;      /* Secondary brand */
```

### Neutral Colors
```css
--color-neutral-0: #ffffff;     /* Pure white */
--color-neutral-50: #f9fafb;    /* Light gray */
--color-neutral-100: #f3f4f6;   /* Very light gray */
--color-neutral-200: #e5e7eb;   /* Light gray */
--color-neutral-300: #d1d5db;   /* Medium light gray */
--color-neutral-400: #9ca3af;   /* Medium gray */
--color-neutral-500: #6b7280;   /* Gray */
--color-neutral-600: #4b5563;   /* Dark gray */
--color-neutral-700: #374151;   /* Darker gray */
--color-neutral-800: #1f2937;   /* Very dark gray */
--color-neutral-900: #111827;   /* Almost black */
```

### Semantic Colors
```css
--color-success: #28a745;       /* Success states */
--color-warning: #ffc107;       /* Warning states */
--color-error: #dc3545;         /* Error states */
--color-info: #17a2b8;          /* Info states */
```

### Text Colors
```css
--color-text-primary: #1a1a1a;     /* Primary text */
--color-text-secondary: #6b7280;   /* Secondary text */
--color-text-muted: #9ca3af;       /* Muted text */
--color-text-link: #3822aa;        /* Links */
--color-text-disabled: #d1d5db;    /* Disabled text */
```

### Usage Classes
```css
.text-primary     /* Primary text color */
.text-secondary   /* Secondary text color */
.text-muted       /* Muted text color */
.text-brand       /* Brand color text */
.text-success     /* Success color text */
.text-warning     /* Warning color text */
.text-error       /* Error color text */

.bg-primary       /* Primary background */
.bg-secondary     /* Secondary background */
.bg-brand         /* Brand background */
.bg-success       /* Success background */
```

---

## 📏 Spacing Standards

### Spacing Scale (4px base unit)
```css
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

### Spacing Utility Classes
```css
.m-0, .m-1, .m-2, .m-3, .m-4, .m-5, .m-6, .m-8, .m-10, .m-12, .m-16, .m-20, .m-24
.p-0, .p-1, .p-2, .p-3, .p-4, .p-5, .p-6, .p-8, .p-10, .p-12, .p-16, .p-20, .p-24
.gap-0, .gap-1, .gap-2, .gap-3, .gap-4, .gap-5, .gap-6, .gap-8, .gap-10, .gap-12
```

---

## 🧩 Component Standards

### Button System
```css
.btn-primary      /* Brand color button */
.btn-secondary    /* Gray button */
.btn-success      /* Green button */
.btn-danger       /* Red button */
.btn-light        /* Light gray button */

.btn-large        /* Large button */
.btn-small        /* Small button */
.btn-xs           /* Extra small button */

.btn.loading      /* Loading state */
```

### Border Radius
```css
--radius-none: 0;           /* No radius */
--radius-sm: 0.125rem;      /* 2px */
--radius-base: 0.25rem;     /* 4px */
--radius-md: 0.375rem;      /* 6px */
--radius-lg: 0.5rem;        /* 8px */
--radius-xl: 0.75rem;       /* 12px */
--radius-full: 9999px;      /* Full rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### Spinner System
```css
.spinner          /* Default spinner */
.spinner-small    /* Small spinner */
.spinner-large    /* Large spinner */
.spinner-primary  /* Brand color spinner */
```

---

## 💻 Development Guidelines

### 1. **Always Use CSS Custom Properties**
```css
/* ✅ GOOD */
color: var(--color-text-primary);
font-size: var(--text-lg);
margin: var(--space-4);

/* ❌ BAD */
color: #1a1a1a;
font-size: 18px;
margin: 16px;
```

### 2. **Use Semantic Classes**
```html
<!-- ✅ GOOD -->
<h1 class="heading-1">Page Title</h1>
<p class="body-normal">Body text content</p>
<button class="btn-primary">Submit</button>

<!-- ❌ BAD -->
<h1 style="font-size: 60px; font-weight: bold;">Page Title</h1>
<p style="font-size: 16px;">Body text content</p>
<button style="background: #3822aa; color: white;">Submit</button>
```

### 3. **Follow Mobile-First Responsive Design**
```css
/* ✅ GOOD - Mobile first */
.container {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-8);
  }
}

/* ❌ BAD - Desktop first */
.container {
  padding: var(--space-8);
}

@media (max-width: 767px) {
  .container {
    padding: var(--space-4);
  }
}
```

### 4. **Consistent Naming Conventions**
```css
/* ✅ GOOD - kebab-case */
.user-profile-card { }
.email-template-list { }

/* ❌ BAD - Mixed cases */
.userProfileCard { }
.EmailTemplateList { }
```

### 5. **Use Utility Classes for Common Patterns**
```html
<!-- ✅ GOOD -->
<div class="p-4 m-2 rounded-lg shadow-md bg-primary">
  <h2 class="text-xl font-semibold text-brand">Card Title</h2>
</div>

<!-- ❌ BAD -->
<div style="padding: 16px; margin: 8px; border-radius: 8px; box-shadow: ...; background: white;">
  <h2 style="font-size: 20px; font-weight: 600; color: #3822aa;">Card Title</h2>
</div>
```

---

## ♿ Accessibility Standards

### 1. **Focus States**
All interactive elements automatically receive focus styling:
```css
*:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### 2. **Color Contrast**
- Primary text: AA compliant (4.5:1 ratio)
- Secondary text: AA compliant (4.5:1 ratio)
- Interactive elements: AA compliant

### 3. **Keyboard Navigation**
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Logical tab order is maintained

### 4. **Screen Reader Support**
```html
<!-- ✅ GOOD -->
<button class="btn-primary" aria-label="Submit form">
  <span class="spinner" aria-hidden="true"></span>
  Submit
</button>

<!-- ❌ BAD -->
<div onclick="submit()">Submit</div>
```

### 5. **Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📖 Usage Examples

### Typography Example
```html
<article>
  <h1 class="heading-1">Article Title</h1>
  <p class="body-large">This is the lead paragraph with emphasized text.</p>
  <p class="body-normal">This is regular body text that follows the lead.</p>
  <p class="caption">Published on March 15, 2024</p>
</article>
```

### Button Examples
```html
<div class="gap-4">
  <button class="btn-primary">Primary Action</button>
  <button class="btn-secondary">Secondary Action</button>
  <button class="btn-success">Success Action</button>
  <button class="btn-danger">Danger Action</button>
  <button class="btn-primary loading">Loading...</button>
</div>
```

### Form Example
```html
<form class="gap-4">
  <div>
    <label class="label">Email Address</label>
    <input type="email" class="form-input" placeholder="Enter your email">
  </div>
  <div>
    <label class="label">Message</label>
    <textarea class="form-input" rows="4" placeholder="Enter your message"></textarea>
  </div>
  <button type="submit" class="btn-primary">Send Message</button>
</form>
```

### Card Example
```html
<div class="bg-primary shadow-md rounded-lg p-6">
  <h3 class="heading-5 text-brand">Card Title</h3>
  <p class="body-normal text-secondary">Card description text goes here.</p>
  <div class="gap-2 mt-4">
    <button class="btn-primary btn-small">Action</button>
    <button class="btn-secondary btn-small">Cancel</button>
  </div>
</div>
```

### Loading States
```html
<div class="loading-container">
  <div class="spinner"></div>
  <p class="loading-text">Loading content...</p>
</div>

<button class="btn-primary loading">
  Submitting...
</button>
```

---

## 🚀 Quick Reference

### Common Patterns
```css
/* Card Component */
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}

/* Form Input */
.form-input {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-base);
  padding: var(--space-3);
  font-size: var(--text-base);
}

/* Alert Component */
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}
```

### File Structure
```
src/
├── styles/
│   ├── design-system.css     # Main design system
│   ├── typography.css        # Typography & buttons
│   └── components/
│       ├── forms.css
│       ├── cards.css
│       └── modals.css
└── components/
    ├── Button/
    ├── Input/
    └── Card/
```

---

## ✅ Checklist for Developers

Before submitting any code:

- [ ] All colors use CSS custom properties
- [ ] All spacing uses the spacing scale
- [ ] Typography uses semantic classes
- [ ] Buttons use the unified button system
- [ ] Components are responsive and mobile-first
- [ ] Accessibility standards are met
- [ ] Focus states are properly implemented
- [ ] Code follows naming conventions
- [ ] No hardcoded values in CSS
- [ ] Proper contrast ratios are maintained

---

## 🔗 Resources

- [CSS Custom Properties Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Cormorant Garamond Font](https://fonts.google.com/specimen/Cormorant+Garamond)

---

**Last Updated**: 2024  
**Version**: 1.0  
**Maintained by**: Development Team

For questions or suggestions, please contact the development team. 