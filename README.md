
# HostelMitra

**HostelMitra** is a full-stack hostel complaint management portal designed to streamline how students report hostel-related issues and how administrators track, prioritize, and resolve them.

Instead of relying on scattered WhatsApp messages, informal complaints, or manual follow-ups, HostelMitra provides a centralized digital workflow for complaint submission, real-time tracking, admin resolution, prioritization, and audit visibility.

---

## 🚀 Project Overview

HostelMitra is built to solve a common campus problem: hostel complaints often get lost, delayed, duplicated, or remain unresolved because there is no structured complaint lifecycle.

The platform allows students to raise complaints related to hostel facilities such as rooms, bathrooms, electricity, water, Wi-Fi, mess, cleanliness, furniture, and maintenance. Admins can view all complaints, update their status, resolve issues, and track complaint history.

The system is designed as a practical campus operations tool with a simple user experience and real-time database-backed tracking.

---

## 🎯 Problem Statement

In many college hostels, complaint handling is fragmented and inefficient:

- Students report issues through informal channels.
- Complaints are difficult to track after submission.
- Hostel admins may not have a clear priority order.
- Repeated issues from multiple students are not easily visible.
- There is limited transparency in whether a complaint is pending, in progress, or resolved.
- No proper audit trail exists for when a complaint was raised or updated.

HostelMitra addresses these gaps by providing a centralized complaint management portal for students and hostel administrators.

---

## ✅ Key Features

### Student Features

- Student login using Google Authentication.
- Raise hostel-related complaints through a simple form.
- Add complaint title, description, category, and relevant details.
- Track complaint status in real time.
- View whether a complaint is pending, in progress, or resolved.
- Vote or support existing complaints to help prioritize common issues.

### Admin Features

- Admin dashboard to view all submitted complaints.
- Role-based access for administrative users.
- Update complaint status.
- Resolve and close complaints.
- View complaint timestamps and status history.
- Prioritize complaints based on votes and urgency.
- Manage complaint triage from a centralized interface.

### System Features

- Firebase Authentication for secure login.
- Firestore database for real-time complaint storage.
- Google OAuth-based access.
- Role-based controls for students and admins.
- Real-time status updates.
- Vote-based complaint prioritization.
- Timestamp and status audit trail.
- Responsive web interface.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Firebase Hosting |
| Authentication | Firebase Authentication, Google OAuth |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| State/Data | Firestore real-time listeners |
| Access Control | Role-based admin/student flow |

---

## 🧠 Why HostelMitra?

HostelMitra is not just a form submission app. It is designed as a lightweight campus operations system.

The main idea is to move hostel complaints from informal communication to a structured workflow:

```text
Student Complaint
    ↓
Complaint Stored in Firestore
    ↓
Admin Dashboard Review
    ↓
Prioritization / Status Update
    ↓
Resolution
    ↓
Student Visibility
```

This improves accountability, reduces confusion, and helps administrators identify recurring hostel problems.

---

## 🏗️ System Architecture

```text
User Interface
    ↓
Firebase Authentication
    ↓
Role Check
    ↓
Student Dashboard / Admin Dashboard
    ↓
Cloud Firestore
    ↓
Real-time Complaint Updates
    ↓
Status Tracking and Resolution
```

### Main Components

1. **Authentication Layer**
   - Handles Google sign-in.
   - Identifies logged-in users.
   - Supports domain-restricted or role-based access if configured.

2. **Student Complaint Layer**
   - Allows students to submit complaints.
   - Stores complaint title, description, category, user details, status, votes, and timestamps.

3. **Admin Management Layer**
   - Displays complaints to admins.
   - Allows status updates and resolution.
   - Helps admins prioritize complaints.

4. **Database Layer**
   - Uses Firestore collections to store complaints and user/admin metadata.
   - Supports real-time updates.

5. **Hosting Layer**
   - Deployed using Firebase Hosting for easy public access.

---

## 📌 Complaint Lifecycle

Each complaint follows a simple operational lifecycle:

```text
Submitted → Pending → In Progress → Resolved
```

Possible fields stored for each complaint:

```js
{
  id: "complaint_id",
  title: "Fan not working",
  description: "The ceiling fan in Room B-204 is not working.",
  category: "Electrical",
  status: "Pending",
  createdBy: "student_email",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  votes: 0,
  resolvedBy: "admin_email",
  resolutionNote: "Electrician assigned and fan repaired."
}
```

---

## 📂 Suggested Folder Structure

Your actual folder structure may differ, but a typical HostelMitra structure can look like this:

```text
hostelmitra/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ComplaintCard.jsx
│   │   ├── ComplaintForm.jsx
│   │   ├── AdminComplaintTable.jsx
│   │   └── StatusBadge.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── Home.jsx
│   │
│   ├── firebase/
│   │   └── config.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   └── complaintService.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hostelmitra.git
cd hostelmitra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Firebase Project

Go to the Firebase Console and create a new project.

Enable the following services:

- Firebase Authentication
- Google Sign-In Provider
- Cloud Firestore
- Firebase Hosting, optional for deployment

### 4. Add Firebase Configuration

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

If your project uses React without Vite, environment variable names may start with `REACT_APP_` instead of `VITE_`.

### 5. Run the Project Locally

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:5173
```

For Create React App projects, the local URL may be:

```text
http://localhost:3000
```

---

## 🔐 Firebase Authentication

HostelMitra uses Google OAuth through Firebase Authentication.

Recommended setup:

