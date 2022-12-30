const closeIcon = `

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
</svg>

`;
const getBlock = (id) => {
  return document.getElementById(id);
};
const postData = {
  title: "",
  body: "",
  tags: {},
};

const clearTag = (e) => {
  delete postData.tags[e.id];
  e.parentNode.remove();
  updatePublished();
};

const updatePublished = () => {
  if (Object.keys(postData.tags).length == 0) {
    getBlock("tags").classList.add("hidden");
  } else {
    getBlock("tags").classList.remove("hidden");
  }
};

const addNew = async (e) => {
  e.innerHTML = "POSTING...";
  postData.tags = Object.keys(postData.tags);
  await fetch("/add-new-post", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    crossdomain: true,
    withCredentials: "include",
    body: JSON.stringify(postData),
  }).then((res) => {
    if (res.status == 200) {
      location.href = "/";
    } else {
      e.innerHTML = "TRY AGAIN";
      alert("some error occoured");
    }
  });
};

const makePost = (e) => {
  addNew(e);
};

onload = async () => {
  getBlock("inp").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const tag = e.target.value;
      e.target.value = "";
      if (tag.length != 0 && tag != "" && tag != null && tag != undefined) {
        getBlock(
          "tags"
        ).innerHTML += `<span  class="searchItem">#${tag}<span class="close" onclick="clearTag(this)" id=${tag}>x</span></span>`;
        postData.tags[tag] = tag;
        updatePublished();
      }
    }
  });
  getBlock("blog-title").addEventListener("change", (e) => {
    postData.title = e.target.value;
  });
  getBlock("blog-body").addEventListener("change", (e) => {
    postData.body = e.target.value;
  });
  getBlock("secret").addEventListener("change", (e) => {
    postData.secret = e.target.value;
  });

  updatePublished();
};
