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
    userProfile.email = user.email;
    userProfile.phone = user.phoneNumber;
    await fetch(`${API}/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(user) });
    alert("Success!"); nav('login');
}

function login() {
    activeUser = document.getElementById('l-user').value;
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
            <p>${r.type} - $${r.price}/night</p>
            <button class="btn btn-primary" onclick="initiatePayment(${r.id}, ${r.price})">Book Now</button>
        </div>
    `).join('');
}

function initiatePayment(id, price) {
    const c1 = document.getElementById('cin').value;
    const c2 = document.getElementById('cout').value;
    if(!c1 || !c2) return alert("Select dates!");
    
    savedCin = c1; savedCout = c2; targetRoomId = id;
    const nights = Math.ceil(Math.abs(new Date(c2) - new Date(c1)) / (1000 * 60 * 60 * 24));
    savedTotal = nights * price;
    
    document.getElementById('pay-summary').innerText = "Total for stay: $" + savedTotal;
    document.getElementById('payment-modal').style.display = 'flex';
}

async function confirmBooking() {
    const url = `${API}/rooms/book/${targetRoomId}?customerName=${activeUser}&checkIn=${savedCin}&checkOut=${savedCout}&email=${userProfile.email}&phone=${userProfile.phone}&amount=${savedTotal}`;
    const res = await fetch(url, { method: 'POST' });
    if(res.ok) {
        document.getElementById('payment-modal').style.display = 'none';
        alert("✅ Booked Successfully!"); loadRooms();
    }
}

async function loadAdminData() {
    const res = await fetch(`${API}/admin/rooms`);
    const rooms = await res.json();
    document.getElementById('admin-grid').innerHTML = rooms.map(r => `
        <div class="card" style="border-left: 6px solid ${r.available ? '#22c55e' : '#ef4444'}">
            <h3>Room ${r.roomNumber}</h3>
            <span class="status-badge ${r.available ? 'bg-available' : 'bg-booked'}">${r.available ? 'Vacant' : 'Occupied'}</span>
            ${!r.available ? `<button class="btn" style="margin-top:10px; background:#f1f5f9; color:#1e293b; width:100%" onclick='showGuestDossier(${JSON.stringify(r)})'>🔍 View Details</button>` : ''}
        </div>
    `).join('');
}

function showGuestDossier(room) {
    nav('guest-details');
    document.getElementById('guest-profile-content').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <p><b>Name:</b> ${room.bookedBy}</p>
                <p><b>Email:</b> ${room.guestEmail}</p>
                <p><b>Phone:</b> ${room.guestPhone}</p>
            </div>
            <div>
                <p><b>Room:</b> ${room.roomNumber}</p>
                <p><b>Stay:</b> ${room.checkInDate} to ${room.checkOutDate}</p>
                <p><b>Paid:</b> <span style="color:green">$${room.totalPaid}</span></p>
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('payment-modal').style.display = 'none';
}