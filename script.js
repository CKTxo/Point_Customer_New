let currentPage = 1;
const rowsPerPage = 10;
let customers = JSON.parse(localStorage.getItem('customers')) || [];


const form = document.getElementById("formAdd");
const table = document.getElementById("customerTable");
const searchInput = document.getElementById("search");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const bottles = parseInt(document.getElementById("bottles").value);
  const price = parseFloat(document.getElementById("price").value);
  const date = document.getElementById("date").value;

  if (!name || !bottles || !price || !date) return;

  const existing = customers.find(c => c.name === name && c.date !== date);
  if (existing) {
    existing.bottles += bottles;
    existing.price += price;
    existing.date = date;
    existing.redeem = Math.floor(existing.bottles / 10);
  } else {
    let found = customers.find(c => c.name === name);
    if (found) {
      found.bottles += bottles;
      found.price += price;
      found.date = date;
      found.redeem = Math.floor(found.bottles / 10);
    } else {
      customers.push({ name, bottles, price, date, redeem: Math.floor(bottles / 10) });
    }
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  form.reset();
  currentPage = 1;
  showTable();
});

function showTable() {
  const keyword = searchInput.value.trim();
  const onlyReward = document.getElementById("onlyReward")?.checked || false;

  let filtered = customers.filter(c => {
    return c.name.includes(keyword) && (!onlyReward || c.redeem > 0);
  });

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = filtered.slice(start, end);

  table.innerHTML = "";
  paginatedData.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.bottles}</td>
      <td>${c.redeem}</td>
      <td>${c.price.toFixed(2)} บาท</td>
      <td>${c.date}</td>
      <td><input type="checkbox" onclick="openRedeem('${c.name}')"></td>
      <td><button class="btn btn-info btn-sm" onclick="openEdit('${c.name}')">แก้ไข</button></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.name}')">ลบ</button></td>
    `;
    table.appendChild(row);
  });

  renderPagination(filtered.length);
}



function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / rowsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Previous button
  const prevClass = currentPage === 1 ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${prevClass}">
      <button class="page-link" onclick="goToPage(${currentPage - 1})">ย้อนกลับ</button>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= pageCount; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${i})">${i}</button>
      </li>
    `;
  }

  // Next button
  const nextClass = currentPage === pageCount ? "disabled" : "";
  pagination.innerHTML += `
    <li class="page-item ${nextClass}">
      <button class="page-link" onclick="goToPage(${currentPage + 1})">ถัดไป</button>
    </li>
  `;
}

