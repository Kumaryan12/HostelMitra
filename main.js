// main.js


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const publicIssuesList = document.getElementById("publicIssues");
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  collection,
  addDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const provider = new GoogleAuthProvider();

// 🔧 replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyBorRHgJlfYM5NOU1p6v1nCZwluLfmtHXo",
  
  authDomain: "hostelmitra-81b7d.firebaseapp.com",
  projectId: "hostelmitra-81b7d",
  storageBucket: "hostelmitra-81b7d.firebasestorage.app",
  messagingSenderId: "470662467889",
  appId: "1:470662467889:web:5eee0f0cbb56e9f2c7e010",
  measurementId: "G-8NLW4TBNTG"
};

window.updateStatus = async function (id, status) {
  try {
    const ref = doc(db, "complaints", id);
    await updateDoc(ref, { status });
    alert("Complaint marked as resolved!");
  } catch (err) {
    console.error(err);
    alert("Update failed: " + err.message);
  }
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.auth = auth;  
const db = getFirestore(app);

// Auto-fill and lock the email field from Google account
onAuthStateChanged(auth, (user) => {
  const emailEl = document.getElementById("emailAddress");
  if (!emailEl) return;               // not on this page
  if (!user) {
    emailEl.value = "";
    emailEl.readOnly = true;          // keeps it non-editable even if empty
    return;
  }
  emailEl.value = user.email || "";
  emailEl.readOnly = true;            // lock it
  emailEl.style.background = "#f8fafc";
  emailEl.style.cursor = "not-allowed";
  emailEl.title = "This email comes from your Google login";
});


window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
  } catch (e) {
    alert(e.message);
  }
};
const complaintList = document.getElementById("complaintList");
if (complaintList) {
  complaintList.innerHTML = "<li class='empty'>Loading…</li>";

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      complaintList.innerHTML = "<li class='empty'>Please sign in to see your complaints.</li>";
      return;
    }

    // Prefill form once (nice UX)
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("emailAddress");
    if (nameEl && !nameEl.value) nameEl.value = user.displayName || "";
    if (emailEl && !emailEl.value) emailEl.value = user.email || "";

    // Two queries:
    // 1) New complaints (have uid)
    const byUid   = query(collection(db, "complaints"), where("uid", "==", user.uid));
    // 2) Old complaints created before you added uid (fallback by email)
    

    const cache = new Map(); // id -> { id, data }

    const render = () => {
      const items = Array.from(cache.values())
        .sort((a, b) => String(b.data.timestamp || "").localeCompare(String(a.data.timestamp || "")));

      complaintList.innerHTML = "";
      if (!items.length) {
        complaintList.innerHTML = "<li class='empty'>No complaints yet.</li>";
        return;
      }
      for (const { data: c } of items) {
        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.category}</b> — ${c.description}<br>
          <small>Room ${c.room} • ${c.status} • ${c.timestamp ?? ""}</small>
        `;
        complaintList.appendChild(li);
      }
    };

    const apply = (snap) => {
      snap.docChanges().forEach((ch) => {
        if (ch.type === "removed") cache.delete(ch.doc.id);
        else cache.set(ch.doc.id, { id: ch.doc.id, data: ch.doc.data() });
      });
      render();
    };

    const unsub1 = onSnapshot(byUid, apply, (e) => console.error("byUid error:", e));
    window.addEventListener("beforeunload", () => { try { unsub1(); unsub2(); } catch(_){} });
  });
}


window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // look up role in Firestore
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const role = snap.data().role;
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "common_issues.html";
      }
    } else {
      alert("No role found for this user in Firestore!");
    }
  } catch (e) {
    alert(e.message);
  }
};
window.loginAdmin = async function () {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const ADMIN_EMAIL = "emallikarjuna@nitgoa.ac.in";  // change to your real admin email

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      window.location.href = "admin.html";
    } else {
      alert("Access denied: Not an admin account");
      await auth.signOut();
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
};





// ---------------- Complaint submission ----------------
window.submitComplaint = async function () {
  const name = document.getElementById("name").value.trim();
  const room = document.getElementById("room").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const contactEmail = (document.getElementById("emailAddress")?.value || "").trim();

  if (!name || !room || !description) {
    alert("Please fill all required fields (*)");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in again.");
    window.location.href = "student_login.html";
    return;
  }

  try {
    await addDoc(collection(db, "complaints"), {
      uid: user.uid,                    // 👈 important: tie to user
      userEmail: user.email,
      contactEmail: user.email,     

      name,
      room,
      category,
      description,
      visibility,
      status: "Pending",
      votes: 0,
      voters: [],
      timestamp: new Date().toISOString() // keep as string; no index hassles
    });

    alert("Complaint submitted!");
    document.getElementById("description").value = "";
  } catch (err) {
    console.error("Submit failed:", err);
    alert("Error: " + err.message);
  }
};





// ---------- PUBLIC FEED (Common Issues) ----------
(() => {
  // Support either a <ul id="publicIssues"> or a grid container like <div id="publicGrid">
  const container =
    document.getElementById("publicIssues") ||
    document.getElementById("publicGrid") ||
    document.querySelector("[data-public-feed]");

  if (!container) return;

  // Kill any previous listener to avoid duplicates from old code
  if (window.__publicUnsub) {
    try { window.__publicUnsub(); } catch {}
    window.__publicUnsub = null;
  }

  // Helper to clear & render a small "empty" state
  const renderEmpty = (msg) => {
    container.innerHTML = "";
    const el = document.createElement(container.tagName === "UL" ? "li" : "div");
    el.className = "empty";
    el.textContent = msg;
    container.appendChild(el);
  };

  const ACTIVE_STATES = ["Pending", "In Progress"];

  // Prefer true server-side filtering (requires composite index):
  // visibility == 'public' AND status IN ['Pending','In Progress'] ORDER BY votes desc, timestamp desc
  const q = query(
    collection(db, "complaints"),
    where("visibility", "==", "public"),
    where("status", "in", ACTIVE_STATES),
    orderBy("votes", "desc"),
    orderBy("timestamp", "desc")
  );

  window.__publicUnsub = onSnapshot(
    q,
    (snapshot) => {
      container.innerHTML = "";

      if (snapshot.empty) {
        renderEmpty("No active public complaints.");
        return;
      }

      snapshot.forEach((docSnap) => {
        const c = docSnap.data();

        // Extra guard in case a weird doc slips through (trailing spaces etc.)
        const st = (c.status || "").trim().toLowerCase();
        if (st === "resolved") {
          console.warn("Resolved slipped through filter:", docSnap.id, c.status);
          return;
        }

        console.log("[public] render", docSnap.id, c.status, c.visibility);

        // Render as card or list item depending on container
        const node = document.createElement(container.tagName === "UL" ? "li" : "div");
        if (container.tagName !== "UL") node.className = "card"; // optional styling

        node.innerHTML = `
          <b>${escapeHtml(c.category)}</b> — ${escapeHtml(c.description)}<br>
          <small>Status: ${escapeHtml(c.status)} • Votes: ${c.votes ?? 0} • Room: ${escapeHtml(c.room)}</small>
          <div style="margin-top:6px">
            <button onclick="vote('${docSnap.id}')">👍 ${c.votes ?? 0}</button>
          </div>
        `;
        container.appendChild(node);
      });
    },
    (err) => {
      console.error("Public feed error:", err);
      renderEmpty("Unable to load feed.");
    }
  );
})();







// ---------- Admin complaint view ----------
window.addEventListener("DOMContentLoaded", () => {
  const complaintsBody   = document.getElementById("complaintsBody");
  const filterVisibility = document.getElementById("filterVisibility");
  const filterStatus     = document.getElementById("filterStatus");
  if (!complaintsBody) return; // not on admin.html

  console.log("✅ Admin dashboard initialized with visibility + status filters");
  let unsubscribe = null;

  function loadComplaints() {
    const vis  = (filterVisibility && filterVisibility.value) || "all";
    const stat = (filterStatus && filterStatus.value) || "all";

    const filters = [];
    if (vis  !== "all") filters.push(where("visibility", "==", vis));
    if (stat !== "all") filters.push(where("status", "==", stat));

    // Build query (no server orderBy to avoid index hassle; sort client-side)
    const base = collection(db, "complaints");
    const q = filters.length ? query(base, ...filters) : base;

    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        complaintsBody.innerHTML = "";

        if (snapshot.empty) {
          complaintsBody.innerHTML =
            `<tr><td colspan="7">No complaints found for this filter.</td></tr>`;
          return;
        }

        // Sort newest first (supports string ISO or Firestore Timestamp)
        const rows = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.timestamp?.toMillis ? a.timestamp.toMillis()
                     : a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b.timestamp?.toMillis ? b.timestamp.toMillis()
                     : b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tb - ta;
          });

        for (const c of rows) {
          const noteId     = `note-${c.id}`;
          const isResolved = c.status === "Resolved";

          const noteCell = isResolved
            ? (c.adminNote
                ? `<div style="max-width:260px"><small><b>Note:</b> ${escapeHtml(c.adminNote)}</small></div>`
                : `<small>—</small>`)
            : `<textarea id="${noteId}" class="note-box" rows="2" style="width:260px"
                placeholder="Add resolution note (optional)"></textarea>`;

          const actionCell = isResolved
            ? ""
            : `
                <button class="btn warn"
                        onclick="updateStatus('${c.id}','In Progress')">In&nbsp;Progress</button>
                <button class="btn success"
                        onclick="resolveWithNote('${c.id}')">Resolved</button>
              `;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.room)}</td>
            <td>${escapeHtml(c.category)}</td>
            <td>
              ${escapeHtml(c.description)}
              ${visibilityChip(c.visibility)}
            </td>
            <td>${statusBadge(c.status)}</td>
            <td>${noteCell}</td>
            <td style="white-space:nowrap;">${actionCell}</td>
          `;
          complaintsBody.appendChild(tr);
        }
      },
      (err) => {
        console.error("admin snapshot error:", err);
        complaintsBody.innerHTML =
          `<tr><td colspan="7">Failed to load complaints.</td></tr>`;
      }
    );
  }

  loadComplaints();
  if (filterVisibility) filterVisibility.addEventListener("change", loadComplaints);
  if (filterStatus)     filterStatus.addEventListener("change", loadComplaints);
});

