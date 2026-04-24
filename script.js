let cart = JSON.parse(localStorage.getItem("cart")) || [];

const WA_NUMBER = "628123456789"; // ganti nomor kamu (format: 62xxxx tanpa +)

function formatIDR(value){
    try{
        return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits: 0 }).format(value);
    } catch {
        return `Rp ${String(value)}`;
    }
}

function toast(message){
    const el = document.getElementById("toast");
    if(!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>{ el.hidden = true; }, 2200);
}

function setYear(){
    const y = document.getElementById("year");
    if(y) y.textContent = String(new Date().getFullYear());
}

function closeMobileNav(){
    const links = document.getElementById("navLinks");
    const t = document.getElementById("navToggle");
    if(links) links.classList.remove("open");
    if(t) t.setAttribute("aria-expanded","false");
}

function setupNav(){
    const t = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if(!t || !links) return;
    t.addEventListener("click", ()=>{
        const open = links.classList.toggle("open");
        t.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(a=>{
        a.addEventListener("click", closeMobileNav);
    });
    window.addEventListener("keydown", (e)=>{
        if(e.key === "Escape") closeMobileNav();
    });
}

// Tambah
function addToCart(nama, harga){
    let item = cart.find(i => i.nama === nama);

    if(item){
        item.qty++;
    } else {
        cart.push({nama, harga, qty:1, note: ""});
    }

    saveCart();
    toast(`Ditambahkan: ${nama}`);
    toggleCart(true);
}

// Simpan
function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// Render
function renderCart(){
    let container = document.getElementById("cartItems");
    let total = 0;
    let count = 0;
    const empty = document.getElementById("cartEmpty");

    if(!container) return;
    container.innerHTML = "";

    cart.forEach((item, i)=>{
        total += item.harga * item.qty;
        count += item.qty;

        const sub = `${formatIDR(item.harga)} • ${formatIDR(item.harga * item.qty)}`;
        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-main">
                    <div class="cart-item-name">${item.nama}</div>
                    <div class="cart-item-sub">${sub}</div>
                </div>
                <div class="qty" aria-label="Jumlah">
                    <button class="qty-btn" type="button" onclick="decrementQty(${i})" aria-label="Kurangi">−</button>
                    <div class="qty-count" aria-label="Qty">${item.qty}</div>
                    <button class="qty-btn" type="button" onclick="incrementQty(${i})" aria-label="Tambah">+</button>
                </div>
                <button class="cart-item-remove" type="button" onclick="removeItem(${i})" aria-label="Hapus item">Hapus</button>
            </div>
        `;
    });

    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("cartCount");
    if(totalEl) totalEl.innerText = formatIDR(total);
    if(countEl) countEl.innerText = String(count);
    if(empty) empty.hidden = cart.length !== 0;
}

// Hapus
function removeItem(i){
    cart.splice(i,1);
    saveCart();
}

function incrementQty(i){
    if(!cart[i]) return;
    cart[i].qty++;
    saveCart();
}

function decrementQty(i){
    if(!cart[i]) return;
    cart[i].qty--;
    if(cart[i].qty <= 0){
        cart.splice(i,1);
    }
    saveCart();
}

function clearCart(){
    cart = [];
    saveCart();
    toast("Keranjang dikosongkan");
}

// Toggle
function toggleCart(force){
    const panel = document.getElementById("cartPanel");
    const overlay = document.getElementById("overlay");
    if(!panel) return;
    const shouldOpen = typeof force === "boolean" ? force : !panel.classList.contains("active");
    panel.classList.toggle("active", shouldOpen);
    if(overlay) overlay.classList.toggle("active", shouldOpen);
}

// Checkout WA
function checkout(){
    let nama = document.getElementById("nama").value;
    let alamat = document.getElementById("alamat").value;
    let catatan = document.getElementById("catatan")?.value || "";

    if(!nama || !alamat){
        alert("Isi nama & alamat dulu!");
        return;
    }

    if(cart.length === 0){
        alert("Keranjang kosong!");
        return;
    }

    let pesan = `Halo, saya ${nama}\nAlamat: ${alamat}\n\nPesanan:\n`;

    cart.forEach(item=>{
        pesan += `- ${item.nama} x${item.qty} (${formatIDR(item.harga * item.qty)})\n`;
    });

    let total = cart.reduce((sum,i)=>sum+i.harga*i.qty,0);
    pesan += `\nTotal: ${formatIDR(total)}`;
    if(catatan.trim()){
        pesan += `\n\nCatatan: ${catatan.trim()}`;
    }

    let url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
}

function quickNote(nama){
    const note = prompt(`Catatan untuk ${nama} (opsional):`, "");
    if(note === null) return;
    const item = cart.find(i => i.nama === nama);
    if(item){
        item.note = String(note);
        saveCart();
        toast("Catatan disimpan");
        toggleCart(true);
    } else {
        toast("Tambahkan item dulu, lalu isi catatan.");
    }
}

// Load
setYear();
setupNav();
renderCart();