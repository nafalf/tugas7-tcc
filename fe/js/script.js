// Ngambil elemen form
const formulir = document.querySelector("form");

// Bikin trigger event submit pada elemen form
formulir.addEventListener("submit", (e) => {
  e.preventDefault();

  // Ngambil elemen input
  const elemen_name = document.querySelector("#name");
  const elemen_date = document.querySelector("#date");
  const elemen_note = document.querySelector("#note");

  // Ngambil value (nim) dari elemen input
  const name = elemen_name.value;
  const date = elemen_date.value;
  const note = elemen_note.value;

  const id = elemen_name.dataset.id; // <- Khusus edit

  // Ngecek apakah harus POST atau PUT
  // Kalo id kosong, jadinya POST
  if (id == "") {
    // Tambah user
    axios
      .post(`${BASE_URL}/add-user`, { name, date, note })
      .then(() => {
        // bersihin formnya
        elemen_name.value = "";
        elemen_date.value = "";
        elemen_note.value = "";

        // manggil fungsi get user biar datanya di-refresh
        getUser();
      })
      .catch((error) => console.log(error.message)); // <- Kalo ada error
  } else {
    axios
      .put(`${BASE_URL}/edit-user/${id}`, { name, date, note })
      .then(() => {
        // bersihin formnya
        elemen_name.dataset.id = "";
        elemen_name.value = "";
        elemen_date.value = "";
        elemen_note.value = "";

        // manggil fungsi get user biar datanya direfresh
        getUser();
      })
      .catch((error) => console.log(error)); // <- Kalo ada error
  }
});

// GET User
async function getUser() {
  try {
    const { data } = await axios.get(`${BASE_URL}/users`);

    const table = document.querySelector("#table-user");
    let tampilan = "";
    let no = 1;

    for (const user of await data) {
      tampilan += tampilkanUser(no, user);
      no++;
    }
    table.innerHTML = tampilan;
    hapusUser();
    editUser();
  } catch (error) {
    console.log(error.message);
  }
}

function tampilkanUser(no, user) {
  return `
    <tr>
      <td>${no}</td>
      <td class="name">${user.name}</td>
      <td class="date">${user.date}</td>
      <td class="note">${user.note}</td>
      <td><button data-id=${user.id} class='btn-edit'>Edit</button></td>
      <td><button data-id=${user.id} class='btn-hapus'>Hapus</button></td>
    </tr>
  `;
}

function hapusUser() {
  const kumpulan_tombol_hapus = document.querySelectorAll(".btn-hapus");

  kumpulan_tombol_hapus.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      axios
        .delete(`${BASE_URL}/delete-user/${id}`)
        .then(() => getUser())
        .catch((error) => console.log(error));
    });
  });
}

function editUser() {
  const kumpulan_tombol_edit = document.querySelectorAll(".btn-edit");

  kumpulan_tombol_edit.forEach((tombol_edit) => {
    tombol_edit.addEventListener("click", () => {
      // Ngambil value yg ada di form
      const id = tombol_edit.dataset.id;
      const name =
        tombol_edit.parentElement.parentElement.querySelector(
          ".name"
        ).innerText;
      const date =
        tombol_edit.parentElement.parentElement.querySelector(
          ".date"
        ).innerText;
      const gender =
        tombol_edit.parentElement.parentElement.querySelector(
          ".note"
        ).innerText;

      // Ngambil [elemen] input
      const elemen_name = document.querySelector("#name");
      const elemen_date = document.querySelector("#date");
      const elemen_note = document.querySelector("#note");

      // Masukkin value yang ada di baris yang dipilih ke form
      elemen_name.dataset.id = id;
      elemen_name.value = name;
      elemen_date.value = date;
      elemen_note.value = note;
    });
  });
}

getUser();