function goToPage(page) {
  const totalPages = Math.ceil(customers.length / rowsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  showTable();
}


function goToPage(page) {
  currentPage = page;
  showTable();
}


function goToPage(page) {
  currentPage = page;
  showTable();
}


function goToPage(page) {
  currentPage = page;
  showTable();
}



function openEdit(name) {
  const c = customers.find(x => x.name === name);
  if (!c) return;
  document.getElementById("editName").value = c.name;
  document.getElementById("editBottles").value = c.bottles;
  document.getElementById("editPrice").value = c.price;
  document.getElementById("editDate").value = c.date;
  new bootstrap.Modal(document.getElementById("editModal")).show();
}

document.getElementById("saveEdit").onclick = function () {
  const name = document.getElementById("editName").value;
  const bottles = parseInt(document.getElementById("editBottles").value);
  const price = parseFloat(document.getElementById("editPrice").value);
  const date = document.getElementById("editDate").value;
  const idx = customers.findIndex(c => c.name === name);
  customers[idx] = { name, bottles, price, date, redeem: Math.floor(bottles / 10) };
  localStorage.setItem("customers", JSON.stringify(customers));
  showTable();
  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
};

function deleteCustomer(name) {
  if (confirm("ต้องการลบข้อมูล?")) {
    customers = customers.filter(c => c.name !== name);
    localStorage.setItem("customers", JSON.stringify(customers));
    showTable();
  }
}

function openRedeem(name) {
  const c = customers.find(x => x.name === name);
  if (!c || c.redeem === 0) return alert("ไม่มีสิทธิ์ให้แลก");
  const select = document.getElementById("redeemAmount");
  document.getElementById("redeemName").value = name;
  select.innerHTML = "";
  for (let i = 1; i <= c.redeem; i++) {
    select.innerHTML += `<option value="${i}">${i}</option>`;
  }
  new bootstrap.Modal(document.getElementById("redeemModal")).show();
}

document.getElementById("confirmRedeem").onclick = function () {
  const name = document.getElementById("redeemName").value;
  const used = parseInt(document.getElementById("redeemAmount").value);
  const c = customers.find(x => x.name === name);
  if (!c || used > c.redeem) return;

  // ✅ ลบสิทธิ์แถม
  c.redeem -= used;

  // ✅ ลบขวดออกจากยอดตามการใช้สิทธิ์ (ใช้ 1 สิทธิ์ = ลบ 10 ขวด)
  c.bottles -= used * 10;
  if (c.bottles < 0) c.bottles = 0;

  // ✅ คำนวณสิทธิ์แถมใหม่
  c.redeem = Math.floor(c.bottles / 10);

  localStorage.setItem("customers", JSON.stringify(customers));
  showTable();
  bootstrap.Modal.getInstance(document.getElementById("redeemModal")).hide();
};

function filterRewardCustomer() {
  const name = document.getElementById("filterCustomer").value;
  if (!name) return;

  const filtered = customers.filter(c => c.name === name && c.redeem > 0);
  table.innerHTML = "";
  filtered.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.bottles}</td>
      <td>${c.redeem}</td>
      <td>${c.price.toFixed(2)} บาท</td>
      <td>${c.date}</td>
      <td><input type="checkbox" onclick="openRedeem('${c.name}')"></td>
      <td><button class="btn btn-sm btn-info" onclick="openEdit('${c.name}')">แก้ไข</button></td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.name}')">ลบ</button></td>
    `;
    table.appendChild(row);
  });
}

function resetFilter() {
  document.getElementById("filterCustomer").value = "";
  document.getElementById("search").value = "";
  showTable();
}

function showTable() {
table.innerHTML = "";

  // กรองตามคำค้นหา
const keyword = searchInput.value.trim();
const filtered = customers.filter(c => c.name.includes(keyword));
const start = (currentPage - 1) * rowsPerPage;
const end = start + rowsPerPage;
const paginatedData = filtered.slice(start, end);

  // เติม dropdown ลูกค้าที่มีสิทธิ์แถม
  const dropdown = document.getElementById("filterCustomer");
  dropdown.innerHTML = `<option value="">เลือกลูกค้าที่มีสิทธิ์แถม</option>`;
  customers.filter(c => c.redeem > 0).forEach(c => {
    dropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
  });

  filtered.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.bottles}</td>
      <td>${c.redeem}</td>
      <td>${c.price.toFixed(2)} บาท</td>
      <td>${c.date}</td>
      <td><input type="checkbox" onclick="openRedeem('${c.name}')"></td>
      <td><button class="btn btn-sm btn-info" onclick="openEdit('${c.name}')">แก้ไข</button></td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.name}')">ลบ</button></td>
    `;
    table.appendChild(row);
  });
}

function toggleOnlyReward() {
  const onlyReward = document.getElementById("onlyReward").checked;
  const keyword = searchInput.value.trim();

  const filtered = customers.filter(c => {
    const matchName = c.name.includes(keyword);
    const matchReward = onlyReward ? c.redeem > 0 : true;
    return matchName && matchReward;
  });

  table.innerHTML = "";
  filtered.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.bottles}</td>
      <td>${c.redeem}</td>
      <td>${c.price.toFixed(2)} บาท</td>
      <td>${c.date}</td>
      <td><input type="checkbox" onclick="openRedeem('${c.name}')"></td>
      <td><button class="btn btn-sm btn-info" onclick="openEdit('${c.name}')">แก้ไข</button></td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.name}')">ลบ</button></td>
    `;
    table.appendChild(row);
  });
}




searchInput.addEventListener("input", showTable);
searchInput.addEventListener("input", toggleOnlyReward);
showTable();
