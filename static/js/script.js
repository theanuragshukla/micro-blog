const main = document.getElementById("blogs");
const searchData = {
  dateInp: false,
  authorInp: false,
  date: "10/2022",
  author: "anurag",
  exact: false,
  tags: {},
};
let next = null;
let prev = null;
let searchActive = false;
let blogs = [];
let ttlBlogs = 0;
let len = 0;
const searchRet = {
  ttl: 0,
  blogs: [],
  len: 0,
  next: null,
};

let cached = {
  len: 0,
  blogs: [],
};

const closeIcon = `

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
</svg>

`;
const searchIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
						</svg>
`;

const blog = ({ title, body, author, tags, time, date }) => {
  return `
<div class="blog">
				<div class="brdr brdrtp"></div>
				<div class="brdr brdrbtm"></div>
				<div class="heading">
					<h2># ${title}</h2>
				</div>
				<div class="body">
					<p>
					${body}
					</p>
				</div>
				<div class="footer">
					<div class="flex author">
						<p>
						Published on <span class="date">${date
              .substring(0, 10)
              .replaceAll(
                "-",
                "/"
              )}</span> at <span class="time">${time}</span> by <span class="name">@${author}</span>
						</p>
					</div>
					<div class="flex tags">
						tags: 
						${tags
              .map((tag) => {
                return `<span>#${tag}</span>`;
              })
              .join("")}
					</div>
				</div>
			</div>
	`;
};
const getBlock = (id) => {
  return document.getElementById(id);
};
const toggleElem = (id, elem = false) => {
  !elem ? getBlock(id).classList.toggle("hidden") : null;
  searchData[id] = !searchData[id];
  updatePublished();
};
const clearTag = (e) => {
  delete searchData.tags[e.id];
  e.parentNode.remove();
  updatePublished();
};
const toggleSearch = (e) => {
  getBlock("search").classList.toggle("hidden");
  getBlock("nextButton").classList.add("hidden");
  searchActive = !searchActive;
  e.innerHTML = searchActive ? closeIcon : searchIcon;
  main.innerHTML = "";
  getBlock("countTab").classList.toggle("hidden");
  if (searchActive) {
    searchRet.next = null;
  } else {
    next = null;
    blogs = [];
    getBlogs(true);
  }
};
const updatePublished = () => {
  if (searchData.dateInp || searchData.authorInp) {
    getBlock("publishData").innerHTML = `Published ${
      searchData.dateInp
        ? `in <span class="date" id="date">${searchData.date}</span>`
        : ""
    } ${
      searchData.authorInp
        ? `by <span class="name" id="authorName">@${searchData.author}</span>`
        : ""
    }`;
  } else {
    getBlock("publishData").innerHTML = "";
  }
  if (Object.keys(searchData.tags).length == 0) {
    getBlock("tags").classList.add("hidden");
  } else {
    getBlock("tags").classList.remove("hidden");
  }
};
const search = async (e) => {
  len = 0;
  getBlock("len").innerText = 0;
  if (searchRet.len >= searchRet.ttl && searchRet.ttl != 0) {
    getBlock("nextButton").classList.add("hidden");
    return;
  }
  getBlock("loadMore").classList.toggle("hidden");
  getBlock("spinner").classList.toggle("hidden");

  const data = JSON.parse(JSON.stringify(searchData));
  data.tags = Object.keys(data.tags);
  await fetch("/search", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    crossdomain: true,
    withCredentials: "include",
    body: JSON.stringify({ searchData: data, next: searchRet.next }),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status) {
        if (searchRet.next === null) {
          main.innerHTML = "";
        }
        searchRet.next = res.next;
        getBlock("ttl").innerText = res.ttl;
        searchRet.ttl = res.ttl;
        setPosts(res.items, true);
      }
    });
  getBlock("loadMore").classList.toggle("hidden");
  getBlock("spinner").classList.toggle("hidden");
};
const getBlogs = async (fwd = true) => {
  const cache = await sessionStorage.getItem("cache");
  cached = cache === null ? cached : JSON.parse(cache);
  if (
    cached !== null &&
    cached.len != 0 &&
    next !== cached.blogs[cached.len - 1]._id &&
    cached.blogs.length !== 0
  ) {
    setPosts();
    return;
  }
  console.log(cached);
  getBlock("loadMore").classList.toggle("hidden");
  getBlock("spinner").classList.toggle("hidden");
  await fetch("/blogs", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    crossdomain: true,
    withCredentials: "include",
    body: JSON.stringify({ next: fwd ? next : prev, fwd }),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status) {
        if (next === null) {
          main.innerHTML = "";
        }
        next = res.next;
        getBlock("ttl").innerText = res.ttl;
        ttlBlogs = res.ttl;
        setPosts(res.items);
      }
    });
  getBlock("loadMore").classList.toggle("hidden");
  getBlock("spinner").classList.toggle("hidden");
};

const setPosts = (items = [], search = false) => {
  if (search) {
    items.map((item) => {
      main.innerHTML += blog(item);
      searchRet.blogs.push(item);
      searchRet.len++;
    });
    getBlock("len").innerText = searchRet.len;
    return;
  }
  if (items.length == 0) {
    let start = 0;
    if (blogs.length != 0) {
      start = blogs.length;
    }
    for (let i = start; i < start + 20; i++) {
      main.innerHTML += blog(cached.blogs[i]);
      blogs.push(cached.blogs[i]);
      next = cached.blogs[i]._id;
      console.log(next);
    }
    getBlock("len").innerText = blogs.length;
  }
  const tempobj = {
    len: cached.blogs.length + items.length,
    blogs: [...cached.blogs, ...items],
  };
  sessionStorage.setItem("cache", JSON.stringify(tempobj));
  items.map((item) => {
    main.innerHTML += blog(item);
    blogs.push(item);
    len++;
  });
  getBlock("len").innerText = blogs.length;
};

onload = async () => {
  const cache = await sessionStorage.getItem("cache");
  cached = cache === null ? cached : JSON.parse(cache);
  getBlogs(true);
  getBlock("inp").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
      const tag = e.target.value;
      e.target.value = "";
      if (tag.length != 0 && tag != "" && tag != null && tag != undefined) {
        getBlock(
          "tags"
        ).innerHTML += `<span  class="searchItem">#${tag}<span class="close" onclick="clearTag(this)" id=${tag}>x</span></span>`;
        searchData.tags[tag] = tag;
        updatePublished();
      }
    }
  });
  getBlock("authorInp").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
      const tag = e.target.value;
      e.target.value = "";
      if (tag.length != 0 && tag != "" && tag != null && tag != undefined) {
        searchData.author = tag;
        updatePublished();
        getBlock("authorName").innerText = `@${tag}`;
      }
    }
  });
  getBlock("dateInp").addEventListener("change", (e) => {
    e.preventDefault();
    const val = e.target.value.split("-");
    const tag = val[1] + "/" + val[0];
    if (tag.length != 0 && tag != "" && tag != null && tag != undefined) {
      searchData.date = tag;
      updatePublished();
      getBlock("date").innerText = `${tag}`;
    }
  });

  getBlock("nextButton").addEventListener("click", (e) => {
    if (!searchActive) {
      getBlogs(true);
    } else {
      search();
    }
  });

  updatePublished();
};
