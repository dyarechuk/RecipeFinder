const PROXY = "https://api.allorigins.win/raw?url=";
const API_URL = "https://dev-nespresso-test.pantheonsite.io/dynamic-api";

const recipeGrid = document.getElementById("recipeGrid");
const difficultyFilter = document.getElementById("difficultyFilter");
const timeFilter = document.getElementById("timeFilter");
const languageRadios = document.querySelectorAll('input[name="language"]');

let recipes = [];

async function fetchRecipes() {
  try {
    const res = await fetch(PROXY + encodeURIComponent(API_URL));
    if (!res.ok) throw new Error("Failed to fetch API");
    const data = await res.json();
    recipes = data || [];
    renderRecipes();
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

function renderRecipes() {
  const difficulty = difficultyFilter.value;
  const maxTime = parseInt(timeFilter.value);
  const langCode = [...languageRadios].find(r => r.checked).value;

  const languageMap = {
    en: "English",
    es: "Spanish",
  };

  const filtered = recipes.filter(recipe => {
    const langMatch = recipe.langcode === languageMap[langCode];
    const diffMatch = !difficulty || recipe.field_difficulty === difficulty;
    const timeMatch = isNaN(maxTime) || parseInt(recipe.field_cooking_time) <= maxTime;
    return langMatch && diffMatch && timeMatch;
  });

  recipeGrid.innerHTML = filtered.map(renderCard).join("");
}

function extractImageSrc(html) {
  const match = html.match(/<img[^>]*src="([^"]*)"/);
  return match ? match[1] : "";
}

function renderCard(recipe) {
  const imageSrc = extractImageSrc(recipe.field_media_image);
  const fullImageUrl = `https://dev-nespresso-test.pantheonsite.io${imageSrc}`;
  const recipeUrl = `https://dev-nespresso-test.pantheonsite.io${recipe.view_node}`;

  return `
    <div class="card">
      <img src="${fullImageUrl}" alt="${recipe.title}" />
      <div class="card-content">
        <h3>${recipe.title}</h3>
        <div class="card-tags">
          <span class="tag time"><i class="fa-regular fa-clock"></i> ${recipe.field_cooking_time}</span>
          <span class="tag difficulty ${recipe.field_difficulty.toLowerCase()}">
            <i class="fa-solid fa-signal"></i> ${recipe.field_difficulty}
          </span>
        </div>
        <a href="${recipeUrl}" target="_blank">View Recipe</a>
      </div>
    </div>
  `;
}

difficultyFilter.addEventListener("change", renderRecipes);
timeFilter.addEventListener("input", renderRecipes);
languageRadios.forEach(r => r.addEventListener("change", renderRecipes));

fetchRecipes();