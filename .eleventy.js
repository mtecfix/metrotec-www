module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("*.css");
  eleventyConfig.addPassthroughCopy("metrotec-logo.png");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("schema-*.json");
  eleventyConfig.addPassthroughCopy("_pagefind");

  // Blog collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog-src/posts/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Date filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  });

  // Excerpt filter
  eleventyConfig.addFilter("excerpt", function(content) {
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.substring(0, 160) + '...';
  });

  return {
    dir: {
      input: "blog-src",
      output: "blog",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