// ---------- Save note + resolve ----------
/* Make sure you have serverTimestamp imported:
   import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
*/
window.resolveWithNote = async function (id) {
  try {
    const user = auth.currentUser;
    if (!user) { alert("Please sign in again."); return; }

    const noteEl = document.getElementById(`note-${id}`);
    const adminNote = noteEl ? noteEl.value.trim() : "";

    const ref = doc(db, "complaints", id);
    await updateDoc(ref, {
      status: "Resolved",
      adminNote: adminNote || null,
      resolvedBy: user.email || null,
      resolvedByUid: user.uid || null,
      resolvedAt: serverTimestamp()
    });

    if (noteEl) noteEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Update failed: " + err.message);
  }
};


// ---------------- Student Auth ----------------
window.signupStudent = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful! Please log in.");
  } catch (err) {
    alert(err.message);
  }
};

window.loginStudent = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "common_issues.html";
  } catch (err) {
    alert(err.message);
  }
};



window.logout = async function () {
  try {
    await auth.signOut();
    alert("Logged out successfully!");
    window.location.href = "index.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
};

// ---------------- Student Google Sign-In ----------------
window.loginStudentWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // allow only nitgoa.ac.in addresses
    if (!user.email.endsWith("@nitgoa.ac.in")) {
      alert("Access denied: Only NIT Goa students can use this portal.");
      await auth.signOut();
      return;
    }

    window.location.href = "common_issues.html";
  } catch (err) {
    alert("Google sign-in failed: " + err.message);
  }
};







