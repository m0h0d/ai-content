// Import required packages
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const slugify = require("slugify");
const path = require("path");
// @todo: use langchain: this will be a game changer

// Load the API key from the .env file
dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });


const openai = new OpenAIApi(configuration);

// Zpracovat argumenty příkazové řádky
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Kontrola zda argument začíná --
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value) {
        options[key] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return options;
}

// Získat cestu k nastavení
const cliOptions = parseCommandLineArgs();
const settingsPath = cliOptions.settings || "settings.json";
console.log(`Načítám nastavení z: ${settingsPath}`);

// Load properties from the settings.json file
let properties = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));

const defaultProps = {
    type: "Course",
    task: "Blog Article Writing",
    tone: "Passionate and Urgent",
    length: "Medium",
    domain: "Next.js",
    topic: "Getting started with Next.js: A beginner's guide",
    lang: "English",
    skill: "Intermediate",
    numArticles: 3
  };

  properties = { ...defaultProps, ...properties };

const usedSubjects = new Set();

async function readSubjectsFromFiles() {
  const directory = "content/posts";
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    if (file.endsWith(".mdx")) {
      const content = fs.readFileSync(`${directory}/${file}`, "utf-8");
      const descriptionMatch = content.match(/^description:\s*(.+)$/m);

      if (descriptionMatch) {
        usedSubjects.add(descriptionMatch[1]);
      }
    }
  });
}

async function generateCoverImageUrl(keyword, accessKey) {
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${accessKey}`);
    const data = await response.json();
    
    if (data && data.urls && data.urls.regular) {
      return data.urls.regular;
    } else {
      console.log("Unsplash API didn't return expected data format. Using fallback image.");
      // Fallback to a generic placeholder image
      return "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";
    }
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error.message);
    // Fallback to a generic placeholder image
    return "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";
  }
}

async function generateDescription(subject) {
  const prompt = `Generate an article short description for the subject ${subject} . Max allowed number of words is 40. Don't use the following characters: ":;{}[]()<>\/"`;
  
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that generates concise article descriptions." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return response.data.choices[0].message.content.trim();
}

async function generateSubject(domain) {
  const prompt = `Generate a blog article subject for the domain: ${domain}. Avoid these subjects: ${Array.from(usedSubjects).join(", ")}. Don't use the following characters :;{}[]()<>\"'`;
  
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that generates blog article subjects." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return response.data.choices[0].message.content.trim();
}

async function generateUniqueSubject(domain) {
  let subject;
  do {
    subject = await generateSubject(domain);
  } while (usedSubjects.has(subject));
  usedSubjects.add(subject);
  return subject;
}

async function generateArticle(properties) {

  let promptParts = [
    properties.type,
    properties.task,
    properties.tone,
    properties.length,
    `on ${properties.domain}`,
    `with the topic ${properties.topic}`,
    `writing in ${properties.lang}`,
    `to an audience with ${properties.skill} skill level`,
    `Provide code examples where applicable`,
    `include official references to ${properties.topic} with a link if applicable`,
    `include a cover image from ${properties.imgUrl} as a centered cover image`,
    `use markdown syntax`
  ];

  const filteredPromptParts = promptParts.filter((part) => part.trim() !== "");
  const prompt = "Write a " + filteredPromptParts.join(", ") + ".";
  
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that writes high-quality blog articles." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return response.data.choices[0].message.content.trim();
}

async function saveArticle(title, description, content) {
  const slug = slugify(title, { lower: true, strict: true });
  // @todo: retrieve path and extension from settings.json
  let fileName = `content/posts/${slug}.mdx`;

  const currentDate = new Date().toISOString().slice(0, 10);

  const articleContent = `---
title: ${title}
date: "${currentDate}"
description: ${description}
---
${content}`;

  fs.writeFileSync(fileName, articleContent);
  console.log(`Saved article: ${fileName}`);
}

(async () => {
  await readSubjectsFromFiles();

  const domain = properties.domain;
  let subject = await generateUniqueSubject(domain);
  let numArticles = parseInt(properties.numArticles);
  if(properties.topics &&  properties.topics.length > 0) {
      numArticles = properties.topics.length;
  }
  for (let i = 0; i < numArticles; i++) {
    if(properties.topics &&  typeof properties.topics[i] !== 'undefined') {
      subject = properties.topics[i];
    }
    console.log("Generated Subject:", subject);
    properties.topic = subject;
    let description = await generateDescription(subject);
    console.log("Generated Description:", description);
    const imgUrl = await generateCoverImageUrl(subject, process.env.UNSPLASH_ACCESS_KEY);
    properties.imgUrl = imgUrl;
    const article = await generateArticle(properties);

    saveArticle(subject, description, article);
  }
})();
