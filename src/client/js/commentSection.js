const videoContainer = document.getElementById("videoContainer");

const form = document.getElementById("commentForm");
const videoId = videoContainer.dataset.id;
let contentId;

function dateFormat(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    date.getFullYear() +
    "-" +
    month +
    "-" +
    day +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second
  );
}

const addComment = (text) => {
  const user = JSON.parse(videoContainer.dataset.user);
  const commentUl = document.querySelector(".video__comments ul");
  const li = document.createElement("li");
  const a = document.createElement("a");
  const img = document.createElement("img");
  const divText = document.createElement("div");
  const divTextUser = document.createElement("div");
  const aUser = document.createElement("a");
  const spanUser = document.createElement("span");
  const divTextComment = document.createElement("div");
  const i = document.createElement("i");

  li.className = "video__comment";
  divText.className = "text";
  divTextUser.className = "text--user";
  divTextComment.className = "text--comment";
  i.className = "fas fa-trash";
  a.setAttribute("href", `/users/${user._id}`);
  img.setAttribute("onerror", "this.src='/uploads/avatar/NoImage.png'");
  img.setAttribute("src", `/${user.avatarUrl}`);
  aUser.setAttribute("href", `/users/${user._id}`);
  i.setAttribute("data-id", contentId);

  aUser.innerText = user.name + " ";
  spanUser.innerText = dateFormat(new Date());
  divTextComment.innerText = text;

  commentUl.prepend(li);
  li.appendChild(a);
  li.appendChild(divText);
  li.appendChild(i);
  a.appendChild(img);
  divText.appendChild(divTextUser);
  divText.appendChild(divTextComment);
  divTextUser.appendChild(aUser);
  divTextUser.appendChild(spanUser);
};

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    if (!text) return;
    const res = await fetch(`/api/videos/${videoId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const obj = await res.json();
    contentId = obj.id;
    if (res.status === 201) addComment(text);
    textarea.value = "";
    deleteComment();
  });
}

const deleteComment = () => {
  const deleteComments = document.querySelectorAll(".fas.fa-trash");
  if (deleteComments.length > 0) {
    deleteComments.forEach((element) => {
      const id = element.dataset.id;
      element.addEventListener("click", () => {
        fetch(`/api/comment/${id}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const li = element.parentNode;
        li.parentNode.removeChild(li);
      });
    });
  }
};
deleteComment();
