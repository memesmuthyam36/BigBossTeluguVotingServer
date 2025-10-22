const mongoose = require("mongoose");
const Contestant = require("../models/Contestant");
const BlogPost = require("../models/BlogPost");
require("dotenv").config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/memes-muthyam"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Sample contestants data - using actual images from client/images folder
const sampleContestants = [
  {
    name: "Bharani",
    description:
      "Popular contestant with strong fan base and leadership qualities",
    image: "images/bharani.png",
    votes: 2456,
  },
  {
    name: "Divya",
    description:
      "Fan favorite with entertaining personality and excellent social skills",
    image: "images/divya.png",
    votes: 1892,
  },
  {
    name: "Pavan",
    description:
      "Task master with excellent physical abilities and competitive spirit",
    image: "images/pavan.png",
    votes: 2134,
  },
  {
    name: "Ramu",
    description:
      "Entertainment specialist bringing humor and positive vibes to the house",
    image: "images/ramu.png",
    votes: 1567,
  },
  {
    name: "Suman",
    description:
      "Strong competitor with dedicated fan base and consistent performance",
    image: "images/suman.png",
    votes: 1789,
  },
  {
    name: "Thanuja",
    description:
      "Dynamic player with strategic mind and excellent communication skills",
    image: "images/thanuja.png",
    votes: 1456,
  },
];