1. Go to Firebase Console.
2. Open Authentication.
3. Enable Google Sign-In.
4. Add your authorized domain.
5. Use the logged-in user's email to identify student/admin role.

Example role logic:

```js
const adminEmails = [
  "admin@example.com",
  "warden@example.com"
];

const isAdmin = adminEmails.includes(user.email);
```

For production, admin roles should be stored securely in Firestore or Firebase custom claims instead of hardcoding emails.

---

## 🗄️ Firestore Database Design

A basic Firestore structure can be:

```text
complaints/
  complaintId/
    title
    description
    category
    status
    createdBy
    createdAt
    updatedAt
    votes
    priority
    resolutionNote
    resolvedBy

users/
  userId/
    name
    email
    role
    createdAt
```

### Example Complaint Document

```js
{
  title: "Water leakage near bathroom",
  description: "There is continuous water leakage near the second-floor bathroom.",
  category: "Water",
  status: "Pending",
  createdBy: "student@college.ac.in",
  votes: 3,
  priority: "Medium",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

---

## 📊 Admin Dashboard

The admin dashboard is designed for hostel authorities or student council representatives who handle hostel complaints.

Admin actions may include:

- View all complaints.
- Filter complaints by category or status.
- Sort by votes, date, or priority.
- Change status to pending, in progress, or resolved.
- Add resolution notes.
- Track unresolved complaints.
- Identify recurring hostel issues.

---

## 👨‍🎓 Student Dashboard

The student dashboard allows users to:

- Submit new complaints.
- View their own complaints.
- View active hostel complaints.
- Upvote important complaints.
- Track complaint progress.
- Check whether an issue has been resolved.

This creates transparency and reduces the need for repeated follow-ups.

---

## 🧪 Example Complaint Categories

HostelMitra can support categories such as:

- Electrical
- Water
- Wi-Fi
- Mess
- Cleanliness
- Furniture
- Plumbing
- Security
- Room Maintenance
- Other

---

## 📸 Screenshots

Add screenshots here after deployment.

```markdown
![Login Page](./screenshots/login.png)
![Student Dashboard](./screenshots/student-dashboard.png)
![Admin Dashboard](./screenshots/admin-dashboard.png)
![Complaint Tracking](./screenshots/complaint-tracking.png)
```

---

## 🌐 Live Demo

Live Demo:

```text
https://hostelmitra-81b7d.web.app/
```

Repository:

```text
https://github.com/your-username/hostelmitra
```

Replace the repository link with your actual GitHub repository URL.

---

## 🚀 Deployment

### Deploy with Firebase Hosting

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

Login:

```bash
firebase login
```

Initialize Firebase:

```bash
firebase init
```

Select:

- Hosting
- Existing Firebase project
- Build folder, usually `dist` for Vite or `build` for Create React App

Build the app:

```bash
npm run build
```

Deploy:

```bash
firebase deploy
```

---

## 🔒 Security Considerations

For production use, the following improvements are recommended:

- Store admin roles in Firestore or Firebase custom claims.
- Add Firestore security rules.
- Restrict complaint update permissions to admins.
- Allow students to edit or delete only their own complaints.
- Validate all complaint inputs.
- Prevent duplicate votes from the same user.
- Add domain-based login restriction for college email IDs.
- Avoid exposing sensitive student data publicly.

Example Firestore rule idea:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /complaints/{complaintId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

These rules are only a starting point. A production deployment should define stricter role-based access.

---

## 📈 Future Improvements

Planned or possible upgrades:

- Email or WhatsApp notifications for complaint updates.
- Complaint image upload using Firebase Storage.
- Admin analytics dashboard.
- Hostel-wise and floor-wise complaint filtering.
- SLA-based complaint escalation.
- Automatic duplicate complaint detection.
- Monthly complaint reports.
- Student feedback after resolution.
- Warden-level and maintenance-team-level dashboards.
- Push notifications.
- Mobile app version.
- AI-based complaint classification and priority detection.

---

## 🧩 Challenges Faced

Some key challenges in building HostelMitra include:

- Designing a simple complaint lifecycle.
- Managing student and admin role separation.
- Keeping complaint status updates real time.
- Structuring Firestore data for easy querying.
- Making the portal practical for real campus usage.
- Balancing simplicity with useful operational features.

---

## 🧠 Learnings

Through this project, I learned:

- Firebase Authentication and Google OAuth integration.
- Firestore real-time database operations.
- Role-based UI rendering.
- Full-stack workflow design.
- Complaint lifecycle modelling.
- Deployment using Firebase Hosting.
- Building user-facing tools for real campus problems.

---

## 🏁 Impact

HostelMitra helps convert hostel complaint handling from an informal and scattered process into a structured digital workflow.

It improves:

- Complaint visibility
- Admin accountability
- Student transparency
- Issue prioritization
- Resolution tracking
- Campus operations efficiency

---

## 👨‍💻 Author

**Aryan Satyendra Kumar**

- Email: kumararyan66472@gmail.com
- LinkedIn: https://www.linkedin.com/in/kumaryan12
- GitHub: https://github.com/Kumaryan12

---

## 📄 License

This project is open for educational and demonstration purposes.

You may add an MIT License if you want others to reuse or contribute to the project.

```text
MIT License
```
```
:::

One thing I’ll push you on: don’t write **“used by all NIT Goa students”** in the README unless you can prove it with deployment usage or screenshots. Better wording is:

> Designed for NIT Goa hostel complaint workflows and deployed as a live campus complaint management prototype.

That sounds credible and still strong.
