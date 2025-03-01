let titleInput = document.getElementById("title");
let file = document.getElementById("file");
let saveBtn = document.getElementById("save");
let cancelBtn = document.getElementById("cancel");
let popup = document.getElementById("popup");
let menuToggle = document.getElementById("menu-toggle");
let sideNav = document.querySelector(".hamberger-menu nav");
let postContainer = document.querySelector(".blog-posts");

menuToggle.addEventListener("click", () => {
  sideNav.classList.toggle("show");
});

const toolbarOptions = [
  // font options
  [{ font: [] }],

  // text utilities
  ["bold", "italic", "underline", "strike"],

  // text colors and bg colors
  [{ color: [] }, { background: [] }],

  // lists
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

  // block quotes and code blocks
  ["blockquote", "code-block"],
];

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: toolbarOptions,
  },
});

saveBtn.addEventListener("click", async () => {
  let blogText = quill.root.innerHTML;
  let title = titleInput.value;
  let selectedFile = file.files[0];

  if (!title || !blogText) {
    alert("Title and content are required!");
    return;
  }

  console.log(selectedFile);

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", blogText);
  formData.append("file", selectedFile); // Attach the file

  let token = localStorage.getItem('token');

  try {
    const response = await fetch("http://localhost:3000/add-post", {
      method: "post",
      headers: {"Authorization": token},
      body: formData,
    });
    const result = await response.json();
    console.log(result);
    setTimeout(() => {
      closePopup();
    }, 1500);
  } catch (e) {
    console.error(e);
  }
});
function reset() {
  title.value = "";
  file.value = "";
  quill.root.innerHTML = "";
}

cancelBtn.addEventListener("click", reset);

function closePopup() {
  popup.classList.remove("open-popup");
  reset();
}

function openPopup() {
  popup.classList.add("open-popup");
  sideNav.classList.remove("show");
}

menuToggle.addEventListener("click", () => {
  document.body.classList.toggle("show-menu");
});

const renderPosts = async () => {
  const response = await fetch("http://localhost:3000/posts");
  const posts = await response.json();

  postContainer.innerHTML = "";
  posts.forEach((post) => {
    let postElement = document.createElement("div");
    postElement.classList.add("blog-post");
    postElement.innerHTML = `
    <div class="blog-head">
              <div class="img">
                <img src="../${post.image}" alt="image">
              </div>
              <div class="titles">
                <p>In Label</p>
                <h3>${post.title}</h3>
                <p><b>By</b> Ridho Satriawan</p>
              </div>
            </div>
            <div class="content">
              <div class="text">
                ${post.content}
              </div>
              <p class="date">22 August 2022</p>
            </div>
    `;
    postContainer.appendChild(postElement);
  });
};

renderPosts();


let blogsText = document.querySelectorAll(".content .text");

blogsText.forEach((text) => {
  text.addEventListener("click", () => {
    blogsText.forEach((t) => {
      t.classList.remove("active");
    });
    text.classList.add("active");
  });
});
