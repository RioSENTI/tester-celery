async function registerUser() {
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();
  const key = document.getElementById("regKey").value.trim();
  const msg = document.getElementById("regMsg");

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass, invite: key })
  }).then(r => r.json());

  if (res.error) {
    msg.className = "error"; msg.innerText = res.error;
  } else {
    msg.className = "success"; msg.innerText = "Registered! Redirecting...";
    setTimeout(() => showLogin(), 1200);
  }
}

async function loginUser() {
  const user = document.getElementById("logUser").value.trim();
  const pass = document.getElementById("logPass").value.trim();
  const msg = document.getElementById("logMsg");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  }).then(r => r.json());

  if (res.error) {
    msg.className = "error"; msg.innerText = res.error;
  } else {
    localStorage.setItem("loggedInUser", res.username);
    msg.className = "success"; msg.innerText = "Login successful!";
    setTimeout(() => {
      loginBox.style.display = "none";
      downloadBox.style.display = "block";
      adminLink.style.display = ["celeryadmin","celeryowner"].includes(res.username) ? "block" : "none";
      document.getElementById("welcomeMsg").innerText = "Welcome, " + res.username + "!";
    }, 300);
  }
}
