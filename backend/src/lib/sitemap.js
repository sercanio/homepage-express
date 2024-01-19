const fs = require('fs');
const path = require('path');
const PostModel = require('../../models/Post');

const domain = "sercan.io";
async function getAllPostSlugs() {
  try {
    const posts = await PostModel.find({ isVisible: true }, 'slug');
    return posts.map(post => post.slug);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    throw error;
  }
}

async function isSlugInSitemap(slug, sitemapPath) {
  try {
    const sitemapContent = await fs.readFileSync(sitemapPath, 'utf8');
    return sitemapContent.includes(`<loc>https://sercan.io/post/${slug}</loc>`);
  } catch (error) {
    console.error('Error checking if slug is in sitemap:', error);
    throw error;
  }
}

async function appendToSitemap(slug, sitemapPath) {
  try {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    if (!await isSlugInSitemap(slug, sitemapPath)) {

      // Append new content for the specified post slug
      const newContent = `
      <url>
      <loc>https://${domain}/post/${slug}</loc>
      </url>
      `;

      // Insert the new content just before the closing </urlset> tag
      const updatedContent = sitemapContent.replace('</urlset>', newContent + '</urlset>');

      // Write the updated content back to the file
      fs.writeFileSync(sitemapPath, updatedContent, 'utf8');

      console.log(`Sitemap.xml updated successfully with the new post: ${slug}`);
    } else {
      console.log(`Post ${slug} already in sitemap.xml`);
    }
  } catch (error) {
    console.error('Error updating sitemap:', error);
    throw error;
  }
}

async function generateSitemap(slug) {
  try {
    const publicPath = path.join(__dirname, '../../public'); // Adjust this path based on your project structure
    const sitemapPath = path.join(publicPath, 'sitemap.xml');

    if (!fs.existsSync(sitemapPath)) {
      const slugs = await getAllPostSlugs();
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
              <loc>https://${domain}/</loc>
            </url>
            <url>
              <loc>https://${domain}/me</loc>
            </url>
            ${slugs.map(slug => `
              <url>
                <loc>https://${domain}/post/${slug}</loc>
              </url>
            `).join('')}
          </urlset>`;

      fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
      console.log('Sitemap.xml generated successfully.');
    } else {
      await appendToSitemap(slug, sitemapPath);
    }
  } catch (error) {
    console.error('Error generating or updating sitemap:', error);
  }
}

// Call the function to generate or update the sitemap
module.exports = generateSitemap;
