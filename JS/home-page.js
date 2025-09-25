//Get token from localStorage.
const token = localStorage.getItem("accessToken");
if (!token) {
  throw new Error("unable to find the token, user not signed in.");
}

//Fetch current user from the localStorage
const currentUser = JSON.parse(localStorage.getItem("user"));

//API URL
const postsApiUrl = "https://v2.api.noroff.dev/social/posts";
const apiKeyStorage = "apiKey";

// the function that checks if the user is signed in or not
function isSignedIn() {
  return !!token;
}

// checking if the user is signed in or not
if (!isSignedIn()) {
  window.location.href = "sign-in-page.html";
}

//API key dynamic Generation
async function getApiKey() {
  let apiKey = localStorage.getItem(apiKeyStorage);
  if (apiKey) return apiKey;
  if (!token) throw new Error("User not signed in");

  try {
    const apiKeyResponse = await fetch(
      "https://v2.api.noroff.dev/auth/create-api-key",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!apiKeyResponse.ok) throw new Error("Failed to generate API Key");

    const apiKeyResult = await apiKeyResponse.json();

    apiKey = apiKeyResult.data.key;
    localStorage.setItem(apiKeyStorage, apiKey);
    return apiKey;
  } catch (errorMessage) {
    console.error("Error creating API key: ", errorMessage);
    throw errorMessage;
  }
}

let userPosts = [];

//Fetch Posts from the API
async function fetchPosts() {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(postsApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) throw new Error("failed to fetch posts");
    const result = await response.json();

    userPosts = result.data || [];
    renderPosts();
} catch (error){
    displayArea.innerHTML = `<p class="text-red-700">Failed to load posts, please refresh the page (CTRL + R or CMD + R)</p>`;
    console.error(error);
}
}

// Connect to the html elements
const searchInput = document.getElementById("search");
const displayArea = document.getElementById("displayed-area");
const newPostButton = document.getElementById("create-a-new-post");
const postFormContainer = document.getElementById("post-form-container");
const postForm = document.getElementById("post-form");
const postContentInput = document.getElementById("post-content");

// Generation of a unique ID for each post, by taking the timestamp + a random number
function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

// function for displaying the posts.
function renderPosts() {
  displayArea.innerHTML = ""; //clear out all previous elements.

  if (posts.length === 0) {
    displayArea.textContent = `<p class="text-gray-500 mt-4" id="no-post-message">
            No posts yet! Be the first one to post!
    </p>`;
    return;
  }
  // Dynamically adding the elements needed for the posts as they get posted.
  posts.forEach((post) => {
    const articleElementForPost = document.createElement("article");
    articleElementForPost.className = "p-4 mb-4 rounded-lg bg-white shadow";

    const userInfoElement = document.createElement("div");
    userInfoElement.className = "flex items-center gap-2 mb-2";

    const userProfileImage = document.createElement("img");
    userProfileImage.src = post.author?.avatar?.url || currentUser.profileImage;
    userProfileImage.alt = `${post.user?.name} profile picture`;
    userProfileImage.className = "w-10 h-10 rounded-full";

    const userName = document.createElement("p");
    userName.textContent = post.user?.name;
    userName.className = "font-bold text-[2rem]";

    userInfoElement.appendChild(userProfileImage);
    userInfoElement.appendChild(userName);

    const postContent = document.createElement("p");
    postContent.textContent = post.body;
    postContent.className = "mb-2";

    const link = document.createElement("a");
    link.href = `post.html?id=${post.id}`;

    articleElementForPost.appendChild(userInfoElement);
    articleElementForPost.appendChild(postContent);
    articleElementForPost.appendChild(link);

    displayArea.appendChild(articleElementForPost);
  });
}
// Toggle the post form
newPostButton.addEventListener("click", () => {
  postFormContainer.classList.toggle("hidden");
});

// Submit a new post
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = postContentInput.value.trim();
  if (!token) return alert("You must be signed in to post");

  const newPost = {
    body: content,
  };
  try {
    const response = await fetch(postsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });
    if (!response.ok) throw new Error("Failed to post");

    postContentInput.value = "";
    postFormContainer.classList.add("hidden");

    //Reload the posts after a new post.
    fetchPosts();
  } catch (err) {
    alert("Error Posting: " + err.messsage);
    console.error(err);
  }
});
fetchPosts();