// Sample blog posts data
const sampleBlogPosts = [
  {
    title: "Top 10 Funniest Bigg Boss Memes This Week",
    slug: "top-10-memes",
    content: `
      <p>This week had some of the most hilarious moments in Bigg Boss Telugu history, and our amazing community has created some incredible memes to capture them!</p>
      
      <h3>1. The Kitchen Drama Meme</h3>
      <p>When Contestant 2 tried to cook and almost burned down the kitchen, the internet went wild! This meme perfectly captures that moment.</p>
      
      <h3>2. The Voting Confusion</h3>
      <p>Everyone was confused about the voting system this week, leading to this relatable meme that had us all laughing.</p>
      
      <p>Check out all the memes and vote for your favorites!</p>
    `,
    excerpt:
      "Check out the most hilarious memes that have been circulating about our favorite contestants this week...",
    featuredImage: "images/banner.png",
    category: "memes",
    tags: ["memes", "contestants", "funny"],
    author: "Admin",
    viewCount: 1240,
    shareCount: 89,
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(),
  },
  {
    title: "Weekly Contestant Performance Analysis",
    slug: "weekly-analysis",
    content: `
      <p>Another week of intense drama and competition in the Bigg Boss house. Let's analyze how each contestant performed this week.</p>
      
      <h3>Top Performers</h3>
      <p>Bharani has been showing excellent leadership skills and has maintained their position as a fan favorite.</p>
      
      <h3>Surprise Moments</h3>
      <p>Pavan's unexpected strategy this week surprised everyone, including other housemates!</p>
      
      <p>What do you think about this week's performances? Let us know in the comments!</p>
    `,
    excerpt:
      "Who's winning hearts and who's causing drama? Our detailed analysis of this week's performances...",
    featuredImage: "images/banner.png",
    category: "analysis",
    tags: ["analysis", "performance", "week"],
    author: "Admin",
    viewCount: 856,
    shareCount: 34,
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(),
  },
  {
    title: "Behind the Scenes: What You Don't See on TV",
    slug: "behind-scenes",
    content: `
      <p>Ever wondered what happens when the cameras are off in the Bigg Boss house? We have some exclusive insights for you!</p>
      
      <h3>The Real Story</h3>
      <p>While the show focuses on drama and competition, there are many heartwarming moments that happen off-camera.</p>
      
      <h3>Production Secrets</h3>
      <p>Learn about how the team manages to capture every important moment and keep the show running smoothly.</p>
      
      <p>This week, we got some insider information about what really goes on behind the scenes!</p>
    `,
    excerpt:
      "Exclusive insights into the making of Bigg Boss Telugu and what happens when cameras are off...",
    featuredImage: "images/banner.png",
    category: "behind-scenes",
    tags: ["behind-scenes", "exclusive", "production"],
    author: "Admin",
    viewCount: 2100,
    shareCount: 156,
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(),
  },
  {
    title:
      "Bigg Boss Telugu Voting Guide 2025 - How to Vote Online for Season 9",
    slug: "voting-guide",
    content: `
      <h2>Complete Guide to Bigg Boss Telugu Voting</h2>
      <p><strong>Bigg Boss Telugu voting</strong> is an essential part of the show that gives power to the audience to decide which contestants stay in the house. Bigg Boss Telugu Season 9, hosted by Nagarjuna Akkineni, has captivated millions of viewers across India.</p>
      
      <h3>Understanding the Voting System</h3>
      <p>The <strong>Bigg Boss Telugu voting</strong> system operates through multiple platforms, giving viewers flexibility in how they cast their votes. The official platform is Disney+ Hotstar, while community platforms allow fans to show support through unofficial polls.</p>
      
      <h3>How to Vote for Bigg Boss Telugu Online</h3>
      <h4>Method 1: Official Voting via Disney+ Hotstar</h4>
      <ol>
        <li>Download Disney+ Hotstar App from Google Play Store or Apple App Store</li>
        <li>Login or Sign Up with your credentials</li>
        <li>Find Bigg Boss Telugu 9 in the app</li>
        <li>Access the Voting Section</li>
        <li>Select your favorite nominated contestant</li>
        <li>Submit your vote (up to 10 votes per day)</li>
      </ol>
      
      <h4>Method 2: Community Voting</h4>
      <p>Visit our <a href="/voting.html">Bigg Boss Telugu voting page</a> to participate in community polls and show support for your favorite contestant!</p>
      
      <h3>Voting Rules 2025</h3>
      <ul>
        <li>You can cast up to 10 votes per day on the official Hotstar app</li>
        <li>Voting is only available for nominated contestants</li>
        <li>Voting typically starts Monday morning and closes Friday evening</li>
        <li>You must have a valid Disney+ Hotstar account to vote officially</li>
        <li>Voting is completely free on both official and fan platforms</li>
      </ul>
      
      <h3>Tips to Maximize Your Voting Impact</h3>
      <ul>
        <li><strong>Vote Daily:</strong> Use all 10 votes every day to maximize support</li>
        <li><strong>Share with Friends:</strong> Encourage friends and family to vote</li>
        <li><strong>Vote Early:</strong> Don't wait until Friday - vote throughout the week</li>
        <li><strong>Multiple Devices:</strong> Use different accounts from family members</li>
      </ul>
      
      <h3>FAQs About Bigg Boss Telugu Voting</h3>
      <p><strong>Q: Is Bigg Boss Telugu voting free?</strong><br>
      A: Yes! Voting is completely free on both Disney+ Hotstar and community platforms.</p>
      
      <p><strong>Q: How many times can I vote?</strong><br>
      A: You can vote up to 10 times per day on the official Hotstar app.</p>
      
      <p><strong>Q: When does voting close?</strong><br>
      A: Voting typically closes on Friday evening before the weekend elimination episode.</p>
      
      <p><strong>Ready to vote?</strong> Visit our <a href="/voting.html">Bigg Boss Telugu voting page</a> now and support your favorite contestant!</p>
    `,
    excerpt:
      "Complete guide to Bigg Boss Telugu voting 2025. Learn how to vote online, voting rules, tips to support your favorite contestant, and everything about Bigg Boss Telugu Season 9 voting process.",
    featuredImage: "images/banner.png",
    category: "news",
    tags: ["voting", "guide", "how-to", "bigg boss telugu", "season 9"],
    author: "Memes Muthyam",
    metaDescription:
      "Complete guide to Bigg Boss Telugu voting 2025. Learn how to vote online, voting rules, and tips to support your favorite contestant.",
    metaKeywords: [
      "bigg boss telugu voting",
      "bigg boss telugu vote online",
      "how to vote bigg boss telugu",
      "bigg boss voting guide",
      "bigg boss season 9 voting",
      "bigg boss telugu online voting",
    ],
    viewCount: 0,
    shareCount: 0,
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date("2025-10-22"),
  },
];

// Seed the database
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Contestant.deleteMany({});
    await BlogPost.deleteMany({});
    console.log("✅ Cleared existing data");

    // Insert sample contestants
    const contestants = await Contestant.insertMany(sampleContestants);
    console.log(`✅ Inserted ${contestants.length} contestants`);

    // Insert sample blog posts
    const blogPosts = await BlogPost.insertMany(sampleBlogPosts);
    console.log(`✅ Inserted ${blogPosts.length} blog posts`);

    console.log("🎉 Database seeding completed successfully!");

    // Print summary
    console.log("\n📊 Database Summary:");
    console.log(`- Contestants: ${contestants.length}`);
    console.log(`- Blog Posts: ${blogPosts.length}`);
    console.log(
      `- Total Votes: ${sampleContestants.reduce((sum, c) => sum + c.votes, 0)}`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seeding
(async () => {
  await connectDB();
  await seedDatabase();
})();
