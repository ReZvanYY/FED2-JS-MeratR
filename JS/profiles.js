
if(!token){
    window.location.href = "/HTML/sign-in-page.html";
}

const currentUser = JSON.parse(localStorage.getItem("user"));
const apiKeyStorage = "apiKey";

async function getApiKey(){
    let apiKey = localStorage.getItem(apiKeyStorage);
    if(apiKey) return apiKey;

    const response = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
        }
    });

    if(!response.ok) throw new Error("Failed to generate key");
    const responsData = await response.json();

    apiKey = responsData.data.key;
    localStorage.setItem(apiKeyStorage, apiKey);
    return apiKey;
}

async function fetchProfile(){
    try{
        const apiKey = await getApiKey();
        const response = await fetch(`https://v2.api.noroff.dev/social/profiles/${currentUser.name}?_followers=true&_following=true&_posts=true`, {
            method: "GET",
            headers: {
                 Authorization: `Bearer ${token}`, 
                 "X-Noroff-API-Key": apiKey,
            }
        });
        if(!response.ok) throw new Error("Failed to fetch profile");
        const result = await response.json();

        renderProfile(result.data);
        renderUserPosts(result.data.posts || []);
    } catch(error){
        alert("Unable to render profile: " + error.message);
        console.error(error);
    }
}

function renderProfile(profile){
    const displayApp = document.getElementById("display-app");
    displayApp.innerHTML = "";

    const banner = document.createElement("div");
    banner.className = "h-48 w-full bg-cover bg-center";
    banner.style.backgroundImage = `url(${profile.banner?.url || 'https://i.imghippo.com/files/ZyN1996XVE.png'
    })`;
    displayApp.appendChild(banner);

    const profileInfo = document.createElement("div");
    profileInfo.className = "flex items-center gap-4 mt-4";

    const userAvatar = document.createElement("img");
    userAvatar.src = profile.avatar?.url || 'https://i.imghippo.com/files/ZyN1996XVE.png';
    userAvatar.alt = profile.avatar?.alt || 'Users profile picture.';
    userAvatar.className = "w-24 h-24 rounded-full";

    const textContainer = document.createElement("div");

    const nameElement = document.createElement("h2");
    nameElement.className = "text-xl font-bold";
    nameElement.textContent = profile.name;

    const followerCount = document.createElement("p");
    followerCount.textContent =`Followers: ${profile._count.followers}, Following: ${profile._count.following}`;

    textContainer.appendChild(nameElement);
    textContainer.appendChild(followerCount);

    profileInfo.appendChild(userAvatar);
    profileInfo.appendChild(textContainer);

    displayApp.appendChild(profileInfo);
}

    function renderUserPosts(posts){
        const displayApp = document.getElementById("display-app");

        const postsContainer = document.createElement("div");
        postsContainer.className = "mt-4"

        const title = document.createElement("h3");
        title.textContent = "Your Posts";
        title.className = "text-xl font-bold mb-2 mt-2";
        postsContainer.appendChild(title);
        
        if(!posts.length){
            const noPost = document.createElement("p");
            noPost.textContent = "No posts found!";
            postsContainer.appendChild(noPost);
        } else {
            posts.forEach(post => {
            
            const postLink = document.createElement("a")
            postLink.href = `/HTML/post-specific-page.html?id=${post.id}`;
            postLink.className = "block cursor-pointer";

            const postArticle = document.createElement("article");
            postArticle.className = "bg-white shadow rounded p-4 mb-4";

            const postTitle = document.createElement("h4");
            postTitle.textContent = post.title || "No title";
            postTitle.className = "font-semibold text-lg mb-2 mt-2";

            const postBodyText = document.createElement("p");
            postBodyText.textContent = post.body;

            postArticle.appendChild(postTitle);
            postArticle.appendChild(postBodyText);
            postLink.appendChild(postArticle);
            
            postsContainer.appendChild(postLink);
        });
    }
    displayApp.appendChild(postsContainer);

}

fetchProfile();
