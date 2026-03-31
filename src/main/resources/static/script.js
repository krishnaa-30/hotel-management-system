const API = window.location.origin + "/api";
let activeUser = "";
let userProfile = { email: "", phone: "" };
let targetRoomId = null;
let savedCin = "", savedCout = "", savedTotal = 0;

function nav(id) {
    document.querySelectorAll('.main > div').forEach(div => div.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('view-' + id).classList.remove('hidden');
    document.getElementById('nav-' + (id === 'guest-details' ? 'admin' : id)).classList.add('active');
    
    if(id === 'book') loadRooms();
    if(id === 'admin') loadAdminData();
}

async function register() {
    const user = { 
        username: document.getElementById('r-user').value,
        fullName: document.getElementById('r-name').value,
        email: document.getElementById('r-email').value,
        phoneNumber: document.getElementById('r-phone').value,
        password: document.getElementById('r-pass').value
    };
    if(!user.username || !user.password) return alert("Please fill required fields");
    
    userProfile.email = user.email;
    userProfile.phone = user.phoneNumber;
    
    try {
        await fetch(`${API}/register`, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(user) 
        });
        alert("Account Created! Please Login."); 
        nav('login');
    } catch(e) { alert("Registration failed. Check backend."); }
}

function login() {
    const user = document.getElementById('l-user').value;
    if(!user) return alert("Enter username");
    activeUser = user;
    document.getElementById('user-tag').innerText = "Guest: " + activeUser;
    nav('book');
}

async function loadRooms() {
    const res = await fetch(`${API}/rooms/available`);
    const rooms = await res.json();
    document.getElementById('room-grid').innerHTML = rooms.map(r => `
        <div class="card">
            <span class="status-badge bg-available">Available</span>
            <h3>Room ${r.roomNumber}</h3>
            <p>${r.type} Suite</p>
            <p style="font-weight:bold; color:var(--primary); font-size:1.2rem;">$${r.price}/night</p>
            <button class="btn btn-primary" onclick="initiatePayment(${r.id}, ${r.price})">Book Now</button>
        </div>
    `).join('');
}

function initiatePayment(id, price) {
    const c1 = document.getElementById('cin').value;
    const c2 = document.getElementById('cout').value;
    if(!c1 || !c2) return alert("Please select Check-in and Check-out dates!");
    
    savedCin = c1; savedCout = c2; targetRoomId = id;
    const nights = Math.ceil(Math.abs(new Date(c2) - new Date(c1)) / (1000 * 60 * 60 * 24));
    if(nights <= 0) return alert("Checkout must be after Check-in!");
    
    savedTotal = nights * price;
    document.getElementById('pay-summary').innerText = `Stay Total: $${savedTotal} (${nights} Nights)`;
    document.getElementById('payment-modal').style.display = 'flex';
}

async function confirmBooking() {
    const url = `${API}/rooms/book/${targetRoomId}?customerName=${activeUser}&checkIn=${savedCin}&checkOut=${savedCout}&email=${userProfile.email}&phone=${userProfile.phone}&amount=${savedTotal}`;
    const res = await fetch(url, { method: 'POST' });
    if(res.ok) {
        document.getElementById('payment-modal').style.display = 'none';
        alert("✅ Success! Your stay at KL Hotel is confirmed."); 
        loadRooms();
    }
}

async function loadAdminData() {
    const res = await fetch(`${API}/admin/rooms`);
    const rooms = await res.json();
    document.getElementById('admin-grid').innerHTML = rooms.map(r => `
        <div class="card" style="border-left: 6px solid ${r.available ? 'var(--success)' : 'var(--danger)'}">
            <span class="status-badge ${r.available ? 'bg-available' : 'bg-booked'}">${r.available ? 'Vacant' : 'Occupied'}</span>
            <h3>Room ${r.roomNumber}</h3>
            ${!r.available ? `<button class="btn btn-secondary" style="width:100%; margin-top:10px;" onclick='showGuestDossier(${JSON.stringify(r)})'>View Guest Info</button>` : '<p style="color:var(--text-light)">Available for guest</p>'}
        </div>
    `).join('');
}

function showGuestDossier(room) {
    nav('guest-details');
    document.getElementById('guest-profile-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
                <b>Guest Name</b><p>${room.bookedBy}</p>
                <b>Email Contact</b><p>${room.guestEmail || 'N/A'}</p>
                <b>Phone</b><p>${room.guestPhone || 'N/A'}</p>
            </div>
            <div>
                <b>Room Number</b><p>${room.roomNumber}</p>
                <b>Booking Period</b><p>${room.checkInDate} to ${room.checkOutDate}</p>
                <b>Total Amount Paid</b><p style="color:var(--success); font-weight:bold;">$${room.totalPaid}</p>
            </div>
        </div>
    `;
}

function closeModal() { document.getElementById('payment-modal').style.display = 'none'; }