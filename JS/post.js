if(!token){
    alert("You must signed in!")
    location.href = "/HTML/sign-in-page.html";
}
const displayApp = document.getElementById("display-app");
const params = new URLSearchParams(location.search);
const postId = params.get("id");

if(!postId){
    throw new Error("No post ID specified in URL");
}

const apiKeyStorage = "apikey";

async function getApiKey() {
    let apiKey = localStorage.getItem(apiKeyStorage);
    if(apiKey) return apiKey;

    const respons = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if(!respons.ok) throw new Error("Failed to generate API Key");

    const result = await respons.json();
    apiKey = result.data.key
    localStorage.setItem(apiKeyStorage, apiKey);
    return apiKey;
}

async function fetchPost() {
    try{
        const apiKey = await getApiKey();
        const respons = await fetch(`https://v2.api.noroff.dev/social/posts/${postId}?_author=true&_comments=true&_reactions=true`,{
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Noroff-API-Key": apiKey,
            },
        });
        if(!respons.ok) throw new Error("Failed to fetch post");

        const result = await respons.json();
        renderPost(result.data);
    }catch (error){
        console.error("Error fetching post: ", error);
        alert(error.message);
    }
}

function renderPost(post){
    const display = displayApp;
    display.textContent = "";

    const article = document.createElement("article");
    article.className = "bg-white p-4 shadow rounded mb-4";

    const authorDiv = document.createElement("div");
    authorDiv.className = "flex items-center gap-2 mb-4";

    const avatarImg = document.createElement("img");
    avatarImg.src = post.author?.avatar?.url || "https://i.imghippo.com/files/ZyN1996XVE.png";
    avatarImg.alt = post.author?.name
    avatarImg.className = "w-10 h-10 rounded-full cursor-pointer";

    avatarImg.addEventListener("click", () => {
        location.href = `/HTML/user-page.html?name=${post.author?.name}`;
    });

    const name = document.createElement("h4");
    name.textContent = post.author?.name;
    name.className = "font-semibold"

    authorDiv.appendChild(avatarImg);
    authorDiv.appendChild(name);

    const title = document.createElement("h5");
    title.textContent = post.title || "Untitled";
    title.className = "font-bold text-xl mb-2";

    const body = document.createElement("p");
    body.textContent = post.body;
    body.className = "mb-2";

    let likes = post._count.reactions || 0;
    const likeButton = document.createElement("button");
    likeButton.textContent =`❤️ ${likes}`;
    likeButton.className = "px-2 py-1 border rounded-full mb-4";

    likeButton.addEventListener("click", async () =>{
        try{
            const apiKey = await getApiKey();
            const respons = await fetch(`https://v2.api.noroff.dev/social/posts/${post.id}/react/❤️`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Noroff-API-Key": apiKey,
                }
            });
            if(!respons.ok) throw new Error("Failed to like post");

            const result = await respons.json();
            likes = result.data.reactions.find(r => r.symbol === "❤️")?.count || likes;
            likeButton.textContent = `❤️ ${likes}`;
        } catch (error) {
            console.error("Error liking the post", error.message);
            alert("Error liking the post ", error.message);
        }
    });

    const commentContainer = document.createElement("div");
    commentContainer.className = "mt-4";

    if(post.comments.length === 0){
        const noComment = document.createElement("p");
        noComment.textContent = "No comments yet";
        commentContainer.appendChild(noComment);
    } else {
        post.comments.forEach(comment => {
        const commentParagraph = document.createElement("p");
        commentParagraph.textContent = 
        `${comment.author?.name || comment.owner}: ${comment.body}`;
        commentParagraph.className = "border-b py-1";
        });
    }
    const inputContainer = document.createElement("div");
    inputContainer.className = "flex gap-2 mt-2";

    const commentInputField = document.createElement("input");
    commentInputField.type = "text";
    commentInputField.placeholder = "Add a comment";
    commentInputField.className = "px-2 py-1 border rounded bg-gray-200";
 
    const submitCommentButton = document.createElement("button");
    submitCommentButton.textContent = "COMMENT";
    submitCommentButton.className = "bg-[#B56F76] border-2 border-black text-black font-montserrat font-bold rounded-md p-2 mt-4 hover:bg-[#b56472] cursor-pointer";
}