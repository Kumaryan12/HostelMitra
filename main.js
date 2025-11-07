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
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const provider = new GoogleAuthProvider();

// 🔧 replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyBgJy-24R3U5rVpoWRaDAmG0vRdQrV5u1E",
  authDomain: "hostelmitra-81b7d.firebaseapp.com",
  projectId: "hostelmitra-81b7d",
  storageBucket: "hostelmitra-81b7d.firebasestorage.app",
  messagingSenderId: "470662467889",
  appId: "1:470662467889:web:850db08f884148bec7e010",
  measurementId: "G-RMRPZZ0LF4"
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

  if (!name || !room || !description) {
    alert("Please fill all fields!");
    return;
  }

  try {
    await addDoc(collection(db, "complaints"), {
      name,
      room,
      category,
      description,
      visibility,           // 🆕 added
      status: "Pending",
      votes: 0,             // placeholder for future voting feature
      voters: [],           // placeholder for user IDs who voted
      timestamp: new Date().toISOString()
    });

    alert("Complaint submitted!");
    document.getElementById("description").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
};





if (publicIssuesList) {
  console.log("✅ Public issues listener initialized");

  // Query only public complaints, sorted by votes then timestamp
  const publicQuery = query(
    collection(db, "complaints"),
    where("visibility", "==", "public"),
    orderBy("votes", "desc"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(
    publicQuery,
    (snapshot) => {
      console.log("📥 Snapshot triggered:", snapshot.size, "docs");
      publicIssuesList.innerHTML = "";

      snapshot.forEach((docSnap) => {
        const c = docSnap.data();

        // Debug log to confirm retrieval
        console.log("Fetched:", c);

        const li = document.createElement("li");
        li.innerHTML = `
          <b>${c.category}</b> — ${c.description}<br>
          <small>
            Room: ${c.room} | Status: ${c.status} | Votes: ${c.votes ?? 0}
          </small>
        `;
        publicIssuesList.appendChild(li);
      });

      if (snapshot.empty) {
        publicIssuesList.innerHTML =
          "<li>No public complaints yet.</li>";
      }
    },
    (error) => {
      console.error("❌ Snapshot error:", error);
    }
  );
}





// ---------- Admin complaint view ----------
window.addEventListener("DOMContentLoaded", () => {
  const complaintsBody = document.getElementById("complaintsBody");
  const filterVisibility = document.getElementById("filterVisibility");
  const filterStatus = document.getElementById("filterStatus");
  if (!complaintsBody) return;

  console.log("✅ Admin dashboard initialized with visibility + status filters");

  let unsubscribe = null;

  function loadComplaints() {
    const visibility = filterVisibility.value;
    const status = filterStatus.value;
    const filters = [];

    // apply filters conditionally
    if (visibility !== "all") filters.push(where("visibility", "==", visibility));
    if (status !== "all") filters.push(where("status", "==", status));

    let q;
    if (filters.length > 0) {
      q = query(collection(db, "complaints"), ...filters, orderBy("timestamp", "desc"));
    } else {
      q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
    }

    // clean up old listener
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(q, (snapshot) => {
      complaintsBody.innerHTML = "";
      if (snapshot.empty) {
        complaintsBody.innerHTML =
          `<tr><td colspan="6">No complaints found for this filter.</td></tr>`;
        return;
      }

      snapshot.forEach((docSnap) => {
        const c = docSnap.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${c.name}</td>
          <td>${c.room}</td>
          <td>${c.category}</td>
          <td>${c.description}</td>
          <td>${c.status}</td>
          <td>
            ${
              c.status !== "Resolved"
                ? `<button onclick="updateStatus('${docSnap.id}', 'Resolved')">Mark Resolved</button>`
                : "✔ Done"
            }
          </td>`;
        complaintsBody.appendChild(row);
      });
    });
  }

  // initial load
  loadComplaints();

  // reload when any filter changes
  filterVisibility.addEventListener("change", loadComplaints);
  filterStatus.addEventListener("change", loadComplaints);
});

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





if (publicIssuesList) {
  

  const publicQuery = query(
   collection(db, "complaints"),
   where("visibility", "==", "public"),
   orderBy("votes", "desc"),
   orderBy("timestamp", "desc")
);



  onSnapshot(publicQuery, (snapshot) => {
    publicIssuesList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const c = docSnap.data();
      const id = docSnap.id;
      const li = document.createElement("li");

      li.innerHTML = `
        <b>${c.category}</b> — ${c.description}<br>
        <small>Status: ${c.status}</small><br>
        <button onclick="vote('${id}')">👍 ${c.votes ?? 0}</button>
      `;

      publicIssuesList.appendChild(li);
    });
  });
}


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

