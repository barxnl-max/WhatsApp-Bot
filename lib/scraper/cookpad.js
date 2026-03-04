const axios = require("axios");
const cheerio = require("cheerio");

class CookpadScraper {
  constructor() {
    this.baseURL = "https://cookpad.com";
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "id-ID,id;q=0.9",
      Referer: "https://cookpad.com/",
    };
  }

  async search(query, page = 1) {
    try {
      const url = `${this.baseURL}/id/cari/?q=${encodeURIComponent(query)}&page=${page}`;
      const { data } = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(data);
      const results = $("a[href^='/id/resep/']")
        .map((i, el) => {
          const link = this.baseURL + $(el).attr("href");
          const title = $(el).find("img").attr("alt")?.trim() || $(el).text().trim();
          const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || null;
          return { title, link, image };
        })
        .get()
        .filter((item) => item.title && item.title.length > 5)
        .slice(0, 20);

      return {
        status: true,
        total: results.length,
        data: results,
      };
    } catch (err) {
      return {
        status: false,
        message: err.message,
      };
    }
  }

  async getRecipe(url) {
    try {
      const { data } = await axios.get(url, { headers: this.headers });
      const jsonMatches = data.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
      );

      if (!jsonMatches) {
        return { status: false, message: "JSON-LD tidak ditemukan" };
      }

      let recipeData = null;
      for (const scriptTag of jsonMatches) {
        const jsonText = scriptTag
          .replace('<script type="application/ld+json">', "")
          .replace("</script>", "")
          .trim();
        try {
          const parsed = JSON.parse(jsonText);
          if (parsed["@type"] === "Recipe") {
            recipeData = parsed;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!recipeData) {
        return { status: false, message: "Recipe JSON tidak ditemukan" };
      }

      return {
        status: true,
        title: recipeData.name,
        image: Array.isArray(recipeData.image) ? recipeData.image[0] : recipeData.image,
        ingredients: recipeData.recipeIngredient || [],
        steps: (recipeData.recipeInstructions || []).map((s) =>
          typeof s === "string" ? s : s.text
        ),
        totalTime: recipeData.totalTime || null,
        servings: recipeData.recipeYield || null,
      };
    } catch (err) {
      return {
        status: false,
        message: err.message,
      };
    }
  }
}

module.exports = CookpadScraper;