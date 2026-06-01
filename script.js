import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFPXSM2GgZdzWZb_IRhZlbUrmL4TWqLxA",
  authDomain: "agendaweb-abeee.firebaseapp.com",
  projectId: "agendaweb-abeee",
  storageBucket: "agendaweb-abeee.firebasestorage.app",
  messagingSenderId: "175052698650",
  appId: "1:175052698650:web:dddc1afd4a33185039cda3",
  measurementId: "G-EJD1G12N8E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contactForm = document.getElementById("contactForm");
const contactId = document.getElementById("contactId");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const obsInput = document.getElementById("obs");
const contactsList = document.getElementById("contactsList");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const contactsCollection = collection(db, "contatos");

let allContacts = [];

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const contact = {
    nome: nameInput.value.trim(),
    telefone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    obs: obsInput.value.trim(),
    dtContato: serverTimestamp()
  };

  try {
    if (contactId.value) {
      const contactRef = doc(db, "contatos", contactId.value);
      await updateDoc(contactRef, contact);
      alert("Contato atualizado com sucesso!");
    } else {
      await addDoc(contactsCollection, contact);
      alert("Contato cadastrado com sucesso!");
    }

    clearForm();
  } catch (error) {
    alert("Erro ao salvar contato.");
    console.error(error);
  }
});

function loadContacts() {
  onSnapshot(contactsCollection, (snapshot) => {
    allContacts = [];

    snapshot.forEach((docItem) => {
      allContacts.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    renderContacts(allContacts);
  });
}

function renderContacts(contacts) {
  contactsList.innerHTML = "";

  if (contacts.length === 0) {
    contactsList.innerHTML = `<p class="empty">Nenhum contato cadastrado.</p>`;
    return;
  }

  contacts.forEach((contact) => {
    const card = document.createElement("div");
    card.classList.add("contact-card");

    card.innerHTML = `
      <h3>${contact.nome}</h3>
      <p><strong>Telefone:</strong> ${contact.telefone}</p>
      <p><strong>E-mail:</strong> ${contact.email}</p>
      <p><strong>Observação:</strong> ${contact.obs || "Sem observação"}</p>

      <div class="actions">
        <button class="edit">Editar</button>
        <button class="delete">Excluir</button>
      </div>
    `;

    const editBtn = card.querySelector(".edit");
    const deleteBtn = card.querySelector(".delete");

    editBtn.addEventListener("click", () => {
      editContact(contact.id, contact);
    });

    deleteBtn.addEventListener("click", () => {
      removeContact(contact.id);
    });

    contactsList.appendChild(card);
  });
}

function searchContacts() {
  const searchText = searchInput.value.trim().toLowerCase();

  const filteredContacts = allContacts.filter((contact) => {
    return contact.nome.toLowerCase().includes(searchText);
  });

  renderContacts(filteredContacts);
}

function editContact(id, contact) {
  contactId.value = id;
  nameInput.value = contact.nome;
  phoneInput.value = contact.telefone;
  emailInput.value = contact.email;
  obsInput.value = contact.obs || "";

  saveBtn.textContent = "Atualizar contato";
  cancelBtn.style.display = "block";
}

async function removeContact(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir este contato?");

  if (!confirmDelete) return;

  try {
    const contactRef = doc(db, "contatos", id);
    await deleteDoc(contactRef);
    alert("Contato excluído com sucesso!");
  } catch (error) {
    alert("Erro ao excluir contato.");
    console.error(error);
  }
}

function clearForm() {
  contactForm.reset();
  contactId.value = "";
  saveBtn.textContent = "Salvar contato";
  cancelBtn.style.display = "none";
}

searchBtn.addEventListener("click", searchContacts);

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderContacts(allContacts);
});

cancelBtn.addEventListener("click", clearForm);

loadContacts();