window.vote = async function (complaintId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to vote!");
    return;
  }

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const hasVoted = (data.voters || []).includes(user.uid);

  try {
    if (hasVoted) {
      // optional: allow un-vote
      await updateDoc(ref, {
        votes: increment(-1),
        voters: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(ref, {
        votes: increment(1),
        voters: arrayUnion(user.uid)
      });
    }
  } catch (err) {
    console.error("Vote update failed:", err);
    alert("Vote failed: " + err.message);
  }
};

function escapeHtml(s){
  const el = document.createElement('div');
  el.textContent = s ?? '';
  return el.innerHTML;
}
function statusBadge(status){
  const cls = status === 'Resolved'   ? 'badge-resolved'
            : status === 'In Progress'? 'badge-progress'
            : 'badge-pending';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}
function visibilityChip(v){
  if (!v) return '';
  const cls = v === 'private' ? 'chip-private' : 'chip-public';
  const label = v.charAt(0).toUpperCase() + v.slice(1);
  return `<span class="chip ${cls}">${label}</span>`;
}


// ---------- Resolved page: PUBLIC resolved (rules-aligned) ----------
const publicResolvedEl = document.getElementById("publicResolved");
if (publicResolvedEl) {
  publicResolvedEl.innerHTML = "<li class='empty'>Loading…</li>";

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      publicResolvedEl.innerHTML = "<li class='empty'>Please sign in to view resolved items.</li>";
      // Optionally force login:
      // location.href = "student_login.html";
      return;
    }

    const qResolvedPublic = query(
      collection(db, "complaints"),
      where("status", "==", "Resolved"),
      where("visibility", "==", "public") // <- enforce rule in the query
    );

    onSnapshot(qResolvedPublic, (snap) => {
      // sort client-side (avoids composite index)
      const items = snap.docs
        .map(d => d.data())
        .sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis()
                   : a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis()
                   : b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

      if (!items.length) {
        publicResolvedEl.innerHTML = "<li class='empty'>No resolved items yet.</li>";
        return;
      }

      publicResolvedEl.innerHTML = "";
      for (const c of items) {
        const ts = c.timestamp?.toDate ? c.timestamp.toDate()
                 : c.timestamp ? new Date(c.timestamp) : null;
        const when = ts ? ts.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";

        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
          <b>${c.category}</b> — ${c.description}<br>
          <small>Room ${c.room} • Resolved ${when ? "• " + when : ""}</small>
        `;
        publicResolvedEl.appendChild(li);
      }
    }, (err) => {
      console.error("publicResolved error:", err);
      publicResolvedEl.innerHTML = "<li class='empty'>Couldn't load resolved items.</li>";
    });
  });
}

// ---------- Resolved lists (public + mine) ----------
function formatTime(t) {
  try {
    const d = t?.toDate ? t.toDate() : (typeof t === "string" ? new Date(t) : null);
    return d ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";
  } catch { return ""; }
}

function renderResolvedItem(c) {
  const li = document.createElement("li");
  li.className = "item";
  li.innerHTML = `
    <div><b>${escapeHtml(c.category)}</b> — ${escapeHtml(c.description)}</div>
    <div class="meta">
      Room ${escapeHtml(c.room)} • Resolved • ${formatTime(c.resolvedAt || c.timestamp)}
      ${c.visibility ? ` • Visibility: ${escapeHtml(c.visibility)}` : ""}
    </div>
    ${c.adminNote ? `<div class="note">📝 ${escapeHtml(c.adminNote)}</div>` : ""}
  `;
  return li;
}




const myResolvedEl = document.getElementById("myResolved");
if (myResolvedEl) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      myResolvedEl.innerHTML = `<li class="empty">Please sign in to see your resolved items.</li>`;
      return;
    }
    const q = query(
      collection(db, "complaints"),
      where("uid", "==", user.uid),
      where("status", "==", "Resolved"),
      orderBy("timestamp", "desc")
    );
    onSnapshot(q, (snap) => {
      myResolvedEl.innerHTML = "";
      if (snap.empty) {
        myResolvedEl.innerHTML = `<li class="empty">No resolved complaints yet.</li>`;
        return;
      }
      snap.forEach(docSnap => myResolvedEl.appendChild(renderResolvedItem(docSnap.data())));
    }, (e) => console.error("myResolved error:", e));
  });
}
